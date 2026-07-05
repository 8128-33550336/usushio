# usushio

ホスト名とURLパスから、メッセージを生成して返すWebサーバーです。

HTML、JSON、プレーンテキスト、PNG画像での出力に対応しています。Node.jsアプリケーションとしてDockerコンテナ内で動作します。

## 使用ライブラリ

- [canvas](https://www.npmjs.com/package/canvas) — PNG画像の生成
- [Mustache](https://www.npmjs.com/package/mustache) — HTMLおよびテキストテンプレートの展開
- [punycode](https://www.npmjs.com/package/punycode) — 国際化ドメイン名の変換

## ローカルでの起動

Docker Composeを使用します。

```console
docker compose up --build
```

起動後は `http://localhost:3000` でアクセスできます。

```console
curl -H 'Host: usush.io' http://localhost:3000/
```

## テスト

テストもコンテナ内で実行します。

```console
docker compose run --rm app npm test
```
