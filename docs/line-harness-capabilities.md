# LINE Harness capabilities for Recruit AI CRM

## Harnessでできること

現時点では、CRM側で「実行可」「設定可」「不足API」に分けて扱う。

### 実行可

- Harness API接続確認
- 友だち一覧取得
- Harness応募フォーム submission webhook 受信
- 応募時の friend metadata 更新
- 応募済みタグ付与
- 候補者への1:1 LINE送信
- 管理画面からのタグ付与
- 管理画面からのmetadata更新

### 設定可

- 公式LINEアカウント名
- 友だち追加URL
- リッチメニュー応募URL
- Harness管理画面URL
- Harness応募フォームURL
- 応募誘導メッセージ
- テスト送信用Harness friendId
- submission webhook URL / send API URL のコピー
- Harness必須envの設定状態表示

### 不足API

- Harness側フォーム一覧/フォーム詳細の取得
- rich menuテンプレートの作成/反映
- CRMステージ変更時のHarness tag/metadata同期
- セグメント配信/予約配信
- ステップ配信/面接リマインド登録
- LINE添付ファイル本体の取得とストレージ保存

## 管理画面に必要なタブ

`/settings/line` に以下の見え方を追加済み。

- できること: capabilities一覧
- 設定: 公式LINE入口、Harnessフォーム、env、URLコピー
- テスト: env確認、Harness接続確認、応募受信セルフテスト、送信テスト導線
- 不足API: 次に実装するAPI一覧

## 外部仕様メモ

- LINE Messaging APIはwebhook受信、メッセージ送信、rich menu、audience等を提供する。
- Rich menuはMessaging API上で作成/画像アップロード/デフォルト設定/ユーザー別リンクができる。
- LINE Harness OSSの公開情報では、step delivery、segmented broadcast、rich menu switching、forms、scoring、IF-THEN automation、API exposureが主機能。

CRMではLINE Messaging APIを直接広げず、HarnessのREST/API/管理画面に委譲する。
