# TODO - LLMプロンプト管理CLI実装

## 1. プロジェクト初期設定

### 1.1 Node.js環境セットアップ
- [ ] `pnpm init` でpackage.json初期化
- [ ] 必要な依存関係をインストール
  - [ ] React Ink (`ink`, `react`)
  - [ ] TypeScript関連 (`typescript`, `@types/node`, `@types/react`)
  - [ ] TOML解析 (`smol-toml`)
  - [ ] ファイル操作 (Node.js標準API使用)
- [ ] 開発用依存関係をインストール
  - [ ] Biome (`@biomejs/biome`)
  - [ ] Oxlint (`oxlint`)
  - [ ] Vitest (`vitest`)
  - [ ] tsx (開発用)

### 1.2 プロジェクト構成
- [ ] `src/` ディレクトリ作成
- [ ] `tsconfig.json` 設定
- [ ] `biome.json` 設定（フォーマットとリント）
- [ ] `oxlint.json` 設定
- [ ] `vitest.config.ts` 設定
- [ ] `bin/` ディレクトリ作成（実行ファイル用）

## 2. コア機能実装

### 2.1 プロンプト管理機能
- [ ] `src/utils/promptManager.ts` - プロンプトディレクトリスキャン
  - [ ] `vault/` ディレクトリ内のプロンプト一覧取得
  - [ ] 日本語ディレクトリ名対応
  - [ ] `prompt.toml` 存在確認
- [ ] `src/utils/tomlParser.ts` - TOML解析
  - [ ] `prompt.toml` 読み込み（smol-toml使用）
  - [ ] 最新バージョン取得（配列0番目）
  - [ ] プロンプトテンプレート抽出

### 2.2 CLI インターフェース
- [ ] `src/components/PromptList.tsx` - プロンプト一覧表示
  - [ ] インタラクティブなリスト表示
  - [ ] 矢印キーでの選択
  - [ ] Enterキーでの決定
- [ ] `src/components/ModelSelector.tsx` - モデル選択（オプション）
  - [ ] デフォルト: `claude-sonnet-4`
  - [ ] 選択可能: `claude-opus-4`
- [ ] `src/cli.tsx` - メインCLIコンポーネント
  - [ ] プロンプト選択フロー
  - [ ] 状態管理

### 2.3 入出力処理
- [ ] `src/utils/clipboard.ts` - クリップボード入力
  - [ ] `pbpaste` コマンドで内容取得
  - [ ] エラーハンドリング（クリップボードが空の場合）
- [ ] `src/utils/fileManager.ts` - ファイル出力
  - [ ] frontmatter生成（version, model, timestamp順）
  - [ ] `outputs/` ディレクトリへの保存（node:fs/promises使用）
  - [ ] ファイル名生成（timestamp based）

## 3. CLI設定

### 3.1 実行可能ファイル
- [ ] `bin/prompts-cli` shebang設定
- [ ] `package.json` の `bin` フィールド設定
- [ ] 実行権限設定

### 3.2 コマンドライン引数 (React Ink)
- [ ] `process.argv` 解析またはReact Ink props使用
- [ ] `--model` / `-m` オプション実装
  - [ ] `sonnet4` (デフォルト)
  - [ ] `opus4`
- [ ] `--help` / `-h` オプション
- [ ] `--version` / `-v` オプション

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
- [ ] `src/utils/promptManager.test.ts`
- [ ] `src/utils/tomlParser.test.ts`
- [ ] `src/utils/fileManager.test.ts`
- [ ] `src/utils/clipboard.test.ts`

### 5.2 統合テスト (Vitest)
- [ ] 実際のvault構造でのテスト
- [ ] CLI動作テスト

## 6. ビルド・デプロイ

### 6.1 ビルド設定
- [ ] TypeScriptコンパイル設定
- [ ] `pnpm run build` スクリプト
- [ ] `pnpm run dev` スクリプト（開発用）

### 6.2 パッケージング
- [ ] `pnpm run lint` スクリプト（Biome + Oxlint）
- [ ] `pnpm run format` スクリプト（Biome）
- [ ] `pnpm run test` スクリプト（Vitest）
- [ ] 実行可能ファイルのパス設定

## 7. ドキュメント更新

### 7.1 使用方法
- [ ] README.md 更新（使用方法）
- [ ] コマンド例の記載
- [ ] インストール方法

### 7.2 開発者向け
- [ ] CLAUDE.md 更新（実装完了後）
- [ ] API仕様の記載

## 実装優先度

**Phase 1 (MVP):**
- プロジェクト初期設定
- 基本的なプロンプト選択機能
- クリップボード入力と基本的なファイル出力

**Phase 2 (機能拡張):**
- モデル選択オプション
- エラーハンドリング強化
- TOML解析とバージョン管理

**Phase 3 (品質向上):**
- テスト実装
- ドキュメント整備
- パフォーマンス最適化