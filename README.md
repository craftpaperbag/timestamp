# timestamp

頭痛薬を飲んだ時間など、「いま」をワンタップで記録するためのHTMLアプリ。GitHub Pagesでそのまま動きます。

## 公開URL

- 本番 (main): https://craftpaperbag.github.io/timestamp/
- 動作確認 (staging): https://craftpaperbag.github.io/timestamp/staging/

> どちらも GitHub Pages 上の同一サイト内に共存しており、`main` ブランチが
> `/`、`staging` ブランチが `/staging/` で公開されます。

## 特長

- 事前に登録したタイトル(例: `頭痛薬` / `コーヒー` / `目薬`)のボタンを
  タップするだけで、その瞬間の日時を記録します。
- 記録は新しい順に表示され、いつでも編集・個別削除・全件削除が可能です。
- 記録を JSON ファイルとして書き出せます。
- 落ち着いた赤を基調に、角丸と余白を活かした柔らかいデザイン。
- ライト/ダーク/自動の3種類の表示モード。
- グレースケールでも判別できる配色と、大きめのタップ領域。

## データの取り扱い

- 記録はサーバーには送信されず、**お使いのブラウザの localStorage** に
  のみ保存されます。
- 別の端末・別のブラウザには引き継がれません。バックアップが必要な場合は
  「JSON エクスポート」をご利用ください。
- **タイトルには個人情報・機密情報を入力しないでください。** ブラウザ拡張や
  端末を共有する他者から閲覧される可能性があります。

## ローカルでの確認

ビルド不要の静的サイトです。任意の HTTP サーバーで配信できます。

```sh
python3 -m http.server -d . 8000
# → http://localhost:8000 を開く
```

## GitHub Pages の初期設定 (リポジトリオーナー向け)

1. `Settings` → `Pages` で **Source** を **GitHub Actions** に切り替える
2. `main` または `staging` に push すると `.github/workflows/pages.yml` が
   走り、両ブランチを束ねたサイトを Pages にデプロイします
3. 初回は Pages の有効化に数分かかることがあります

## ライセンス

[MIT](./LICENSE)
