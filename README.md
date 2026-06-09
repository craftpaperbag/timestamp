# timestamp

頭痛薬を飲んだ時間など、「いま」をワンタップで記録するためのHTMLアプリ。GitHub Pagesでそのまま動きます。

## 公開URL

- 本番 (main): https://craftpaperbag.github.io/timestamp/

> `main` ブランチに push すると、GitHub Pages がブランチの内容を
> そのまま配信します (Source: `Deploy from a branch` / `main` / `/ (root)`)。
> 動作確認は本番デプロイ前にローカルの軽量 web サーバーで行ってください
> (下記「ローカルでの確認」を参照)。

> ヘッダー右上にはバージョン (その時点のコミットの短縮 SHA) が小さく
> 表示されます。`main` が更新されるたびに GitHub Actions
> (`.github/workflows/version.yml`) が `version.json` を書き換えて
> コミットし直すため、マージのたびに自動で更新されます。

## 特長

- 事前に登録したタイトル(例: `頭痛薬` / `コーヒー` / `目薬`)のボタンを
  タップするだけで、その瞬間の日時を記録します。
- 各タイトルには [lucide](https://lucide.dev) (ISC License) のアイコンを
  10 種類から 1 つ選べます。記録ボタンはアイコンを大きく、タイトルを
  小さく添えるカード型で、スマホでは 3 列で並びます。
- 記録は新しい順に表示され、いつでも編集・個別削除・全件削除が可能です。
- 記録を JSON ファイルとして書き出せます。書き出した JSON は
  インポートして復元・統合できます (同じ記録は重複せず取り込まれ、
  タイトル・アイコン・自動保存の設定も一緒に移行できます)。
- スタイルは [Tailwind CSS](https://tailwindcss.com) (v4) で実装。
  カラースキーマは `css/tailwind.css` で **oklch** により一元定義した
  セマンティックカラー (`bg` / `surface` / `ink` / `accent` など) のみを
  使用し、ライト/ダークは変数の差し替えだけで切り替わります。
- ライト/ダーク/自動の3種類の表示モード。
- グレースケールでも判別できる配色と、大きめのタップ領域 (最低 44px)。

## データの取り扱い

- 記録はサーバーには送信されず、**お使いのブラウザの localStorage** に
  のみ保存されます。
- 別の端末・別のブラウザには引き継がれません。バックアップが必要な場合は
  「JSON エクスポート」をご利用ください。別端末への移行や復元は
  「JSON インポート」で行えます。
- **タイトルには個人情報・機密情報を入力しないでください。** ブラウザ拡張や
  端末を共有する他者から閲覧される可能性があります。

## ローカルでの確認

配信はビルド不要の静的サイトです (生成済み CSS をコミットしています)。
本番に反映する前に、ローカルの軽量 web サーバーで動作確認してください。
任意の HTTP サーバーで配信できます。

```sh
python3 -m http.server -d . 8000
# → http://localhost:8000 を開く
```

> `file://` で直接開くと一部ブラウザでモジュールや fetch が動かないため、
> 必ず HTTP サーバー越しに開いてください。

## CSS のビルド (スタイルを変更する場合のみ)

`css/style.css` は Tailwind CSS (v4) の生成物です。直接編集せず、
ソースの `css/tailwind.css` (カラースキーマ・コンポーネント定義) や
HTML/JS のクラスを変更したうえで再生成してください。

```sh
npm install
npm run build:css   # css/tailwind.css → css/style.css
npm run watch:css   # 開発中はウォッチ
```

`js/icons.js` は [lucide-static](https://www.npmjs.com/package/lucide-static)
から使用アイコンのみを抽出した生成物です。アイコンを追加する場合は
`node_modules/lucide-static/icons/*.svg` の内容を同じ形式で追記してください。

## GitHub Pages の初期設定 (リポジトリオーナー向け)

1. `Settings` → `Pages` で **Source** を **Deploy from a branch** にする
2. Branch を `main` / `/ (root)` に設定して保存する
3. `main` に push すると、その内容がそのまま Pages に公開されます
   (リポジトリ直下に `.nojekyll` を置いて Jekyll 処理を無効化済み)
4. 初回は Pages の有効化に数分かかることがあります

## ライセンス

[MIT](./LICENSE)
