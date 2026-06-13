# Recruit AI CRM — 引き継ぎチェックリスト

作成: 2026-06-09 (Shiro / shiro-recruit-handover)

---

## プロジェクト概要

| 項目 | 内容 |
|---|---|
| 目的 | LINE経由の採用フロー管理CRM（製造業向け高卒採用） |
| フロントエンド | Next.js 15 / Tailwind / shadcn — `projects/recruit-ai-crm/` |
| DB / Auth | Supabase (PostgreSQL + Supabase Auth) |
| ホスティング | Vercel — `https://recruit-ai-crm.vercel.app` |
| LINEバックエンド | LINE Harness (Cloudflare Workers+D1) — `projects/line-harness-recruit/` |
| Prisma schema | 完成済み (Company / Student / Application / Job / School ほか全モデル) |

---

## 完成済み（ローカルコード）

- [x] Prisma schema 全モデル定義 (`prisma/schema.prisma`)
- [x] LINE Harness APIクライアント (`src/lib/line-harness.ts`)
  - `listFriends`, `sendMessage`, `setMetadata`, `addTag`
- [x] LINE Harness Webhook受け口 (`POST /api/integrations/line-harness/submission`)
  - フォーム送信 → 応募者オブジェクト作成 → Harness側 metadata/tag 返し書き
- [x] LINE Harness 送信プロキシ (`POST /api/integrations/line-harness/send`)
- [x] LINE直接Webhook (`POST /api/line/webhook`) — follow/message/postback処理
- [x] LINE内応募フォーム (`/line/apply`)
- [x] Kanbanパイプライン画面 (`/pipeline`) — デモデータ + インメモリLINE応募者表示
- [x] LINE設定画面 (`/settings/line`) + 環境変数ステータスAPI
- [x] LINE CLIスクリプト (`scripts/line-cli.mjs`) — send / broadcast / quota / profile
- [x] 連携ドキュメント (`docs/line-harness-integration.md`, `docs/line-official-account.md`)
- [x] Vercel にデプロイ済み (`commongiftedtokyo` org, project `recruit-ai-crm`)
- [x] Vercel env: `LINE_CHANNEL_ACCESS_TOKEN`, `LINE_CHANNEL_SECRET`, `NEXT_PUBLIC_APP_URL` 設定済み

---

## ブロッカー一覧（外部セットアップ待ち）

### B1. Supabase プロジェクト作成・接続【必須】

**状態**: `.env` には `DATABASE_URL` のみ(Prisma Postgres形式の仮値)。Supabaseプロジェクト未作成。

**必要な作業**:
1. Supabase で新規プロジェクト作成
2. 以下を Vercel env (`recruit-ai-crm` プロジェクト) に追加:
   ```
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:6543/postgres?pgbouncer=true
   DIRECT_URL=postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres
   NEXT_PUBLIC_SUPABASE_URL=https://[REF].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```
3. ローカルから `npx prisma migrate deploy` でスキーマをSupabaseに適用
4. `src/middleware.ts` の bypass モードを外し Supabase Auth 接続

**影響**: DB接続なしではユーザー認証・永続化が一切機能しない。

---

### B2. LINE Harness (Cloudflare) デプロイ【優先高】

**状態**: `projects/line-harness-recruit/` にコードあり。Cloudflare未デプロイ。

**必要な作業**:
1. Cloudflare アカウントで `wrangler login`
2. `cd projects/line-harness-recruit && npx create-line-harness`
   または手動: D1作成 → Worker デプロイ → Pages デプロイ
3. 管理画面でAPI Keyを発行
4. 以下を Vercel env に追加:
   ```
   LINE_HARNESS_API_URL=https://[your-worker].workers.dev
   LINE_HARNESS_API_KEY=[発行したAPIキー]
   LINE_HARNESS_WEBHOOK_SECRET=[任意のシークレット文字列]
   ```
5. LINE Harness 側で Outgoing Webhook を設定:
   `POST https://recruit-ai-crm.vercel.app/api/integrations/line-harness/submission`
   ヘッダ: `x-line-harness-secret: [LINE_HARNESS_WEBHOOK_SECRET]`

**影響**: Harness未接続でも直接Webhook (`/api/line/webhook`) は動作するが、タグ・ステップ配信・LIFF フォームが使えない。

---

### B3. LINE Developers Webhook URL 登録【B2前に完了可能】

**状態**: `LINE_CHANNEL_ACCESS_TOKEN` / `LINE_CHANNEL_SECRET` は Vercel に設定済み。Webhook URL 未設定。

**必要な作業**:
1. LINE Developers Console → Messaging API channel → Webhook URL を設定:
   `https://recruit-ai-crm.vercel.app/api/line/webhook`
2. Webhook を ON、応答メッセージを OFF に設定
3. Verify ボタンで疎通確認

**影響**: Webhook未設定ではLINE公式アカウントへのメッセージが届かない。

---

### B4. Supabase Auth 有効化【B1完了後】

**状態**: `src/middleware.ts` は auth bypass中。

**必要な作業**:
1. Supabase で Auth を有効化 (Email or Magic Link)
2. `src/middleware.ts` を実装済みコード (`src/lib/supabase/server.ts`) を使う形に変更
3. `/login` ページを有効化

---

## 次フェーズ実装 TODO（コード変更が必要）

優先度順:

1. **Supabase接続後: Pipelineページを DB から取得**
   - `src/app/(dashboard)/pipeline/page.tsx` の `demoFunnelCandidates` を Prisma query に置換
   - `src/lib/line-applicant-store.ts` のインメモリストアを `Student`/`Application` への upsert に変更

2. **LINE Harness submission → DB upsert**
   - `POST /api/integrations/line-harness/submission` で `Student` + `Application` を Prisma で upsert
   - `lineUserId` / `friendId` を `Student.metadata` に保持

3. **ステージ移動 → Harness metadata 同期**
   - パイプラインの「進める/戻す」ボタン → `PUT /api/integrations/line-harness/send` でタグ更新

4. **候補者カード → LINE送信ボタン**
   - `POST /api/integrations/line-harness/send` に接続

5. **Auth有効化後: ロール別アクセス制御**
   - `CompanyMember.canManageLine` / `canViewResumes` を middleware で使用

---

## Yakon 判断依頼

以下について Go/No-go + 担当者アサインをお願いします:

| # | 作業 | リスク | 推奨 |
|---|---|---|---|
| B1 | Supabaseプロジェクト作成 | 低 (無料枠OK) | **最優先でGo** — 他全ての基盤 |
| B2 | Cloudflare/LINE Harnessデプロイ | 低〜中 (LINE公式に繋がる) | B1と並行可 |
| B3 | LINE Webhook URL登録 | 低 (Vercel側設定なし) | **今すぐGo可能** |
| B4 | Supabase Auth有効化 | 中 (ユーザー体験に影響) | B1完了後 |

**推奨次アクション**: B3 (LINE Webhook登録) → B1 (Supabase作成) の順で進める。B2はCloudflareアカウント保有者がセットアップ。

---

## 環境変数 完全チェックリスト

### Vercel 設定済み ✅
- `LINE_CHANNEL_ACCESS_TOKEN`
- `LINE_CHANNEL_SECRET`
- `NEXT_PUBLIC_APP_URL` = `https://recruit-ai-crm.vercel.app`

### Vercel 未設定 / 要追加 ❌
- `DATABASE_URL` (Supabase pgbouncer URL)
- `DIRECT_URL` (Supabase direct URL)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `LINE_HARNESS_API_URL`
- `LINE_HARNESS_API_KEY`
- `LINE_HARNESS_WEBHOOK_SECRET`
- `LINE_HARNESS_APPLIED_TAG_ID` (任意: 応募済みタグのUUID)
- `ANTHROPIC_API_KEY` (AI matching機能用)

### ローカル `.env.vercel.local` に存在するが Vercel 未設定
- `LINE_CLI_ADMIN_KEY` (空 — 任意)
- `LINE_SETTINGS_ADMIN_KEY` (空 — 任意)

---

## ファイル構成早見表

```
projects/recruit-ai-crm/
├── prisma/schema.prisma          # DB スキーマ (完成済み)
├── src/
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   ├── pipeline/page.tsx # 歩留まり管理Kanban
│   │   │   └── settings/line/    # LINE設定画面
│   │   ├── api/
│   │   │   ├── integrations/line-harness/
│   │   │   │   ├── submission/   # Harness→CRM Webhook受け口
│   │   │   │   └── send/         # CRM→Harness送信プロキシ
│   │   │   └── line/
│   │   │       ├── webhook/      # LINE直接Webhook
│   │   │       ├── apply/        # 応募受付
│   │   │       └── applicants/   # インメモリ応募者一覧
│   │   └── line/apply/           # LINEフォームUI
│   └── lib/
│       ├── line-harness.ts       # Harness APIクライアント
│       ├── line-applicant-store.ts # インメモリストア (暫定)
│       └── line-recruiting.ts    # 応募者型定義
├── docs/
│   ├── line-harness-integration.md
│   └── line-official-account.md
└── scripts/line-cli.mjs          # LINE CLI

projects/line-harness-recruit/    # LINE Harness OSS (Cloudflare未デプロイ)
├── apps/worker/                  # Cloudflare Worker (API)
├── apps/web/                     # 管理ダッシュボード (Next.js)
└── packages/                     # SDK / MCP server / DB など
```
