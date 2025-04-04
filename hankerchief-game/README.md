# ハンカチ落としオンラインゲーム

リアルタイムで友達と遊べるオンライン版「ハンカチ落とし」ゲームです。

## 概要

このゲームは2人のプレイヤーがドロップ役とチェック役に分かれて対戦します。
ドロップ役はいつハンカチを落とすかを決め、チェック役はいつ振り向くかを決めます。
上手くタイミングを計ってポイントを競い合いましょう！

## ゲームルール

1. 2人のプレイヤーがドロップ役とチェック役に分かれる
2. ドロップ役はハンカチを落とすかどうか、いつ落とすかを決める（0秒〜60秒の間）
3. チェック役は「振り向く」タイミングを選び、ハンカチが落とされているか確認する
4. ハンカチを落としてから振り向くまでの経過時間（秒数）がドロップ役のポイントになる
5. 振り向いた時点でハンカチが落とされていない場合、ドロップ役は最大ポイント（60ポイント）を獲得
6. ドロップ役とチェック役を交互に担当し、先に一定ポイント（100ポイント）に達したプレイヤーが勝利

## インストール方法

### 前提条件

- Node.js 18以上
- npm 9以上

### セットアップ手順

```bash
# リポジトリをクローン
git clone https://github.com/yourusername/hankerchief-game.git
cd hankerchief-game

# サーバーの依存関係をインストール
cd server
npm install

# クライアントの依存関係をインストール
cd ../client
npm install
```

## 実行方法

### 開発モード

1. サーバーを起動（別のターミナルで）:

```bash
cd server
npm run dev
```

2. クライアントを起動（別のターミナルで）:

```bash
cd client
npm run dev
```

3. ブラウザで http://localhost:5173 にアクセス

## 技術スタック

### フロントエンド
- React.js
- React Context + useReducer（状態管理）
- Socket.io Client（リアルタイム通信）
- Tailwind CSS（ユーティリティファーストCSSフレームワーク）

### バックエンド
- Node.js + Express
- Socket.io Server
- インメモリストレージ

## 開発者

- あなたの名前

## ライセンス

MIT 