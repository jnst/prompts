# エラー仕様書

## 1. エラーカテゴリ

### 1.1 ファイルシステムエラー
- **ENOENT**: ファイル・ディレクトリが見つからない
- **EACCES**: アクセス権限がない
- **ENOSPC**: ディスク容量不足

### 1.2 設定エラー
- **TOML構文エラー**: 無効なTOML構文
- **TOML構造エラー**: 必須フィールドの欠如
- **バージョン形式エラー**: セマンティックバージョニング違反

### 1.3 入力検証エラー
- **空のクリップボード**: pbpasteで取得した内容が空
- **バイナリ内容検出**: 制御文字・バイナリデータが含まれる
- **内容サイズ制限**: 1MB以上のデータ

### 1.4 環境エラー
- **macOSコマンド不足**: pbpaste/pbcopyが利用できない
- **対話モード無効**: 端末が対話モードをサポートしない

## 2. エラーメッセージ形式

### 2.1 基本形式
```
[問題の説明]
[解決方法・例]
```

### 2.2 パス情報付き
```
[問題の説明] in: [ファイルパス]
[解決方法・例]
```

## 3. 具体的なエラー一覧

### 3.1 promptManager.ts
| エラー | メッセージ | 対応 |
|--------|-----------|------|
| ENOENT | `Vault directory not found: '[vaultPath]'\nPlease create the vault directory or specify a different path using --vault option` | vaultディレクトリ作成を促す |
| EACCES | `Cannot access vault directory '[vaultPath]': Permission denied` | アクセス権限確認を促す |
| 非ディレクトリ | `Path '[vaultPath]' exists but is not a directory` | パス確認を促す |
| 空のvault | `Warning: Vault directory '[vaultPath]' contains no prompt directories` | 警告表示のみ |

### 3.2 tomlParser.ts
| エラー | メッセージ | 対応 |
|--------|-----------|------|
| ENOENT | `prompt.toml not found in: [promptPath]\nPlease create a prompt.toml file with the required structure` | ファイル作成を促す |
| 空ファイル | `prompt.toml is empty in: [promptPath]\nPlease add a valid TOML configuration` | 内容追加を促す |
| 構文エラー | `Invalid TOML syntax in: [tomlPath]\n[parseError.message]` | 構文修正を促す |
| 構造エラー | `Invalid TOML structure in: [tomlPath]\nRequired: [metadata] section with 'current_version', 'created_at', 'updated_at' and [[prompts]] array with 'version', 'content', 'created_at' fields` | 新構造での修正を促す |
| 空テンプレート | `Empty template in: [tomlPath]\nPlease provide a non-empty template` | テンプレート内容を促す |
| バージョン形式 | `Invalid version format in: [tomlPath]\nExpected format: X.Y.Z (e.g., "1.0.0")` | セマンティックバージョニング使用を促す |

### 3.3 clipboard.ts
| エラー | メッセージ | 対応 |
|--------|-----------|------|
| 空のクリップボード | `Clipboard is empty\nPlease copy some text to the clipboard before running this command\nExample: echo "Your content here" \| pbcopy` | クリップボードへのコピーを促す |
| サイズ制限 | `Clipboard content too large (over 1MB)\nPlease use smaller content for processing` | 内容の削減を促す |
| バイナリ検出 | `Clipboard contains binary or control characters\nPlease ensure clipboard content is plain text` | プレーンテキストの使用を促す |
| macOSコマンド不足 | `pbpaste command not found. This tool only works on macOS.\nPlease run this command on a macOS system with pbpaste available.` | macOS環境使用を促す |

### 3.4 fileManager.ts
| エラー | メッセージ | 対応 |
|--------|-----------|------|
| 必須パラメータ | `[Parameter] is required and must be [type]` | パラメータ指定を促す |
| 無効なモデル | `Invalid model: '[model]'\nSupported models: [list]\nExample: --model claude-sonnet-4` | サポートモデル使用を促す |
| EACCES | `Permission denied: Cannot write to [outputsDir]\nPlease check file permissions` | 権限確認を促す |
| ENOSPC | `No space left on device: Cannot write to [outputsDir]\nPlease free up disk space` | 容量確保を促す |

## 4. 警告メッセージ

### 4.1 警告レベル
- **console.warn**: 処理は継続するが注意が必要
- **短い内容警告**: `Warning: Clipboard content is very short (less than 3 characters)`

## 5. 実装ルール

### 5.1 エラーハンドリング
- 必ず`throw new Error()`を使用
- エラーメッセージは英語で統一
- 解決方法を含む具体的な説明
- パス情報は可能な限り含める

### 5.2 メッセージ構造
- 1行目: 問題の概要
- 2行目以降: 具体的な解決方法・例

### 5.3 コード例
```typescript
// 良い例
throw new Error(`Invalid model: '${model}'\nSupported models: ${validModels.join(', ')}\nExample: --model claude-sonnet-4`);

// 悪い例
throw new Error('Invalid model');
```