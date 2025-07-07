# TODO - LLMプロンプト管理CLI実装

## 1. プロジェクト初期設定 ✅

### 1.1 Node.js環境セットアップ
- [x] `pnpm init` でpackage.json初期化
- [x] 必要な依存関係をインストール
  - [x] React Ink (`ink`, `react`)
  - [x] TypeScript関連 (`typescript`, `@types/node`, `@types/react`)
  - [x] TOML解析 (`smol-toml`)
  - [x] ファイル操作 (Node.js標準API使用)
- [x] 開発用依存関係をインストール
  - [x] Biome (`@biomejs/biome`)
  - [x] Oxlint (`oxlint`)
  - [x] Vitest (`vitest`)
  - [x] tsx (開発用)

### 1.2 プロジェクト構成
- [x] `src/` ディレクトリ作成
- [x] `tsconfig.json` 設定
- [x] `biome.json` 設定（フォーマットとリント）
- [x] `vitest.config.ts` 設定
- [x] `bin/` ディレクトリ作成（実行ファイル用）

## 2. コア機能実装 ✅

### 2.1 プロンプト管理機能
- [x] `src/utils/promptManager.ts` - プロンプトディレクトリスキャン
  - [x] `vault/` ディレクトリ内のプロンプト一覧取得
  - [x] 日本語ディレクトリ名対応
  - [x] `prompt.toml` 存在確認
- [x] `src/utils/tomlParser.ts` - TOML解析
  - [x] `prompt.toml` 読み込み（smol-toml使用）
  - [x] 最新バージョン取得（配列0番目）
  - [x] プロンプトテンプレート抽出

### 2.2 CLI インターフェース
- [x] `src/components/PromptList.tsx` - プロンプト一覧表示
  - [x] インタラクティブなリスト表示
  - [x] 矢印キーでの選択
  - [x] Enterキーでの決定
- [ ] `src/components/ModelSelector.tsx` - モデル選択（オプション）
  - [x] デフォルト: `claude-sonnet-4`
  - [x] 選択可能: `claude-opus-4` (CLI経由で指定可能)
- [x] `src/cli.tsx` - メインCLIコンポーネント
  - [x] プロンプト選択フロー
  - [x] 状態管理

### 2.3 入出力処理
- [x] `src/utils/clipboard.ts` - クリップボード入力
  - [x] `pbpaste` コマンドで内容取得
  - [x] エラーハンドリング（クリップボードが空の場合）
- [x] `src/utils/fileManager.ts` - ファイル出力
  - [x] frontmatter生成（version, model, timestamp順）
  - [x] `outputs/` ディレクトリへの保存（node:fs/promises使用）
  - [x] ファイル名生成（timestamp based）

## 3. CLI設定 ✅

### 3.1 実行可能ファイル
- [x] `bin/prompts-cli` shebang設定
- [x] `package.json` の `bin` フィールド設定
- [x] 実行権限設定

### 3.2 コマンドライン引数 (React Ink)
- [x] `process.argv` 解析またはReact Ink props使用
- [x] `--model` / `-m` オプション実装
  - [x] `sonnet4` (デフォルト)
  - [x] `opus4`
- [x] `--help` / `-h` オプション
- [x] `--version` / `-v` オプション

## 4. エラーハンドリング

### 4.1 入力検証
- [ ] `vault/` ディレクトリ存在確認
- [ ] `prompt.toml` 形式検証
- [ ] クリップボード内容検証
- [ ] 不正なモデル名の検証

### 4.2 エラーメッセージ
- [ ] 分かりやすいエラーメッセージ
- [ ] 日本語対応
- [ ] 復旧方法の提案

## 5. テスト実装

### 5.1 ユニットテスト (Vitest)
- [x] `src/utils/promptManager.test.ts`
- [x] `src/utils/tomlParser.test.ts` 
- [x] `src/utils/fileManager.test.ts`
- [x] `src/utils/clipboard.test.ts`

### 5.2 統合テスト (Vitest)
- [ ] 実際のvault構造でのテスト
- [ ] CLI動作テスト

## 6. ビルド・デプロイ ✅

### 6.1 ビルド設定
- [x] TypeScriptコンパイル設定
- [x] `pnpm run build` スクリプト
- [x] `pnpm run dev` スクリプト（開発用）

### 6.2 パッケージング
- [x] `pnpm run lint` スクリプト（Biome + Oxlint）
- [x] `pnpm run lint:fix` スクリプト（自動修正）
- [x] `pnpm run typecheck` スクリプト（高速型チェック）
- [x] `pnpm run check` スクリプト（総合チェック）
- [x] `pnpm run format` スクリプト（Biome）
- [x] `pnpm run test` スクリプト（Vitest）
- [x] 実行可能ファイルのパス設定

## 7. ドキュメント更新

### 7.1 使用方法
- [ ] README.md 更新（使用方法）
- [ ] コマンド例の記載
- [ ] インストール方法

### 7.2 開発者向け
- [x] CLAUDE.md 更新（実装完了後）
- [ ] API仕様の記載

## 実装優先度

**Phase 1 (MVP): ✅ 完了**
- [x] プロジェクト初期設定
- [x] 基本的なプロンプト選択機能
- [x] クリップボード入力と基本的なファイル出力

**Phase 2 (機能拡張): 🔄 進行中**
- [x] モデル選択オプション
- [x] エラーハンドリング強化
- [x] TOML解析とバージョン管理

**Phase 3 (品質向上): ✅ 完了**
- [x] テスト実装 (31個のテストケース実装完了)
- [x] ドキュメント整備（CLAUDE.md）
- [x] パフォーマンス最適化

## 🎯 現在の状況

- **MVP完了**: 基本的なCLI機能が動作
- **品質管理完了**: lint, format, typecheck, check の全スクリプトが動作
- **次の優先タスク**: テスト実装 (Phase 3)

## 📝 新規追加項目

### 品質管理強化 ✅
- [x] `pnpm run check` - 修正後必須チェック
- [x] `pnpm run lint:fix` - 自動修正機能
- [x] `pnpm run typecheck` - 高速型チェック

### 🔧 バグ修正 (緊急)
- [x] React Ink Raw mode エラー修正
  - [x] `useStdin` フックで `isRawModeSupported` チェック実装
  - [x] 条件付きレンダリングでinteractive UIを制御
  - [x] `stdin` TTY検出による条件付きレンダリング
- [ ] React key重複警告の修正