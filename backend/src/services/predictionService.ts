import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface PredictionResult {
  winProbability: number;
  confidence: number;
  factors: {
    headToHead: number;
    recentForm: number;
    rankAdvantage: number;
    experience: number;
    physicalAdvantage: number;
  };
}

// ランクの重み付け
const rankWeights: { [key: string]: number } = {
  '横綱': 10,
  '大関': 9,
  '関脇': 8,
  '小結': 7,
  '前頭': 6,
  '十両': 5,
  '幕下': 4,
  '三段目': 3,
  '序二段': 2,
  '序ノ口': 1
};

export async function predictMatch(
  winnerId: string, 
  loserId: string, 
  tournament: string, 
  day: number
): Promise<PredictionResult> {
  try {
    // 両力士の情報を取得
    const [winner, loser] = await Promise.all([
      prisma.rikishi.findUnique({ where: { id: winnerId } }),
      prisma.rikishi.findUnique({ where: { id: loserId } })
    ]);

    if (!winner || !loser) {
      throw new Error('力士が見つかりません');
    }

    // 過去の対戦成績を取得
    const headToHead = await getHeadToHeadRecord(winnerId, loserId);
    
    // 最近の成績を取得
    const [winnerRecentForm, loserRecentForm] = await Promise.all([
      getRecentForm(winnerId, 10),
      getRecentForm(loserId, 10)
    ]);

    // ランクの優位性を計算
    const rankAdvantage = calculateRankAdvantage(winner.rank, loser.rank);

    // 経験の優位性を計算
    const experienceAdvantage = calculateExperienceAdvantage(winner.debutDate, loser.debutDate);

    // 体格の優位性を計算
    const physicalAdvantage = calculatePhysicalAdvantage(winner, loser);

    // 各要因の重み付け
    const factors = {
      headToHead: headToHead.winRate * 0.3,
      recentForm: (winnerRecentForm.winRate - loserRecentForm.winRate) * 0.25,
      rankAdvantage: rankAdvantage * 0.2,
      experience: experienceAdvantage * 0.15,
      physicalAdvantage: physicalAdvantage * 0.1
    };

    // 総合的な勝率を計算
    const baseProbability = 0.5 + 
      factors.headToHead + 
      factors.recentForm + 
      factors.rankAdvantage + 
      factors.experience + 
      factors.physicalAdvantage;

    const winProbability = Math.max(0.1, Math.min(0.9, baseProbability));

    // 信頼度を計算（データの量と質に基づく）
    const confidence = calculateConfidence(headToHead.totalMatches, winnerRecentForm.totalMatches, loserRecentForm.totalMatches);

    return {
      winProbability,
      confidence,
      factors
    };
  } catch (error) {
    console.error('予測エラー:', error);
    // デフォルト値を返す
    return {
      winProbability: 0.5,
      confidence: 0.3,
      factors: {
        headToHead: 0,
        recentForm: 0,
        rankAdvantage: 0,
        experience: 0,
        physicalAdvantage: 0
      }
    };
  }
}

async function getHeadToHeadRecord(winnerId: string, loserId: string) {
  const matches = await prisma.matchResult.findMany({
    where: {
      OR: [
        { winnerId, loserId },
        { winnerId: loserId, loserId: winnerId }
      ]
    }
  });

  const winnerWins = matches.filter(m => m.winnerId === winnerId).length;
  const totalMatches = matches.length;

  return {
    winnerWins,
    totalMatches,
    winRate: totalMatches > 0 ? winnerWins / totalMatches : 0.5
  };
}

async function getRecentForm(rikishiId: string, matchCount: number) {
  const matches = await prisma.matchResult.findMany({
    where: {
      OR: [
        { winnerId: rikishiId },
        { loserId: rikishiId }
      ]
    },
    orderBy: { createdAt: 'desc' },
    take: matchCount
  });

  const wins = matches.filter(m => m.winnerId === rikishiId).length;
  const totalMatches = matches.length;

  return {
    wins,
    totalMatches,
    winRate: totalMatches > 0 ? wins / totalMatches : 0.5
  };
}

function calculateRankAdvantage(winnerRank: string, loserRank: string): number {
  const winnerWeight = rankWeights[winnerRank] || 5;
  const loserWeight = rankWeights[loserRank] || 5;
  
  const difference = winnerWeight - loserWeight;
  return Math.tanh(difference * 0.1); // -1 から 1 の範囲に正規化
}

function calculateExperienceAdvantage(winnerDebut: Date, loserDebut: Date): number {
  const winnerExperience = Date.now() - winnerDebut.getTime();
  const loserExperience = Date.now() - loserDebut.getTime();
  
  const difference = winnerExperience - loserExperience;
  const yearsDifference = difference / (1000 * 60 * 60 * 24 * 365);
  
  return Math.tanh(yearsDifference * 0.2); // -1 から 1 の範囲に正規化
}

function calculatePhysicalAdvantage(winner: any, loser: any): number {
  // 身長と体重の組み合わせで体格優位性を計算
  const heightAdvantage = (winner.height - loser.height) / 200; // 身長差を正規化
  const weightAdvantage = (winner.weight - loser.weight) / 100; // 体重差を正規化
  
  return Math.tanh((heightAdvantage + weightAdvantage) * 0.5);
}

function calculateConfidence(headToHeadMatches: number, winnerRecentMatches: number, loserRecentMatches: number): number {
  // データの量に基づいて信頼度を計算
  const totalDataPoints = headToHeadMatches + winnerRecentMatches + loserRecentMatches;
  
  if (totalDataPoints === 0) return 0.1;
  if (totalDataPoints < 5) return 0.3;
  if (totalDataPoints < 10) return 0.5;
  if (totalDataPoints < 20) return 0.7;
  
  return Math.min(0.95, 0.7 + (totalDataPoints - 20) * 0.01);
} 