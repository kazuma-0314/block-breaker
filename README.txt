# ブロック崩し（Web版）

## ファイル
- `index.html`：ページの構造
- `style.css`：見た目とスマホ向けレイアウト
- `game.js`：ゲームの処理

## PCで動作確認
この3ファイルを同じフォルダに置き、`index.html` をブラウザで開きます。
PythonやPygameのインストールは不要です。

## GitHub Pagesで公開
1. GitHubで新しいリポジトリを作成（例：`block-breaker`）。
2. このフォルダ内の `index.html`、`style.css`、`game.js` をリポジトリの一番上（ルート）にアップロード。
3. リポジトリの **Settings → Pages** を開く。
4. **Build and deployment** の **Deploy from a branch** を選択。
5. Branchを `main`、フォルダを `/(root)` にして **Save**。
6. 数分待ち、Pagesに表示されるURLを開く。

公開URLをスマホで開けば遊べます。URLからQRコードを作成して配布することもできます。

## 操作
- PC：← → または A / D
- スマホ：ゲーム画面上を左右にスワイプ／ドラッグ、または左右ボタン
- 一時停止：画面下のボタン（PCではスペースキーも可）
