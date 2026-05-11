# timestamp

頭痛薬を飲んだ時間など、「いま」をワンタップで記録するためのHTMLアプリ。GitHub Pagesでそのまま動きます。

## 公開URL

- 本番 (main): https://craftpaperbag.github.io/timestamp/

> `main` ブランチに push すると、GitHub Pages がブランチの内容を
> そのまま配信します (Source: `Deploy from a branch` / `main` / `/ (root)`)。
> 動作確認は本番デプロイ前にローカルの軽量 web サーバーで行ってください
> (下記「ローカルでの確認」を参照)。

## 特長

- 事前に登録したタイトル(例: `頭痛薬` / `コーヒー` / `目薬`)のボタンを
  タップするだけで、その瞬間の日時を記録します。
- 記録は新しい順に表示され、いつでも編集・個別削除・全件削除が可能です。
- 記録を JSON ファイルとして書き出せます。
- [デジタル庁デザインシステム (DADS)](https://design.digital.go.jp/dads/)
  に準拠したカラー・タイポグラフィ・余白・角丸・エレベーション。
  デザイントークンは公式の
  [`@digital-go-jp/design-tokens`](https://github.com/digital-go-jp/design-tokens)
  (MIT) より抜粋。
- ライト/ダーク/自動の3種類の表示モード。
- グレースケールでも判別できる配色と、大きめのタップ領域 (最低 44px)。

## データの取り扱い

- 記録はサーバーには送信されず、**お使いのブラウザの localStorage** に
  のみ保存されます。
- 別の端末・別のブラウザには引き継がれません。バックアップが必要な場合は
  「JSON エクスポート」をご利用ください。
- **タイトルには個人情報・機密情報を入力しないでください。** ブラウザ拡張や
  端末を共有する他者から閲覧される可能性があります。

## ローカルでの確認

ビルド不要の静的サイトです。本番に反映する前に、ローカルの軽量 web サーバーで
動作確認してください。任意の HTTP サーバーで配信できます。

```sh
python3 -m http.server -d . 8000
# → http://localhost:8000 を開く
```

> `file://` で直接開くと一部ブラウザでモジュールや fetch が動かないため、
> 必ず HTTP サーバー越しに開いてください。

## GitHub Pages の初期設定 (リポジトリオーナー向け)

1. `Settings` → `Pages` で **Source** を **Deploy from a branch** にする
2. Branch を `main` / `/ (root)` に設定して保存する
3. `main` に push すると、その内容がそのまま Pages に公開されます
   (リポジトリ直下に `.nojekyll` を置いて Jekyll 処理を無効化済み)
4. 初回は Pages の有効化に数分かかることがあります

## ライセンス

[MIT](./LICENSE)
