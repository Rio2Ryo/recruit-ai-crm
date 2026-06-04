# LINE Harness 導入メモ

## 方針

既存の `@line/bot-sdk` 直叩き実装は最小Webhook/CLIとして残しつつ、運用本体は **LINE Harness / line-harness-oss** に寄せる。

理由:
- ステップ配信、セグメント、タグ、フォーム、リッチメニュー、予約配信を自前実装しなくてよい
- Cloudflare Workers + D1 で本体と独立運用できる
- REST API / SDK / MCP があり、採用管理ツール側から候補者連携しやすい
- 将来、複数公式LINEアカウントやBAN検知/切替が必要になっても拡張余地がある

## 推奨アーキテクチャ

```text
応募者
  ↓ LINE
LINE Harness Worker + D1
  - 友だち管理
  - タグ/スコア
  - LIFFフォーム
  - ステップ配信/リマインド
  - オペレーターチャット
  ↓ Webhook / REST API
Recruit AI CRM (Next.js / Vercel)
  - 候補者/学生/応募データ
  - 選考ステージ
  - 人事向け管理画面 /pipeline
  - 面接・内定・入社管理
```

役割分担:
- LINE Harness: LINE上の会話・配信・フォーム・タグ・シナリオを担当
- Recruit AI CRM: 採用DB、歩留まり、社内オペレーション、管理画面を担当

## 追加した連携口

### 1. LINE Harness API client

`src/lib/line-harness.ts`

対応済み:
- `listFriends()`
- `sendMessage(friendId, content)`
- `setMetadata(friendId, metadata)`
- `addTag(friendId, tagId)`

環境変数:

```bash
LINE_HARNESS_API_URL=https://your-worker.workers.dev
LINE_HARNESS_API_KEY=xxx
LINE_HARNESS_TIMEOUT_MS=30000 # optional
```

### 2. フォーム送信Webhook受け口

`POST /api/integrations/line-harness/submission`

LINE Harness のフォーム送信/Outgoing Webhook から呼び出す想定。

受信例:

```json
{
  "formId": "recruit-apply",
  "friendId": "friend_uuid",
  "lineUserId": "Uxxxxxxxx",
  "data": {
    "氏名": "山田太郎",
    "学校名": "〇〇高校",
    "学科": "機械科",
    "希望職種": "施工管理",
    "電話番号": "090-xxxx-xxxx",
    "メールアドレス": "taro@example.com",
    "自己PR・質問": "会社見学を希望します"
  }
}
```

動作:
- Recruit AI CRM側の応募者オブジェクトへ正規化
- `currentStage: "応募"` として扱う
- Harness側 friend metadata に `recruitStage`, `recruitCandidateId`, `applicantName` 等を返し書き
- `LINE_HARNESS_APPLIED_TAG_ID` があれば応募済みタグを付与

任意の保護ヘッダ:

```bash
LINE_HARNESS_WEBHOOK_SECRET=xxx
# request header: x-line-harness-secret: xxx
```

### 3. 採用管理ツールからLINE送信

`POST /api/integrations/line-harness/send`

```json
{
  "friendId": "friend_uuid",
  "text": "一次面接の日程候補をお送りします。"
}
```

`LINE_CLI_ADMIN_KEY` が設定されている場合は `x-admin-key` 必須。

## 採用ステージとのマッピング

| Recruit AI CRM | LINE Harness側の状態 |
| --- | --- |
| LINE流入 | friend追加 / `source=line` metadata |
| 応募 | フォーム送信 / `応募済み` tag |
| 書類選考 | `書類選考中` tag / シナリオ停止 or 次案内 |
| 一次面接 | 面接リマインダー scenario enroll |
| 最終面接 | 最終面接リマインダー scenario enroll |
| 内定 | `内定` tag / 内定者フォロー配信 |
| 入社 | `入社予定/入社済み` tag |

## PoC最短手順

1. LINE HarnessをCloudflareへデプロイ
   - Worker + D1 + 管理画面
   - API_KEY / LINE credentials を設定
2. Recruit AI CRMのVercel envに追加
   - `LINE_HARNESS_API_URL`
   - `LINE_HARNESS_API_KEY`
   - `LINE_HARNESS_WEBHOOK_SECRET`
   - `LINE_HARNESS_APPLIED_TAG_ID`（任意）
3. Harness側で応募フォームを作成
   - 氏名 / 学校名 / 学科 / 希望職種 / 電話 / メール / 自己PR・質問
4. HarnessのOutgoing Webhookまたはフォーム送信後処理で以下を呼ぶ
   - `POST https://<recruit-ai-domain>/api/integrations/line-harness/submission`
5. `/pipeline` にLINE応募者が出るようDB永続化を接続

## 次に実装するべきこと

現在のリポジトリは `/pipeline` がデモデータ中心なので、次はDB接続が必要。

優先順:
1. Prisma schemaにLINE連携テーブル追加
   - `LineFriend`
   - `CandidateEvent` または `ApplicationEvent`
   - `LineMessageLog`
2. `/api/integrations/line-harness/submission` で Student / Application を upsert
3. `/pipeline` を `demoFunnelCandidates` ではなくDBから取得
4. 候補者カードに「LINE送信」ボタンを追加し `/api/integrations/line-harness/send` に接続
5. ステージ移動時にHarness metadata/tagを更新

## 注意点

- LINE Harnessは別サービスとしてデプロイするのが安全。Recruit AI CRMへ丸ごと取り込むより、責務分離した方が速い。
- `friendId` と `lineUserId` のどちらを主キーにするかを早めに固定する。CRM側は `friendId` 優先、補助で `lineUserId` を保持するのが良い。
- 一斉配信/ステップ配信は誤送信リスクがあるため、PoCでは応募受付・面接連絡・リマインダーに限定する。
- 本番LINEアカウントの設定、Webhook設定、配信実行は外部影響があるので事前確認必須。

## 2026-05-25 管理画面へ反映するHarness機能

LINE Harness OSS READMEと既存連携コードを元に、採用CRMから扱う機能を以下に整理した。

### Harnessの主要機能
- 配信: ステップ配信、ブロードキャスト、予約/リマインダー、テンプレート、トラッキングリンク
- CRM: 友だち管理、タグ、スコアリング、オペレーターチャット、Conversation Inbox、重複検出
- マーケティング: リッチメニュー、LIFFフォーム、カレンダー予約、スタッフ管理
- 自動化: IF-THENルール、自動返信、Webhook IN/OUT、通知ルール
- マルチアカウント: 複数公式LINE、アカウント別配信、BAN検知、トラフィックプール
- AI/API: SDK、MCP server、`GET /api/capabilities`

### Recruit AI CRM管理画面で扱うもの
- `/settings/line`: 機能一覧と運用設計を表示
- `/api/settings/line/harness`: CRMからHarness APIを呼ぶ管理操作口
  - `list-friends`: 友だち一覧取得、タグ絞り込み
  - `send-message`: friendId指定の1:1送信
  - `add-tag`: 応募/選考ステージ同期用タグ付与
  - `set-metadata`: `recruitStage`, `recruitCandidateId`, `source` 等のmetadata更新
- 既存: submission webhook、送信API、env保存、接続テスト、webhook self-test

### Harness管理画面に残すもの
ステップ配信、ブロードキャスト、リッチメニュー、フォーム作成、IF-THENルール、スタッフ/権限、BAN/マルチアカウント管理は、誤送信・外部影響が大きいため、まずはHarness管理画面で作成し、CRM側ではURL/運用状態/連携テストを管理する。
