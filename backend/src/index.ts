import jwt from 'jsonwebtoken';
import express, { Request } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
// import { PrismaClient } from '@prisma/client';

// ルーターのインポート
import authRoutes from './routes/auth';
import rikishiRoutes from './routes/rikishi';
import predictionRoutes from './routes/prediction';
import paymentRoutes from './routes/payment';

// 追加
interface AuthenticatedRequest extends Request {
  user?: any;
}

// 環境変数の読み込み
dotenv.config();

const app = express();
// const prisma = new PrismaClient();
const PORT = process.env.PORT || 8000;

// ポートが使用中の場合はエラーメッセージを表示
app.listen(PORT, () => {
  console.log(`🚀 サーバーがポート${PORT}で起動しました`);
  console.log(`📊 ヘルスチェック: http://localhost:${PORT}/health`);
}).on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ ポート${PORT}は既に使用中です。以下のコマンドで停止してください:`);
    console.error(`   lsof -ti:${PORT} | xargs kill -9`);
    process.exit(1);
  } else {
    console.error('❌ サーバー起動エラー:', err);
    process.exit(1);
  }
});

// ミドルウェア
app.use(helmet());

// 例: 3000-3011 すべて許可
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'http://localhost:3004',
  'http://localhost:3005',
  'http://localhost:3006',
  'http://localhost:3007',
  'http://localhost:3008',
  'http://localhost:3009',
  'http://localhost:3010',
  'http://localhost:3011',
  'http://localhost:3012',
  'http://localhost:3013'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// プリフライトリクエスト（OPTIONS）対応
app.options('*', cors());

// レート制限
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15分
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // 最大100リクエスト
  message: 'リクエストが多すぎます。しばらく待ってから再試行してください。'
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 認証ミドルウェア
const authenticateToken = (req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'トークンがありません' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'トークンが無効です' });
  }
};

// ヘルスチェック
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ルーター
app.use('/api/auth', authRoutes);
app.use('/api/rikishi', rikishiRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/payments', paymentRoutes);

// 404ハンドラー
app.use('*', (req, res) => {
  res.status(404).json({ error: 'エンドポイントが見つかりません' });
});

// エラーハンドラー
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'サーバー内部エラーが発生しました' });
});

// サーバー起動は上記で処理済み

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