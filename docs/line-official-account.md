# 公式LINE連携メモ

## 採用したOSS

### 本命: LINE Harness / line-harness-oss

- GitHub: `Shudesu/line-harness-oss`
- 公式LP: `https://shudesu.github.io/line-harness-oss/`
- LINE公式アカウント向けのOSS CRM。Lステップ/Utage系の無料代替候補。
- Cloudflare Workers + D1 + Pages構成。
- ステップ配信、セグメント配信、タグ、スコアリング、LIFFフォーム、リッチメニュー、REST API、MCP server を持つ。

採用管理ツールでは、LINE Harnessを「LINE運用本体」、Recruit AI CRMを「採用DB/歩留まり管理」として連携する。
詳細: `docs/line-harness-integration.md`

### 既存の補助実装

- `@line/line-bot-mcp-server` / GitHub: `line/line-bot-mcp-server`
  - LINE公式アカウントの Messaging API をMCP/CLI的に扱う公式OSS。
  - push / broadcast / profile / quota / rich menu 系に対応。
- `@line/liff-cli` / GitHub: `line/liff-cli`
  - LINE内Webアプリ（LIFF）の作成・更新に使う公式CLI。
- `@line/bot-sdk`
  - Next.js API RouteからWebhook返信・応募受付後のpush送信を行うための公式SDK。

補足: 以前探していた「LINEのHermes」は、おそらく今回指定の LINE Harness を指していた可能性が高い。

## 実装した導線

1. ユーザーが公式LINEを友だち追加
2. `/api/line/webhook` が follow / message / postback を受信
3. 「応募」「求人」「見学」「相談」の文言に応じて自動返信
4. 応募は `/line/apply?lineUserId=...` でLINE内完結フォームへ誘導
5. `/api/line/apply` が応募データを `応募` ステージとして受け付け、LINEへ受付完了メッセージをpush
6. 管理画面 `/pipeline` で LINE流入 → 応募 → 書類選考 → 一次面接 → 最終面接 → 内定 → 入社 の歩留まりを確認

現状のリポジトリはDB未接続デモのため、永続化は次フェーズで Supabase / Prisma に接続する。

## 必要な環境変数

```bash
LINE_CHANNEL_ACCESS_TOKEN=xxx
LINE_CHANNEL_SECRET=xxx
NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app
# 任意: 管理APIを外部から叩く場合
LINE_CLI_ADMIN_KEY=change-me

# LINE Harness連携
LINE_HARNESS_API_URL=https://your-worker.workers.dev
LINE_HARNESS_API_KEY=xxx
LINE_HARNESS_WEBHOOK_SECRET=change-me
LINE_HARNESS_APPLIED_TAG_ID=tag_uuid_optional
```

## CLI操作

```bash
# LINEユーザーへ送信
npm run line:send -- --to <LINE_USER_ID> --text "面接日程の候補をお送りします。"

# 友だち全体へ一斉配信（本番では要注意）
npm run line:broadcast -- --text "会社見学会のお知らせです。"

# 月間メッセージ枠確認
npm run line:quota

# プロフィール取得
npm run line:profile -- --user <LINE_USER_ID>

# LINE内応募URL生成
npm run line:apply-url -- --user <LINE_USER_ID>
```

## MCPサーバー起動

```bash
npm run line:mcp
```

MCPクライアント側には `@line/line-bot-mcp-server` を登録し、`CHANNEL_ACCESS_TOKEN` と必要に応じて `DESTINATION_USER_ID` を渡す。

## LIFF CLI

```bash
# 初回: LINE Login Channelを登録
npx liff-cli channel add <channel-id>
npx liff-cli channel use <channel-id>

# LIFFアプリ作成例
npx liff-cli app create \
  --name "Recruit AI 応募" \
  --endpoint-url "https://your-vercel-domain.vercel.app/line/apply" \
  --view-type full
```

## 次フェーズ

- `line_users`, `candidates`, `candidate_events`, `line_messages` テーブルを追加
- WebhookでLINE userIdと候補者をupsert
- 管理画面から候補者ごとのLINE送信・テンプレート送信・一斉配信を実装
- Rich Menuを `求人 / 応募 / 見学 / 相談` に固定
- Vercel本番環境変数投入後、Webhook URLをLINE Developersに設定
