# skotm — Portfolio

気象・地震・防災情報の可視化とシミュレーションを中心に開発している、skotm のポートフォリオサイトです。

**サイト**: https://skotm.github.io/portfolio/

## このサイトでみられるもの

- **Projects** — これまでに制作したアプリ・ツール。カードの「詳細」で README を、「GitHub repository」でリポジトリを開けます。
- **All Projects** — すべてのプロジェクトを、カテゴリで絞り込んで一覧できます。
- **Simulation Gallery** — 地震・津波シミュレータの画像ギャラリー。
- **About** — 取り組んでいること。

## Projects

| 名前 | 内容 |
| --- | --- |
| 地震・津波シミュレータ | 地震による地盤変動と津波の挙動をシミュレーションするツール（開発中） |
| [MeteoQuake](https://github.com/skotm/MeteoQuake) | 地震・気象・防災情報を扱うアプリ（開発中） |
| [MeteoQuake-KyoshinViewer](https://github.com/skotm/MeteoQuake-KyoshinViewer) | リアルタイム震度ビューアー |
| [WIS Viewer](https://github.com/skotm/wis-viewer) | 気象情報を可視化するツール |

## 見え方について

ヘッダー・サイドバー・カードには、ガラスのような透明感のある表現（Liquid Glass）を使っています。WebGL に対応したブラウザではより立体的に、非対応の環境や動作が重い端末では軽量な表現に自動で切り替わります。

URL の末尾に `?glass=off` を付けると、軽量な表現だけで表示できます。

## 使用している技術

React・TypeScript・Vite で作られ、GitHub Pages で公開しています。ガラス表現には [@ybouane/liquidglass](https://github.com/ybouane/liquidglass)（MIT License）を利用しています。

## ローカルで動かす

Node.js 22 以上が必要です。

```bash
npm install
npm run dev
```

## ライセンス・クレジット

このサイトは、以下のオープンソースソフトウェアを利用しています。

- [@ybouane/liquidglass](https://github.com/ybouane/liquidglass) — ガラス表現。MIT License（配布元のREADMEの記載による）
- [html-to-image](https://github.com/bubkoo/html-to-image) — @ybouane/liquidglass が内部で利用
- [React](https://github.com/facebook/react) / React DOM

各ライブラリのライセンスは、それぞれの配布元に従います。

© 2026 skotm. All rights reserved.

## 連絡先

- GitHub: https://github.com/skotm
- X: https://x.com/skotm_0423
