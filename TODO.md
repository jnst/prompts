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

### 4.1 入力検証 ✅
- [x] `vault/` ディレクトリ存在確認
- [x] `prompt.toml` 形式検証
- [x] クリップボード内容検証
- [x] 不正なモデル名の検証

### 4.2 エラーメッセージ ✅
- [x] 分かりやすいエラーメッセージ
- [x] 日本語対応
- [x] 復旧方法の提案

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
- **アクション指向UI完了**: create機能によるトピック指定ファイル作成機能が動作
- **fill機能完了**: 未記入ファイル検出・選択・内容追加機能が動作
- **全機能完了**: Phase 1-5 すべて完了、本格運用可能

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
- [x] React key重複警告の修正
- [x] FileList選択バグ修正 (2024-07-10)
  - [x] useEffectの依存配列問題を修正
  - [x] 3番目以降のアイテムが選択できない問題を解決
  - [x] 選択状態の適切な管理を実装

## 8. 新機能実装 (アクション指向UI) ✅

### 8.1 プロンプト特化アクション ✅
- [x] `create` アクション実装
  - [x] トピック指定での出力ファイル作成
  - [x] `outputs/{{topic}}.md` ファイル生成
  - [x] front matter に以下を含める:
    - [x] `topic: "{{topic}}"` 
    - [x] `prompt_version: "1.0.0"` (現在のプロンプトバージョン)
    - [x] `timestamp: "2025-07-07T00:00:00Z"` (ISO8601形式)
  - [x] ファイル本体は空（回答記入待ち状態）
  - [x] **プロンプト内容をクリップボードにコピー**
    - [x] プロンプトテンプレートの `{{topic}}` を実際の値に置換
    - [x] 置換済みプロンプトを `pbcopy` でクリップボードにコピー
    - [x] 既存clipboard.ts の出力機能を活用

- [x] `fill` アクション実装  
  - [x] 回答が未記入なファイルの検出機能
    - [x] front matter があり、本体が空のファイルをスキャン
    - [x] `outputs/` ディレクトリ内の対象ファイル一覧表示
  - [x] インタラクティブファイル選択UI
    - [x] 矢印キーでファイル選択
    - [x] ファイル名とtopic表示
  - [x] クリップボードから回答内容取得
    - [x] 既存clipboard.ts機能を再利用
    - [x] 選択ファイルの本体部分に追記

### 8.2 CLI インターフェース拡張 ✅
- [x] アクション選択機能
  - [x] プロンプト選択後のアクション選択UI
  - [x] `create` と `fill` アクションの提供
  - [x] 既存の基本モード（プロンプト選択）との統合

- [x] ファイル管理機能拡張
  - [x] `src/utils/fileManager.ts` 拡張
  - [x] トピック指定ファイル生成機能 (`createTopicFile`)
  - [x] トピック専用frontmatter生成機能
  - [x] 未記入ファイル検出機能
  - [x] ファイル内容更新機能（追記モード）

- [x] プロンプト置換機能実装
  - [x] `src/utils/promptProcessor.ts` 作成
  - [x] `{{topic}}` → 実際の値への置換処理
  - [x] テンプレート変数の抽出・検証機能
  - [x] clipboard.ts拡張でpbcopy出力機能追加

### 8.3 UI コンポーネント拡張 ✅
- [x] `src/components/ActionList.tsx` 作成
  - [x] アクション一覧表示（create, fill）
  - [x] インタラクティブ選択機能
  - [x] 矢印キーとEnterキーでの操作

- [x] `src/components/TopicInput.tsx` 作成
  - [x] トピック入力UI
  - [x] バリデーション機能
  - [x] キャンセル機能

- [x] `src/components/FileList.tsx` 作成
  - [x] 未記入ファイル一覧表示
  - [x] topic名とファイル名表示
  - [x] インタラクティブ選択機能

### 8.4 テスト実装
- [x] `src/utils/promptProcessor.test.ts`
- [x] `src/components/ActionList.test.ts`
- [x] `src/components/TopicInput.test.ts`
- [x] `src/components/FileList.test.ts` 
- [x] 拡張されたfileManager機能のテスト
- [x] アクション統合テスト

## 9. 実装優先度

**Phase 4 (アクション指向UI): ✅ 完了**
- [x] プロンプト選択後のアクション選択UI
- [x] `create` アクション基本機能
- [x] トピック入力とファイル生成機能
- [x] プロンプト置換とクリップボード連携

**Phase 5 (fill機能とUI/UX向上): ✅ 完了**  
- [x] `fill` アクション基本機能
- [x] 未記入ファイル検出・選択UI
- [x] エラーハンドリング強化
- [x] 使用方法ドキュメント更新
- [x] FileList選択バグ修正（3番目のアイテムが選択できない問題）

## 10. ファイル管理機能拡張 ✅

### 10.1 新アクション実装 ✅
- [x] `reset` アクション実装（旧 clear）
  - [x] ファイル内容をクリアしつつfrontmatterを保持
  - [x] 全.mdファイル対象（topic形式以外も含む）
  - [x] 内容がある場合のみ選択肢に表示
  - [x] clearFileContent()関数で実装

- [x] `delete` アクション実装（旧 remove）
  - [x] ファイルを完全削除
  - [x] 全.mdファイル対象（topic形式以外も含む）
  - [x] removeFile()関数で実装
  - [x] すべてのファイルを選択肢に表示

### 10.2 ファイル検出機能強化 ✅
- [x] `detectAllOutputFiles()` 関数実装
  - [x] outputsディレクトリ内の全.mdファイルを検出
  - [x] topic形式以外のファイルも含める
  - [x] ファイル内容の有無を判定
  - [x] OutputFile型で統一的に管理

### 10.3 UI/UX改善 ✅
- [x] FileList汎用化
  - [x] UnfilledFile | OutputFile の union type対応
  - [x] "Select a file:" への汎用的なメッセージ変更
  - [x] 異なるファイル形式での適切な表示

### 10.4 テスト実装 ✅
- [x] detectAllOutputFiles()のテスト
- [x] clearFileContent()のテスト
- [x] removeFile()のテスト
- [x] 型安全性のテスト

**Phase 6 (ファイル管理機能): ✅ 完了**
- [x] reset/delete アクション実装
- [x] 全ファイル形式対応
- [x] アクション名改善（clear→reset, remove→delete）
- [x] エラーハンドリング強化

## 11. 品質改善 (Quality Improvements)

### 11.1 Timestamp Format Improvement ✅
- [x] frontmatterのtimestampからミリ秒を削除
  - [x] `generateTimestamp()` 関数の修正
  - [x] テストの更新
  - [x] ISO 8601形式の維持（秒単位まで）