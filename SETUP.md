# SUmo アプリケーション セットアップガイド

## 前提条件

- Node.js 18 以上
- PostgreSQL 12 以上
- npm または yarn

## 1. プロジェクトのクローンと依存関係のインストール

```bash
# プロジェクトをクローン
git clone <repository-url>
cd sumo-prediction-ai

# 依存関係をインストール
npm run install:all
```

## 2. データベースのセットアップ

### PostgreSQL のインストールと設定

**macOS (Homebrew):**

```bash
brew install postgresql
brew services start postgresql
```

**Ubuntu/Debian:**

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### データベースの作成

```bash
# PostgreSQLに接続
sudo -u postgres psql

# データベースとユーザーを作成
CREATE DATABASE sumo_prediction;
CREATE USER sumo_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE sumo_prediction TO sumo_user;
\q
```

## 3. 環境変数の設定

### バックエンド環境変数

```bash
cd backend
cp env.example .env
```

`.env`ファイルを編集して以下の値を設定：

```env
# データベース
DATABASE_URL="postgresql://sumo_user:your_password@localhost:5432/sumo_prediction"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"

# Stripe (開発用)
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

# サーバー
PORT=8000
NODE_ENV=development

# CORS
CORS_ORIGIN="http://localhost:3000"

# レート制限
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Stripe の設定

1. [Stripe](https://stripe.com)でアカウントを作成
2. ダッシュボードから API キーを取得
3. Webhook エンドポイントを設定：
   - URL: `http://localhost:8000/api/payments/webhook`
   - イベント: `checkout.session.completed`, `payment_intent.payment_failed`

## 4. データベースのマイグレーションとシード

```bash
cd backend

# Prismaクライアントの生成
npm run db:generate

# データベースマイグレーション
npm run db:migrate

# サンプルデータの投入
npm run db:seed
```

## 5. アプリケーションの起動

### 開発モード（推奨）

```bash
# ルートディレクトリで実行
npm run dev
```

これにより以下が起動します：

- バックエンド: http://localhost:8000
- フロントエンド: http://localhost:3000

### 個別起動

**バックエンド:**

```bash
cd backend
npm run dev
```

**フロントエンド:**

```bash
cd frontend
npm run dev
```

## 6. アプリケーションの確認

1. ブラウザで http://localhost:3000 にアクセス
2. アカウント登録またはログイン
3. 力士一覧を確認
4. 予測機能をテスト

## 7. 本番環境へのデプロイ

### ビルド

```bash
# 全体をビルド
npm run build

# 個別ビルド
cd backend && npm run build
cd frontend && npm run build
```

### 環境変数の設定

本番環境では以下の環境変数を適切に設定してください：

- `NODE_ENV=production`
- `DATABASE_URL` (本番用 PostgreSQL)
- `JWT_SECRET` (強力なシークレットキー)
- `STRIPE_SECRET_KEY` (本番用 Stripe キー)
- `CORS_ORIGIN` (本番用ドメイン)

## トラブルシューティング

### よくある問題

1. **データベース接続エラー**

   - PostgreSQL が起動しているか確認
   - データベース URL が正しいか確認
   - ユーザー権限が適切か確認

2. **依存関係のエラー**

   ```bash
   # node_modulesを削除して再インストール
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Prisma エラー**

   ```bash
   cd backend
   npx prisma generate
   npx prisma migrate reset
   ```

4. **ポートが使用中**
   - 他のプロセスがポート 8000 や 3000 を使用していないか確認
   - 必要に応じてポート番号を変更

### ログの確認

**バックエンド:**

```bash
cd backend
npm run dev
```

**フロントエンド:**

```bash
cd frontend
npm run dev
```

## 開発者向け情報

### プロジェクト構造

```
sumo-prediction-ai/
├── backend/                 # バックエンド (Node.js + Express)
│   ├── src/
│   │   ├── routes/         # APIルート
│   │   ├── services/       # ビジネスロジック
│   │   └── scripts/        # ユーティリティスクリプト
│   ├── prisma/             # データベーススキーマ
│   └── package.json
├── frontend/               # フロントエンド (React + TypeScript)
│   ├── src/
│   │   ├── components/     # Reactコンポーネント
│   │   ├── pages/         # ページコンポーネント
│   │   ├── contexts/      # Reactコンテキスト
│   │   └── main.tsx
│   └── package.json
└── package.json           # ワークスペース設定
```

### API エンドポイント

- `GET /api/health` - ヘルスチェック
- `POST /api/auth/register` - ユーザー登録
- `POST /api/auth/login` - ログイン
- `GET /api/auth/me` - ユーザー情報取得
- `GET /api/rikishi` - 力士一覧
- `GET /api/rikishi/:id` - 力士詳細
- `GET /api/predictions` - 予測一覧
- `POST /api/predictions` - 予測作成
- `GET /api/payments/plans` - プラン一覧
- `POST /api/payments/create-session` - 支払いセッション作成

### データベーススキーマ

主要なテーブル：

- `users` - ユーザー情報
- `rikishi` - 力士情報
- `match_results` - 対戦結果
- `predictions` - AI 予測
- `payments` - 支払い情報
- `rikishi_stats` - 力士統計

## サポート

問題が発生した場合は、以下を確認してください：

1. ログファイルの確認
2. 環境変数の設定
3. データベースの接続状態
4. 依存関係のバージョン

追加のサポートが必要な場合は、GitHub の Issues ページで報告してください。
