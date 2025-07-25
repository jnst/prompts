---
topic: "Property-based Testing"
prompt_version: "1.0.0"
timestamp: "2025-07-22T12:47:36Z"
---

## Property-based Testing：「性質」で考える新しいテスト思考

### 核心を一言で
**「個別の例ではなく、満たすべき性質を定義し、コンピューターに無数の例で検証させる手法」**

### 直感的理解：ソート関数の例

**従来の方法（Example-based）：**
```
[3,1,4,1,5] → [1,1,3,4,5] ✓
[2,7,1] → [1,2,7] ✓
```

**Property-based：**
```
「どんな配列でも、ソート後は：
1. 長さが変わらない
2. 昇順になっている  
3. 元の要素がすべて含まれている」

→ ツールが自動で10万通りの配列を生成してテスト
```

### なぜ生まれたのか？

**従来の限界：**
- エッジケースを人間が想像しきれない
- テストケースの偏り
- 「動作する偶然」を見逃す

**解決のアイデア：**
「人間は『性質』を考えるのが得意、コンピューターは『網羅』が得意」
→ 役割分担で両方の強みを活用

### 汎用的な思考パターン

1. **「例」から「性質」への抽象化**
   - 数学の証明思考と同じ
   - 科学の法則発見と同じ構造

2. **「逆向きの検証」**
   - 暗号化→復号化で元データに戻る
   - 数学の逆関数の概念

3. **「不変量の発見」**
   - 物理学の保存則
   - システム設計の制約条件

### 他分野への応用

- **データベース設計**：ACID特性の検証
- **API設計**：べき等性、可逆性の確認  
- **アルゴリズム**：計算量の性質検証
- **ビジネスロジック**：業務ルールの一貫性

### 記憶の核：「性質思考」

Property-based Testingの本質は、**「具体例の山から普遍的性質を見抜く能力」**を養うこと。これは：

- プログラミング以外でも使える思考法
- 問題の本質を見抜く力
- システム設計の品質向上につながる

**覚えるべきは手法ではなく、この「性質で考える」思考パターン**です。新しい技術や分野でも、この視点は必ず活かせます。