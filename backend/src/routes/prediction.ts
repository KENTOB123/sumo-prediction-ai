import express from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { predictMatch } from '../services/predictionService';

const router = express.Router();
const prisma = new PrismaClient();

// 認証ミドルウェア
const authenticateToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
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
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
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
          loser: true
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
          loser: true
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
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
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

// 特定の予測の取得
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;

    const prediction = await prisma.prediction.findUnique({
      where: { id },
      include: {
        winner: true,
        loser: true,
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

export default router; 