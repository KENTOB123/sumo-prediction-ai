import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
// import { PrismaClient } from '@prisma/client';

// ルーターのインポート
// import authRoutes from './routes/auth';
// import rikishiRoutes from './routes/rikishi';
// import predictionRoutes from './routes/prediction';
// import paymentRoutes from './routes/payment';

// 環境変数の読み込み
dotenv.config();

const app = express();
// const prisma = new PrismaClient();
const PORT = process.env.PORT || 8000;

// ミドルウェア
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// レート制限
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15分
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // 最大100リクエスト
  message: 'リクエストが多すぎます。しばらく待ってから再試行してください。'
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ヘルスチェック
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ルーター
// app.use('/api/auth', authRoutes);
// app.use('/api/rikishi', rikishiRoutes);
// app.use('/api/predictions', predictionRoutes);
// app.use('/api/payments', paymentRoutes);

// 404ハンドラー
app.use('*', (req, res) => {
  res.status(404).json({ error: 'エンドポイントが見つかりません' });
});

// エラーハンドラー
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'サーバー内部エラーが発生しました' });
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`🚀 サーバーがポート${PORT}で起動しました`);
  console.log(`📊 ヘルスチェック: http://localhost:${PORT}/health`);
});

// グレースフルシャットダウン
process.on('SIGTERM', async () => {
  console.log('SIGTERMを受信しました。サーバーをシャットダウンします...');
  // await prisma.$disconnect(); // コメントアウトしたため、この行は削除
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINTを受信しました。サーバーをシャットダウンします...');
  // await prisma.$disconnect(); // コメントアウトしたため、この行は削除
  process.exit(0);
});

export default app; 