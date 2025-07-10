import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// ユーザー登録
router.post('/register', [
  body('email').isEmail().withMessage('有効なメールアドレスを入力してください'),
  body('password').isLength({ min: 6 }).withMessage('パスワードは6文字以上で入力してください'),
  body('name').notEmpty().withMessage('名前を入力してください')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name } = req.body;

    // 既存ユーザーのチェック
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'このメールアドレスは既に登録されています' });
    }

    // パスワードのハッシュ化
    const hashedPassword = await bcrypt.hash(password, 12);

    // ユーザーの作成
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name
      }
    });

    // JWTトークンの生成
    const secret = process.env.JWT_SECRET || 'fallback-secret';
    const token = jwt.sign(
      { userId: user.id, email: user.email } as any,
      secret as any,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as any
    );

    res.status(201).json({
      message: 'ユーザー登録が完了しました',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isPremium: user.isPremium
      }
    });
  } catch (error) {
    console.error('登録エラー:', error);
    res.status(500).json({ error: 'ユーザー登録中にエラーが発生しました' });
  }
});

// ユーザーログイン
router.post('/login', [
  body('email').isEmail().withMessage('有効なメールアドレスを入力してください'),
  body('password').notEmpty().withMessage('パスワードを入力してください')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // ユーザーの検索
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: 'メールアドレスまたはパスワードが正しくありません' });
    }

    // パスワードの検証
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'メールアドレスまたはパスワードが正しくありません' });
    }

    // JWTトークンの生成
    const secret = process.env.JWT_SECRET || 'fallback-secret';
    const token = jwt.sign(
      { userId: user.id, email: user.email } as any,
      secret as any,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as any
    );

    res.json({
      message: 'ログインに成功しました',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isPremium: user.isPremium
      }
    });
  } catch (error) {
    console.error('ログインエラー:', error);
    res.status(500).json({ error: 'ログイン中にエラーが発生しました' });
  }
});

// ユーザー情報の取得
router.get('/me', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: '認証トークンが必要です' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'ユーザーが見つかりません' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isPremium: user.isPremium
      }
    });
  } catch (error) {
    console.error('ユーザー情報取得エラー:', error);
    res.status(401).json({ error: '無効なトークンです' });
  }
});

export default router; 