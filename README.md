# SUmo - 相撲予測 AI アプリケーション

日本の相撲の結果を AI が予測する Web アプリケーションです。力士の対戦成績、体調、場所ごとの成績、相性などを AI が分析し、勝利期待値を算出します。

## 🎯 機能

### 無料プラン

- 月 3 力士の予測閲覧
- 基本的な統計情報
- 力士一覧閲覧

### プレミアムプラン（月額 980 円）

- 全力士の予測閲覧
- 詳細な統計分析
- AI 予測の詳細解説
- 優先サポート
- 広告なし

## 🛠️ 技術スタック

### フロントエンド

- **React 18** - UI ライブラリ
- **TypeScript** - 型安全性
- **Tailwind CSS** - スタイリング
- **Vite** - ビルドツール
- **React Router** - ルーティング
- **React Query** - データフェッチング
- **Lucide React** - アイコン
- **React Hot Toast** - 通知

### バックエンド

- **Node.js** - ランタイム
- **Express** - Web フレームワーク
- **TypeScript** - 型安全性
- **Prisma** - ORM
- **PostgreSQL** - データベース
- **JWT** - 認証
- **bcrypt** - パスワードハッシュ化

### インフラ・サービス

- **Stripe** - 決済処理
- **JWT** - 認証トークン

## 📁 プロジェクト構造

```
SUmo/
├── frontend/                 # Reactフロントエンド
│   ├── src/
│   │   ├── components/      # 再利用可能コンポーネント
│   │   ├── pages/          # ページコンポーネント
│   │   ├── contexts/       # React Context
│   │   └── ...
│   └── ...
├── backend/                 # Expressバックエンド
│   ├── src/
│   │   ├── routes/         # APIルート
│   │   ├── middleware/     # ミドルウェア
│   │   ├── services/       # ビジネスロジック
│   │   └── ...
│   └── ...
├── prisma/                 # データベーススキーマ
└── ...
```

## 🚀 セットアップ

### 前提条件

- Node.js 18 以上
- PostgreSQL
- npm または yarn

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd SUmo
```

### 2. 依存関係のインストール

```bash
# ルートディレクトリで
npm install

# フロントエンド
cd frontend && npm install

# バックエンド
cd ../backend && npm install
```

### 3. 環境変数の設定

```bash
# バックエンド
cp backend/.env.example backend/.env
# .envファイルを編集して必要な値を設定

# フロントエンド
cp frontend/.env.example frontend/.env
```

### 4. データベースのセットアップ

```bash
cd backend
npx prisma generate
npx prisma db push
npx prisma db seed
```

### 5. アプリケーションの起動

```bash
# ルートディレクトリで
npm run dev
```

これで以下にアクセスできます：

- フロントエンド: http://localhost:3000
- バックエンド: http://localhost:8000

## 📊 主要機能

### 認証システム

- ユーザー登録・ログイン
- JWT 認証
- パスワードハッシュ化

### AI 予測システム

- 力士の対戦成績分析
- 体調・場所ごとの成績考慮
- 相性分析
- 勝利期待値算出

### 課金システム

- Stripe 統合
- サブスクリプション管理
- プラン別機能制限

### 管理機能

- 力士情報管理
- 予測結果管理
- ユーザー管理

## 🔧 開発

### 開発サーバーの起動

```bash
npm run dev
```

### ビルド

```bash
npm run build
```

### テスト

```bash
npm run test
```

## 📝 環境変数

### バックエンド (.env)

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-jwt-secret"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
PORT=8000
```

### フロントエンド (.env)

```env
VITE_API_URL="http://localhost:8000"
VITE_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。

## 📞 サポート

質問や問題がある場合は、Issue を作成してください。

---

**SUmo** - 相撲予測 AI で、より楽しい相撲観戦を！
