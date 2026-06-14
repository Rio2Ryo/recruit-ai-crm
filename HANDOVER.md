# Recruit AI CRM — 引き継ぎチェックリスト

最終更新: 2026-06-13 (Shiro / shiro/bug-fixes PR)

---

## プロジェクト概要

| 項目 | 内容 |
|---|---|
| 目的 | LINE経由の採用フロー管理CRM（製造業向け高卒採用） |
| フロントエンド | Next.js 16 / Tailwind / shadcn — `projects/recruit-ai-crm/` |
| DB / Auth | Supabase PostgreSQL + 招待コードログイン（セッションCookie） |
| ホスティング | Vercel — `https://recruit-ai-crm.vercel.app` |
| LINEバックエンド | LINE Harness (Cloudflare Workers+D1) — `projects/line-harness-recruit/` |
| Prisma | v7 / `@prisma/adapter-pg` — スキーマ完成、migrate未実施 |

---

## 完成済み（mainブランチ）

- [x] Prisma schema 全モデル定義 (`prisma/schema.prisma`) — 26モデル
- [x] LINE Harness APIクライアント (`src/lib/line-harness.ts`)
- [x] LINE Harness Webhook受け口 (`POST /api/integrations/line-harness/submission`)
- [x] LINE Harness 送信プロキシ (`POST /api/integrations/line-harness/send`)
- [x] LINE直接Webhook (`POST /api/line/webhook`) — follow/message/postback/ファイル添付処理
- [x] LINE内応募フォーム (`/line/apply`) — エラー表示・バリデーション含む
- [x] Kanbanパイプライン画面 (`/pipeline`)
- [x] LINE設定画面 (`/settings/line`)
- [x] LINE CLIスクリプト (`scripts/line-cli.mjs`)
- [x] **認証**: 招待コードログイン (`/login`) — セッションCookie + `src/middleware.ts`
- [x] **RBAC**: ロール管理 (`src/lib/rbac.ts`, `rbac-members.ts`, `rbac-client.ts`)
  - `executive` / `manager` / `member` / `viewer` ロール
- [x] **スケジューリング**: 面接・会社見学枠管理 (`src/lib/scheduling.ts`, `line-scheduler.ts`)
  - 公開枠 → `/schedule` ページで学生が予約
- [x] **ドキュメント管理**: LINEから送られた添付書類の保存 (`src/lib/line-document-storage.ts`)
- [x] **分析API**: LINE行動ログ集計 (`/api/line/analytics`)
- [x] Vercelデプロイ済み (`commongiftedtokyo` org)
- [x] Vercel env: `LINE_CHANNEL_ACCESS_TOKEN`, `LINE_CHANNEL_SECRET`, `NEXT_PUBLIC_APP_URL` 設定済み

---

## ブロッカー一覧（外部セットアップ待ち）

### B1. Supabase プロジェクト作成・DB接続【最優先・必須】

**状態**: `prisma.ts` は `@prisma/adapter-pg` 使用。DATABASE_URL未設定のため **ランタイムでDB呼び出し全滅**。
ビルドは通る（build-time フォールバックURL使用）が、ログインするとメンバーロール取得で500エラー。

**必要な作業**:
1. Supabase で新規プロジェクト作成
2. 以下を Vercel env に追加:
   ```
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:6543/postgres?pgbouncer=true
   DIRECT_URL=postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres
   ```
3. マイグレーション実行（`DIRECT_URL` を設定済みであれば追加引数不要）:
   ```bash
   npx prisma migrate dev --name legacy-models
   npx prisma generate
   ```
   > **注意**: `migrate dev` は既存の2件のマイグレーション（schedule/line テーブル）を適用後、
   > スキーマに未含有の17個のレガシーモデル（Company/Student/Application 等）用の
   > 新しいマイグレーションファイルを `prisma/migrations/` に自動生成します。
   > 生成されたファイルを `git add && git commit` してください。
   > `prisma/schema.prisma` の datasource ブロックに `directUrl = env("DIRECT_URL")` を設定済みのため、
   > pgbouncer (port 6543) を通さず直接接続でDDLが実行される。
4. 初回ログインで `executive` ロールが自動付与される（`rbac-members.ts` 初期化ロジック）

**影響**: DB接続なしではログイン・候補者保存・スケジュール・ドキュメント保存が一切機能しない。

---

### B3. LINE Developers Webhook URL 登録【今すぐ可能】

**状態**: `LINE_CHANNEL_ACCESS_TOKEN` / `LINE_CHANNEL_SECRET` は Vercel 設定済み。Webhook URL未設定。

**必要な作業**:
1. LINE Developers Console → Messaging API channel → Webhook URL:
   `https://recruit-ai-crm.vercel.app/api/line/webhook`
2. Webhook ON、応答メッセージ OFF
3. Verify で疎通確認

**影響**: LINE公式アカウントへのメッセージがCRMに届かない。B1と独立して今すぐ実施可能。

---

### B2. LINE Harness (Cloudflare) デプロイ【B3の後】

**状態**: `projects/line-harness-recruit/` にコードあり。Cloudflare未デプロイ。

**必要な作業**:
1. `wrangler login`
2. D1作成 → Worker → Pages デプロイ (`cd projects/line-harness-recruit && npx create-line-harness`)
3. 管理画面でAPI Key発行
4. Vercel env に追加:
   ```
   LINE_HARNESS_API_URL=https://[your-worker].workers.dev
   LINE_HARNESS_API_KEY=[APIキー]
   LINE_HARNESS_WEBHOOK_SECRET=[シークレット]
   ```
5. Harness側 Outgoing Webhook: `POST https://recruit-ai-crm.vercel.app/api/integrations/line-harness/submission`

**影響**: Harness未接続でも直接Webhookは動作。タグ管理・ステップ配信が使えない。

---

## 環境変数 完全チェックリスト

### Vercel 設定済み ✅
- `LINE_CHANNEL_ACCESS_TOKEN`
- `LINE_CHANNEL_SECRET`
- `NEXT_PUBLIC_APP_URL` = `https://recruit-ai-crm.vercel.app`

### Vercel 未設定 / 要追加 ❌
- `DATABASE_URL` (Supabase pgbouncer URL — port 6543)
- `DIRECT_URL` (Supabase direct URL — port 5432、migrate時のみ使用)
- `RECRUIT_ADMIN_INVITE_CODES` (推奨: カンマ/改行区切りで複数設定可) または `RECRUIT_ADMIN_INVITE_CODE` (単一コード) — 未設定時は全員ログイン不可
- `LINE_CLI_ADMIN_KEY` (任意の長いランダム文字列 — 未設定時は `/api/line/send`, `/api/integrations/line-harness/send`, `/api/line/applicants/[id]/step-message` が全リクエストを拒否)
- `CRON_SECRET` (任意の長いランダム文字列 — 未設定時は `/api/line/scheduled/process` が全リクエストを拒否; Vercel Cronと合わせること)
- `LINE_HARNESS_API_URL`
- `LINE_HARNESS_API_KEY`
- `LINE_HARNESS_WEBHOOK_SECRET`
- `LINE_HARNESS_APPLIED_TAG_ID` (任意)
- `ANTHROPIC_API_KEY` (AIマッチング機能用)

### Supabase Auth について
**注意**: 旧バージョンでは Supabase Auth（Magic Link/Google OAuth）を使用していたが、現在は独自の招待コード方式に変更済み。`NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` は **不要**。必要なのは `DATABASE_URL` (Prisma pg接続用) のみ。

**⚠️ セキュリティ修正済み**: `/api/auth/google` ルートは残っているが `SUPABASE_ANON_KEY` 未設定のため無効。以前は `SUPABASE_SERVICE_ROLE_KEY` をフォールバックで anon key に使う危険なコードがあったが修正済み（`src/lib/supabase/env.ts`）。B1完了後に Supabase vars を追加する際も **`SUPABASE_SERVICE_ROLE_KEY` は Vercel には追加しないこと**。

---

## セキュリティ修正済み一覧（shiro/bug-fixes ブランチ）

### deny-by-default（キー未設定→全リクエスト拒否）
| ルート | ガードキー |
|---|---|
| `POST /api/line/send` | `LINE_CLI_ADMIN_KEY` |
| `POST /api/integrations/line-harness/send` | `LINE_CLI_ADMIN_KEY` |
| `POST /api/line/applicants/[id]/step-message` | `LINE_CLI_ADMIN_KEY` / `LINE_SETTINGS_ADMIN_KEY` |
| `GET /api/line/scheduled/process` (cron) | `CRON_SECRET` |
| `POST /api/settings/line/config` | `LINE_SETTINGS_ADMIN_KEY` / `LINE_CLI_ADMIN_KEY` |
| `POST /api/line/applicants/[id]/schedule` | `LINE_CLI_ADMIN_KEY` / `LINE_SETTINGS_ADMIN_KEY` |
| `POST /api/integrations/line-harness/submission` | `LINE_HARNESS_WEBHOOK_SECRET` |
| `POST /api/line/documents` | `LINE_CLI_ADMIN_KEY` / `LINE_HARNESS_WEBHOOK_SECRET` |

### session cookie gate（`recruit-ai-session-email` 存在確認）
全ての書き込み操作・PII 返却エンドポイントに追加済み:
`GET /api/line/applicants`, `PATCH /api/line/applicants/[id]`,
`POST /api/line/applicants/[id]/message`, `GET /api/line/analytics`,
`POST /api/line/messages`, `POST/DELETE /api/line/scheduled`,
`GET /api/line/documents/[id]`,
`POST/DELETE /api/schedules/events`, `POST/PATCH /api/schedules/slots`,
`POST/PATCH /api/schedules/bookings`

### ⚠️ B1完了後に追加すべきハードニング（現状の限界）

現在の session gate は Cookie の**存在のみ**を確認する。`httpOnly` / `sameSite: "lax"` / `secure`（本番）フラグが主な保護だが、curl などの直接 HTTP リクエストで Cookie ヘッダーを偽造可能。B1（DB 接続）完了後に各 session gate を以下のパターンへ移行すること:

```typescript
// 現在（Cookie 存在確認のみ）
const sessionEmail = request.cookies.get("recruit-ai-session-email")?.value?.trim();
if (!sessionEmail) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

// B1後の推奨（DB でメンバー検証）
import { getRecruitingMemberRoleByEmail } from "@/lib/rbac-members";
const email = request.cookies.get("recruit-ai-session-email")?.value?.trim().toLowerCase() ?? "";
const member = email ? await getRecruitingMemberRoleByEmail(email) : null;
if (!member?.active) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
```

対象: 上記 session cookie gate を追加した全ルート（`/api/rbac/members` は既にこのパターン実装済み）。

---

## B1完了後の実装TODO（コード変更が必要）

1. **Pipelineページを DB から取得**
   - `src/app/(dashboard)/pipeline/page.tsx` のデモデータを Prisma query に置換
   - `src/lib/line-applicant-store.ts` のインメモリストアを `Student`/`Application` upsert に変更

2. **LINE Harness submission → DB upsert**
   - `POST /api/integrations/line-harness/submission` で Prisma upsert

3. **ステージ移動 → Harness metadata 同期**
   - パイプライン「進める」ボタン → Harness タグ更新

---

## ファイル構成早見表

```
projects/recruit-ai-crm/
├── prisma/schema.prisma           # DBスキーマ 26モデル
├── prisma/migrations/             # 2件のマイグレーション (未apply)
├── src/
│   ├── middleware.ts              # 認証 (招待コード → セッションCookie)
│   ├── app/
│   │   ├── (auth)/login/          # ログインページ
│   │   ├── (dashboard)/
│   │   │   ├── pipeline/          # 候補者パイプライン
│   │   │   ├── schedules/         # 面接・見学枠管理
│   │   │   ├── members/           # メンバー・ロール管理
│   │   │   └── settings/line/     # LINE設定
│   │   ├── api/
│   │   │   ├── auth/              # login / logout / callback / me
│   │   │   ├── integrations/line-harness/
│   │   │   ├── line/              # webhook / apply / applicants / documents / analytics
│   │   │   ├── schedules/         # events / slots / bookings
│   │   │   └── rbac/              # members / roles
│   │   ├── line/apply/            # LINEフォームUI
│   │   └── schedule/              # 学生向け予約ページ
│   └── lib/
│       ├── prisma.ts              # PrismaClient (@prisma/adapter-pg)
│       ├── auth-session.ts        # セッション管理
│       ├── invite-code.ts         # 招待コード検証
│       ├── rbac.ts / rbac-members.ts / rbac-client.ts
│       ├── scheduling.ts / line-scheduler.ts
│       ├── line-applicant-store.ts # インメモリストア (B1完了後にDB移行)
│       ├── line-document-storage.ts
│       └── line-workflow.ts
├── docs/
│   ├── line-harness-integration.md
│   ├── line-harness-capabilities.md
│   └── preview-readiness.md
└── scripts/line-cli.mjs

projects/line-harness-recruit/     # LINE Harness OSS (Cloudflare未デプロイ)
```
