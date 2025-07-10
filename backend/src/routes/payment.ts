import express from 'express';
import jwt from 'jsonwebtoken';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

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

// プレミアムプランの価格情報を取得
router.get('/plans', async (req, res) => {
  try {
    const plans = [
      {
        id: 'premium_monthly',
        name: 'プレミアム月額プラン',
        price: 980,
        currency: 'jpy',
        interval: 'month',
        features: [
          '全力士のAI予測閲覧',
          '詳細な分析データ',
          '優先サポート'
        ]
      },
      {
        id: 'premium_yearly',
        name: 'プレミアム年額プラン',
        price: 9800,
        currency: 'jpy',
        interval: 'year',
        features: [
          '全力士のAI予測閲覧',
          '詳細な分析データ',
          '優先サポート',
          '2ヶ月分お得'
        ]
      }
    ];

    res.json(plans);
  } catch (error) {
    console.error('プラン取得エラー:', error);
    res.status(500).json({ error: 'プラン情報の取得中にエラーが発生しました' });
  }
});

// 支払いセッションを作成
router.post('/create-session', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const { planId } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'ユーザーが見つかりません' });
    }

    // プラン情報を取得
    const plans = {
      premium_monthly: { price: 980, name: 'プレミアム月額プラン' },
      premium_yearly: { price: 9800, name: 'プレミアム年額プラン' }
    };

    const plan = plans[planId as keyof typeof plans];
    if (!plan) {
      return res.status(400).json({ error: '無効なプランです' });
    }

    // Stripeセッションを作成
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'jpy',
            product_data: {
              name: plan.name,
              description: '相撲予測AIアプリのプレミアムプラン'
            },
            unit_amount: plan.price
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: `${process.env.CORS_ORIGIN}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CORS_ORIGIN}/payment/cancel`,
      metadata: {
        userId,
        planId
      }
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('セッション作成エラー:', error);
    res.status(500).json({ error: '支払いセッションの作成中にエラーが発生しました' });
  }
});

// 支払い成功時のWebhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook署名検証エラー:', err);
    return res.status(400).send(`Webhook Error: ${err}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        await handlePaymentSuccess(session);
        break;
      
      case 'payment_intent.payment_failed':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailure(paymentIntent);
        break;
      
      default:
        console.log(`未処理のイベントタイプ: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook処理エラー:', error);
    res.status(500).json({ error: 'Webhook処理中にエラーが発生しました' });
  }
});

// 支払い成功の処理
async function handlePaymentSuccess(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const planId = session.metadata?.planId;

  if (!userId || !planId) {
    console.error('セッションメタデータが不足しています');
    return;
  }

  try {
    // 支払い記録を作成
    await prisma.payment.create({
      data: {
        userId,
        stripePaymentId: session.payment_intent as string,
        amount: session.amount_total || 0,
        status: 'succeeded'
      }
    });

    // ユーザーをプレミアムにアップグレード
    await prisma.user.update({
      where: { id: userId },
      data: { isPremium: true }
    });

    console.log(`ユーザー ${userId} がプレミアムにアップグレードされました`);
  } catch (error) {
    console.error('支払い成功処理エラー:', error);
  }
}

// 支払い失敗の処理
async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  try {
    // 支払い記録を更新
    await prisma.payment.updateMany({
      where: { stripePaymentId: paymentIntent.id },
      data: { status: 'failed' }
    });

    console.log(`支払い失敗: ${paymentIntent.id}`);
  } catch (error) {
    console.error('支払い失敗処理エラー:', error);
  }
}

// 支払い履歴を取得
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;

    const payments = await prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(payments);
  } catch (error) {
    console.error('支払い履歴取得エラー:', error);
    res.status(500).json({ error: '支払い履歴の取得中にエラーが発生しました' });
  }
});

export default router; 