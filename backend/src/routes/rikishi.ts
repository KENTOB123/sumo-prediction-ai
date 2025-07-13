import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// 全力士の取得
router.get('/', async (req, res) => {
  try {
    const rikishi = await prisma.rikishi.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            winsAsWinner: true,
            lossesAsLoser: true
          }
        }
      },
      orderBy: { shikona: 'asc' }
    });

    res.json(rikishi);
  } catch (error) {
    console.error('力士取得エラー:', error);
    res.status(500).json({ error: '力士情報の取得中にエラーが発生しました' });
  }
});

// 特定の力士の詳細情報
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const rikishi = await prisma.rikishi.findUnique({
      where: { id },
      include: {
        winsAsWinner: {
          include: {
            loser: true
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        lossesAsLoser: {
          include: {
            winner: true
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    if (!rikishi) {
      return res.status(404).json({ error: '力士が見つかりません' });
    }

    res.json(rikishi);
  } catch (error) {
    console.error('力士詳細取得エラー:', error);
    res.status(500).json({ error: '力士詳細の取得中にエラーが発生しました' });
  }
});

// 力士の対戦成績
router.get('/:id/matches', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const matches = await prisma.matchResult.findMany({
      where: {
        OR: [
          { winnerId: id },
          { loserId: id }
        ]
      },
      include: {
        winner: true,
        loser: true
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    res.json(matches);
  } catch (error) {
    console.error('対戦成績取得エラー:', error);
    res.status(500).json({ error: '対戦成績の取得中にエラーが発生しました' });
  }
});

// 力士の統計情報
router.get('/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;

    const stats = await prisma.rikishiStats.findUnique({
      where: { rikishiId: id }
    });

    if (!stats) {
      return res.status(404).json({ error: '統計情報が見つかりません' });
    }

    res.json(stats);
  } catch (error) {
    console.error('統計情報取得エラー:', error);
    res.status(500).json({ error: '統計情報の取得中にエラーが発生しました' });
  }
});

// 力士の検索
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;

    const rikishi = await prisma.rikishi.findMany({
      where: {
        OR: [
          { shikona: { contains: query, mode: 'insensitive' } },
          { stable: { contains: query, mode: 'insensitive' } }
        ],
        isActive: true
      },
      take: 10
    });

    res.json(rikishi);
  } catch (error) {
    console.error('力士検索エラー:', error);
    res.status(500).json({ error: '力士検索中にエラーが発生しました' });
  }
});

export default router; 