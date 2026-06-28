# AGENTS.md

このファイルはAIエージェントがコードベースを操作する際の指針を記述しています。

---

## プロジェクト概要

化学系研究室向けのシンプルな計算Webアプリ。全計算はブラウザ上で完結し、サーバーにデータを保管しない。

---

## 技術スタック

- **Next.js 16** (App Router)
- **React 19** + **TypeScript**
- **Tailwind CSS v4**
- **Radix UI** (`@radix-ui/react-*`, `@radix-ui/themes`)
- **react-hook-form** + **Zod** — フォームバリデーション
- **KaTeX / react-katex** — 数式レンダリング
- **jotai** — 状態管理（実験的使用）
- **mathjs** — 数値計算
- **Storybook** — UIコンポーネント開発
- **Vercel Analytics / Speed Insights**
- **bun** — パッケージマネージャ・ランタイム

---

## 開発コマンド

```bash
bun install          # 依存関係のインストール
bun run dev          # 開発サーバー起動 (localhost:3000)
bun run build        # プロダクションビルド
bun run lint         # ESLint
bun run storybook    # Storybook起動 (localhost:6006)
```

---

## ディレクトリ構成

```
src/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # ルートレイアウト（Header + NaviBar + main）
│   ├── page.tsx                # ホーム
│   ├── about/                  # Aboutページ
│   ├── percent/                # 濃度計算（質量%・ppm）
│   ├── dilution/               # 希釈計算（C₁V₁=C₂V₂）
│   │   └── hooks.ts            # フォームロジックをカスタムフックに分離
│   ├── proportion/             # 実量 → %（複数成分の割合計算）
│   ├── prorate/                # % → 実量（逆算）
│   ├── exp-design/
│   │   └── orthogonal-array-l8/  # 実験計画法 L(8)直交表
│   └── bonus/
│       ├── alcohol/            # お酒のアルコール量計算
│       ├── serving-scale/      # 料理の分量調整
│       └── jyotai/             # jotai動作テスト（ナビから非表示）
├── components/
│   ├── layout/
│   │   ├── header/header.tsx   # グローバルヘッダー
│   │   └── navi/navibar.tsx    # サイドナビ（Radix NavigationMenu）
│   └── ui/
│       └── Button.tsx          # 共通ボタンコンポーネント
├── atoms/
│   └── countAtom.ts            # jotai アトム
├── utils/
│   └── chemistry.ts            # 化学計算ユーティリティ
└── stories/                    # Storybookストーリー
```

---

## コーディング規約

### フォームの実装パターン

全フォームで **react-hook-form + Zod** を使う。バリデーションスキーマは `z.object()` で定義し、`zodResolver` を渡す。

数値入力は文字列として受け取り、正規表現 `/^[0-9]+(\.[0-9]+)?$/` で半角数字のみ許可する。

ロジックが複雑なページ（例: `/dilution`）はカスタムフック（`hooks.ts`）に計算ロジックを分離し、ページコンポーネントをUIのみに保つ。

### 計算ユーティリティ

`src/utils/chemistry.ts` に化学計算の共通関数を置く。

- `toGrams(value, unit)` — mg/g 単位を g に統一
- `formatResult(value)` — 結果値の有効桁数を自動調整してフォーマット
- `unitOptions` — `["g", "mg"]` の単位選択肢

新しい計算機能で単位変換や値フォーマットが必要な場合は、このファイルに追加する。

### スタイリング

Tailwind CSS v4 のユーティリティクラスを直接使う。共通ボタンは `src/components/ui/Button.tsx` を使い、生の `<button>` は使わない（ナビ内の特殊ボタンを除く）。

インジゴ系カラー（`indigo-500`, `indigo-600` など）がブランドカラー。

### 数式表示

KaTeX を使う場合は `react-katex` の `BlockMath` / `InlineMath` を使い、`"katex/dist/katex.min.css"` を必ずインポートする。

### ナビゲーションへの追加

新しいページを追加したらナビバー（`src/components/layout/navi/navibar.tsx`）にも追加する。Radix `NavigationMenu` の構造に従う。

---

## 注意事項

- `"use client"` ディレクティブはページコンポーネントとインタラクティブなUIコンポーネントに必要。カスタムフック（`hooks.ts`）には付けない。
- 外部公開のページは `layout.tsx` でメタデータ（`title`, `description`）を設定する。
- `bonus/jyotai` はナビからコメントアウトされており実験的なページ。新機能の検証場所として使用している。
- `github-macbook-0111-ssh` / `github-macbook-0111-ssh.pub` がリポジトリルートに残っているが、`.gitignore` で除外すべきファイル（機密情報には触れない）。
