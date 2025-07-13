import express, { Request } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { predictMatch } from '../services/predictionService';

// Request型の拡張
interface AuthenticatedRequest extends Request {
  user?: any;
}

const router = express.Router();
const prisma = new PrismaClient();

// 認証ミドルウェア
const authenticateToken = (req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: '認証トークンが必要です' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: '無効なトークンです' });
  }
};

// 予測の取得（課金制限付き）
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.userId;
    const { tournament, day } = req.query;

    // ユーザーの課金状況を確認
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'ユーザーが見つかりません' });
    }

    let predictions;
    
    if (user.isPremium) {
      // プレミアムユーザーは全ての予測を取得
      predictions = await prisma.prediction.findMany({
        where: {
          tournament: tournament as string,
          day: parseInt(day as string)
        },
        include: {
          winner: true,
          loser: true,
          actualWinner: true
        },
        orderBy: { winProbability: 'desc' }
      });
    } else {
      // 無課金ユーザーは月3力士まで
      const monthlyPredictions = await prisma.prediction.findMany({
        where: {
          userId,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        },
        distinct: ['winnerId']
      });

      if (monthlyPredictions.length >= 3) {
        return res.status(403).json({ 
          error: '無課金プランでは月3力士までです。プレミアムにアップグレードしてください。',
          upgradeRequired: true
        });
      }

      predictions = await prisma.prediction.findMany({
        where: {
          userId,
          tournament: tournament as string,
          day: parseInt(day as string)
        },
        include: {
          winner: true,
          loser: true,
          actualWinner: true
        },
        orderBy: { winProbability: 'desc' }
      });
    }

    res.json(predictions);
  } catch (error) {
    console.error('予測取得エラー:', error);
    res.status(500).json({ error: '予測の取得中にエラーが発生しました' });
  }
});

// 新しい予測の作成
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.userId;
    const { winnerId, loserId, tournament, day } = req.body;

    // ユーザーの課金状況を確認
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'ユーザーが見つかりません' });
    }

    if (!user.isPremium) {
      // 無課金ユーザーの月間制限チェック
      const monthlyPredictions = await prisma.prediction.findMany({
        where: {
          userId,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        },
        distinct: ['winnerId']
      });

      if (monthlyPredictions.length >= 3) {
        return res.status(403).json({ 
          error: '無課金プランでは月3力士までです。プレミアムにアップグレードしてください。',
          upgradeRequired: true
        });
      }
    }

    // AI予測の実行
    const prediction = await predictMatch(winnerId, loserId, tournament, day);

    // 予測をデータベースに保存
    const savedPrediction = await prisma.prediction.create({
      data: {
        userId,
        winnerId,
        loserId,
        winProbability: prediction.winProbability,
        confidence: prediction.confidence,
        factors: prediction.factors,
        tournament,
        day
      },
      include: {
        winner: true,
        loser: true
      }
    });

    res.status(201).json(savedPrediction);
  } catch (error) {
    console.error('予測作成エラー:', error);
    res.status(500).json({ error: '予測の作成中にエラーが発生しました' });
  }
});

// 予測結果の記録
router.put('/:id/result', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { actualWinnerId } = req.body;
    const userId = req.user!.userId;

    // 予測を取得
    const prediction = await prisma.prediction.findUnique({
      where: { id }
    });

    if (!prediction) {
      return res.status(404).json({ error: '予測が見つかりません' });
    }

    // 自分の予測のみ結果を記録可能
    if (prediction.userId !== userId) {
      return res.status(403).json({ error: 'アクセス権限がありません' });
    }

    // 既に結果が記録されているかチェック
    if (prediction.resultRecordedAt) {
      return res.status(400).json({ error: '既に結果が記録されています' });
    }

    const isCorrect = actualWinnerId === prediction.winnerId;

    // 予測結果を更新
    const updatedPrediction = await prisma.prediction.update({
      where: { id },
      data: {
        actualWinnerId,
        isCorrect,
        resultRecordedAt: new Date()
      },
      include: {
        winner: true,
        loser: true,
        actualWinner: true
      }
    });

    // ユーザーの統計を更新
    await updateUserPredictionStats(userId);

    res.json(updatedPrediction);
  } catch (error) {
    console.error('予測結果記録エラー:', error);
    res.status(500).json({ error: '予測結果の記録中にエラーが発生しました' });
  }
});

// ユーザーの予測履歴
router.get('/history', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.userId;
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const predictions = await prisma.prediction.findMany({
      where: { userId },
      include: {
        winner: true,
        loser: true,
        actualWinner: true
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit as string)
    });

    const total = await prisma.prediction.count({
      where: { userId }
    });

    res.json({
      predictions,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('予測履歴取得エラー:', error);
    res.status(500).json({ error: '予測履歴の取得中にエラーが発生しました' });
  }
});

// ユーザーの統計情報
router.get('/stats', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.userId;

    const stats = await prisma.userPredictionStats.findUnique({
      where: { userId }
    });

    if (!stats) {
      return res.json({
        totalPredictions: 0,
        correctPredictions: 0,
        accuracy: 0,
        currentStreak: 0,
        bestStreak: 0
      });
    }

    res.json(stats);
  } catch (error) {
    console.error('統計情報取得エラー:', error);
    res.status(500).json({ error: '統計情報の取得中にエラーが発生しました' });
  }
});

// 的中率ランキング
router.get('/ranking', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { limit = 10 } = req.query;

    const ranking = await prisma.userPredictionStats.findMany({
      where: {
        totalPredictions: {
          gte: 5 // 最低5回の予測が必要
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            isPremium: true
          }
        }
      },
      orderBy: [
        { accuracy: 'desc' },
        { totalPredictions: 'desc' }
      ],
      take: parseInt(limit as string)
    });

    res.json(ranking);
  } catch (error) {
    console.error('ランキング取得エラー:', error);
    res.status(500).json({ error: 'ランキングの取得中にエラーが発生しました' });
  }
});

// 特定の予測の取得
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const prediction = await prisma.prediction.findUnique({
      where: { id },
      include: {
        winner: true,
        loser: true,
        actualWinner: true,
        user: {
          select: {
            id: true,
            name: true,
            isPremium: true
          }
        }
      }
    });

    if (!prediction) {
      return res.status(404).json({ error: '予測が見つかりません' });
    }

    // 自分の予測またはプレミアムユーザーのみアクセス可能
    if (prediction.userId !== userId && !(prediction.user as any).isPremium) {
      return res.status(403).json({ error: 'アクセス権限がありません' });
    }

    res.json(prediction);
  } catch (error) {
    console.error('予測詳細取得エラー:', error);
    res.status(500).json({ error: '予測詳細の取得中にエラーが発生しました' });
  }
});

// ユーザーの予測統計を更新する関数
async function updateUserPredictionStats(userId: string) {
  const predictions = await prisma.prediction.findMany({
    where: {
      userId,
      resultRecordedAt: { not: null }
    },
    orderBy: { resultRecordedAt: 'asc' }
  });

  const totalPredictions = predictions.length;
  const correctPredictions = predictions.filter(p => p.isCorrect).length;
  const accuracy = totalPredictions > 0 ? correctPredictions / totalPredictions : 0;

  // 連続的中数を計算
  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;

  for (let i = predictions.length - 1; i >= 0; i--) {
    if (predictions[i].isCorrect) {
      tempStreak++;
      if (i === predictions.length - 1) {
        currentStreak = tempStreak;
      }
    } else {
      tempStreak = 0;
    }
    bestStreak = Math.max(bestStreak, tempStreak);
  }

  // 統計を更新または作成
  await prisma.userPredictionStats.upsert({
    where: { userId },
    update: {
      totalPredictions,
      correctPredictions,
      accuracy,
      currentStreak,
      bestStreak,
      lastUpdated: new Date()
    },
    create: {
      userId,
      totalPredictions,
      correctPredictions,
      accuracy,
      currentStreak,
      bestStreak
    }
  });
}

export default router; 