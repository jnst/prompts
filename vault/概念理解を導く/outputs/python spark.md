---
model: "claude-opus-4"
timestamp: "2025-07-07T17:12:41Z"
---

PySpark は **分散データ処理のための Python API** で、Apache Spark の機能を Python から使えるようにしたものです。

## 核心的な理解

**なぜ PySpark が必要か？**
単一マシンでは処理しきれない大規模データ（TB〜PB級）を、複数のマシンで分割処理するため。pandas では数GB でメモリ不足になるが、PySpark なら数百台のマシンで並列処理できる。

## 基本構造（3つの層）

1. **Driver（司令塔）**
   - あなたの Python コードが動く場所
   - 処理計画を立てる

2. **Executor（作業員）**
   - 実際のデータ処理を行う
   - 複数のマシンに分散

3. **Cluster Manager（管理者）**
   - リソースの割り当てを管理

## 核となる概念

### RDD → DataFrame → Dataset
- **RDD**: 最も原始的な分散データ構造（低レベル API）
- **DataFrame**: SQL のテーブルのような構造（高レベル API）
- **Dataset**: 型安全な DataFrame（Python では使用不可）

```python
# DataFrame の例
df = spark.read.csv("huge_file.csv")
df.filter(df.age > 20).groupBy("city").count().show()
```

### 遅延評価（Lazy Evaluation）
**なぜ重要か？** 最適化のため
- **Transformation**: 計画を立てるだけ（filter, select, join）
- **Action**: 実際に実行（show, count, collect）

```python
# これらは実行されない（計画だけ）
df1 = df.filter(df.age > 20)  
df2 = df1.select("name", "age")

# これで初めて実行される
df2.show()  # Action
```

## 他の技術との関連

```
単一マシン処理          分散処理
pandas         →      PySpark DataFrame
scikit-learn   →      MLlib
NumPy array    →      RDD/DataFrame
SQL            →      Spark SQL
```

## 実践的な使い分け

**PySpark を使うべき時：**
- データが 10GB 以上
- 複雑な ETL パイプライン
- リアルタイムストリーム処理

**使わない方がいい時：**
- データが数 GB 以下（pandas の方が速い）
- 単純な分析
- 少量データの機械学習

## 記憶に残す核心

PySpark = **「pandas の分散版」** + **「遅延評価で最適化」**

分散処理の本質は「分割統治」。大きな問題を小さく分けて（map）、結果をまとめる（reduce）。この原理は MapReduce、並列アルゴリズム、分散システム全般に通じる。
