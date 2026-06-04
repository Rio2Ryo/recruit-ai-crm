"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clipboard,
  Clock,
  Loader2,
  MessageSquareText,
  Save,
  Send,
  Settings2,
  Tags,
  TestTube2,
  Trash2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LineSettings = {
  officialAccountName: string;
  addFriendUrl: string;
  harnessDashboardUrl: string;
  harnessFormUrl: string;
  richMenuApplyUrl: string;
  defaultApplyMessage: string;
  testFriendId: string;
  stageTagMapJson: string;
  messageTemplatesJson: string;
  scheduledMessageRulesJson: string;
  automationRulesJson: string;
  updatedAt?: string;
};

type State =
  | { type: "idle" }
  | { type: "loading"; message: string }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

type ApplicantOption = {
  id: string;
  name?: string;
  displayName?: string;
  school?: string;
  jobTitle?: string;
  currentStage: string;
  lineUserId: string;
  friendId?: string;
};

type ScheduledLineMessage = {
  id: string;
  applicantId: string;
  title: string;
  text?: string;
  scheduledFor: string;
  status: "pending" | "sent" | "failed" | "cancelled";
};

type RecipientMode = "individual" | "job" | "all";

const steps = [
  { key: "setup", label: "1. 入口", icon: Settings2, help: "友だち追加と応募フォームを設定" },
  { key: "messages", label: "2. 返信", icon: MessageSquareText, help: "応募受付・面接案内の文面" },
  { key: "reservation", label: "3. 予約", icon: Clipboard, help: "応募1日後などの自動送信予約" },
  { key: "stages", label: "4. 選考", icon: Tags, help: "選考ステージとLINEタグを同期" },
  { key: "test", label: "5. テスト", icon: TestTube2, help: "応募導線と送信を確認" },
] as const;

type StepKey = (typeof steps)[number]["key"];

function getOrigin() {
  if (typeof window === "undefined") return "";
  return window.location.origin;
}

function isValidJson(value: string) {
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}

function toDatetimeLocal(value: Date) {
  const offset = value.getTimezoneOffset();
  const local = new Date(value.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

function displayDateTime(value: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function LineRecruitingAdminConsole() {
  const [active, setActive] = useState<StepKey>("setup");
  const [settings, setSettings] = useState<LineSettings | null>(null);
  const [adminKey, setAdminKey] = useState("");
  const [state, setState] = useState<State>({ type: "idle" });
  const [copied, setCopied] = useState("");
  const [testMessage, setTestMessage] = useState("応募ありがとうございます。採用担当が確認してご連絡します。");
  const [applicants, setApplicants] = useState<ApplicantOption[]>([]);
  const [recipientMode, setRecipientMode] = useState<RecipientMode>("individual");
  const [selectedApplicantId, setSelectedApplicantId] = useState("");
  const [selectedJobTitle, setSelectedJobTitle] = useState("");
  const [scheduleTitle, setScheduleTitle] = useState("応募フォロー");
  const [scheduleAt, setScheduleAt] = useState(() => toDatetimeLocal(new Date(Date.now() + 24 * 60 * 60 * 1000)));
  const [scheduleBody, setScheduleBody] = useState("応募ありがとうございます。\n選考について確認したい事項がありましたら、このLINEにご返信ください。");
  const [schedules, setSchedules] = useState<ScheduledLineMessage[]>([]);

  const origin = getOrigin();
  const submissionWebhook = `${origin}/api/integrations/line-harness/submission`;
  const simpleApplyUrl = `${origin}/line/apply`;
  const publicScheduleUrl = `${origin}/schedule`;
  const scheduledProcessUrl = `${origin}/api/line/scheduled/process`;
  const jobTitles = Array.from(new Set(applicants.map((applicant) => applicant.jobTitle ?? "希望職種未定"))).sort();
  const targetCount = recipientMode === "all"
    ? applicants.length
    : recipientMode === "job"
      ? applicants.filter((applicant) => (applicant.jobTitle ?? "希望職種未定") === selectedJobTitle).length
      : selectedApplicantId ? 1 : 0;

  useEffect(() => {
    fetch("/api/settings/line/config", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error(`status ${response.status}`);
        const json = await response.json();
        setSettings(json.settings);
      })
      .catch((error) => setState({ type: "error", message: error instanceof Error ? error.message : "LINE設定を取得できませんでした。" }));
  }, []);

  useEffect(() => {
    refreshReservationData();
  }, []);

  async function refreshReservationData() {
    const [applicantResponse, scheduleResponse] = await Promise.all([
      fetch("/api/line/applicants", { cache: "no-store" }),
      fetch("/api/line/scheduled", { cache: "no-store" }),
    ]);
    if (applicantResponse.ok) {
      const json = await applicantResponse.json();
      const items = (json.applicants ?? []) as ApplicantOption[];
      setApplicants(items);
      setSelectedApplicantId((current) => current || items[0]?.id || "");
      setSelectedJobTitle((current) => current || Array.from(new Set(items.map((item) => item.jobTitle ?? "希望職種未定"))).sort()[0] || "");
    }
    if (scheduleResponse.ok) {
      const json = await scheduleResponse.json();
      setSchedules((json.schedules ?? []) as ScheduledLineMessage[]);
    }
  }

  function update(key: keyof LineSettings, value: string) {
    setSettings((current) => (current ? { ...current, [key]: value } : current));
  }

  async function save() {
    if (!settings) return;
    if (!isValidJson(settings.stageTagMapJson)) {
      setState({ type: "error", message: "選考ステージ/タグ設定のJSONが不正です。" });
      return;
    }
    if (!isValidJson(settings.messageTemplatesJson)) {
      setState({ type: "error", message: "返信テンプレートのJSONが不正です。" });
      return;
    }
    if (!isValidJson(settings.scheduledMessageRulesJson)) {
      setState({ type: "error", message: "予約送信ルールのJSONが不正です。" });
      return;
    }
    if (!isValidJson(settings.automationRulesJson)) {
      setState({ type: "error", message: "自動化ルールのJSONが不正です。" });
      return;
    }

    setState({ type: "loading", message: "保存中..." });
    try {
      const response = await fetch("/api/settings/line/config", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(adminKey ? { "x-admin-key": adminKey } : {}),
        },
        body: JSON.stringify(settings),
      });
      const json = await response.json();
      if (!response.ok || !json.ok) throw new Error(json.message ?? json.error ?? "保存に失敗しました。");
      setSettings(json.settings);
      setState({ type: "success", message: "LINE採用設定を保存しました。" });
    } catch (error) {
      setState({ type: "error", message: error instanceof Error ? error.message : "保存に失敗しました。" });
    }
  }

  async function sendTest() {
    if (!settings?.testFriendId) {
      setState({ type: "error", message: "テスト送信用 friendId を入力してください。" });
      return;
    }
    setState({ type: "loading", message: "テスト送信中..." });
    try {
      const response = await fetch("/api/settings/line/harness", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(adminKey ? { "x-admin-key": adminKey } : {}),
        },
        body: JSON.stringify({ action: "send-message", friendId: settings.testFriendId, text: testMessage }),
      });
      const json = await response.json();
      if (!response.ok || !json.ok) throw new Error(json.message ?? json.error ?? "送信に失敗しました。");
      setState({ type: "success", message: "Harness経由でテスト送信しました。" });
    } catch (error) {
      setState({ type: "error", message: error instanceof Error ? error.message : "送信に失敗しました。" });
    }
  }

  async function reserveMessage() {
    if (targetCount === 0) {
      setState({ type: "error", message: "配信先を選択してください。" });
      return;
    }
    if (!scheduleAt) {
      setState({ type: "error", message: "予約日時を指定してください。" });
      return;
    }
    if (!scheduleBody.trim()) {
      setState({ type: "error", message: "メッセージ本文を入力してください。" });
      return;
    }

    setState({ type: "loading", message: "メッセージを予約中..." });
    try {
      const response = await fetch("/api/line/scheduled", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(adminKey ? { "x-admin-key": adminKey } : {}),
        },
        body: JSON.stringify({
          targetMode: recipientMode,
          applicantId: selectedApplicantId,
          jobTitle: selectedJobTitle,
          sendAt: new Date(scheduleAt).toISOString(),
          title: scheduleTitle,
          text: scheduleBody,
        }),
      });
      const json = await response.json();
      if (!response.ok || !json.ok) throw new Error(json.message ?? json.error ?? "予約に失敗しました。");
      setState({ type: "success", message: `${json.count ?? 1}件のメッセージを予約しました。` });
      await refreshReservationData();
    } catch (error) {
      setState({ type: "error", message: error instanceof Error ? error.message : "予約に失敗しました。" });
    }
  }

  async function sendManualMessage() {
    if (targetCount === 0) {
      setState({ type: "error", message: "配信先を選択してください。" });
      return;
    }
    if (!scheduleBody.trim()) {
      setState({ type: "error", message: "メッセージ本文を入力してください。" });
      return;
    }

    setState({ type: "loading", message: "メッセージを送信中..." });
    try {
      const response = await fetch("/api/line/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetMode: recipientMode,
          applicantId: selectedApplicantId,
          jobTitle: selectedJobTitle,
          text: scheduleBody,
        }),
      });
      const json = await response.json();
      if (!response.ok || !json.ok) throw new Error(json.message ?? json.error ?? "送信に失敗しました。");
      setState({ type: "success", message: `${json.sent ?? json.count ?? 1}件へ手動送信しました。` });
      await refreshReservationData();
    } catch (error) {
      setState({ type: "error", message: error instanceof Error ? error.message : "送信に失敗しました。" });
    }
  }

  async function cancelSchedule(scheduleId: string) {
    setState({ type: "loading", message: "予約を取り消し中..." });
    try {
      const response = await fetch(`/api/line/scheduled?id=${encodeURIComponent(scheduleId)}`, { method: "DELETE" });
      const json = await response.json();
      if (!response.ok || !json.ok) throw new Error(json.message ?? json.error ?? "取り消しに失敗しました。");
      setState({ type: "success", message: "予約を取り消しました。" });
      await refreshReservationData();
    } catch (error) {
      setState({ type: "error", message: error instanceof Error ? error.message : "取り消しに失敗しました。" });
    }
  }

  async function copy(value: string, label: string) {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    window.setTimeout(() => setCopied(""), 1200);
  }

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
            <Users className="size-3.5" />
            LINE採用 管理画面
          </div>
          <h2 className="mt-3 text-xl font-bold tracking-tight text-gray-950">友だち追加 → 応募 → 選考連絡までを管理</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
            採用に必要な機能だけに絞っています。入口、返信、予約送信、選考タグ、テストを整えれば、LINEから応募者を受けて選考に流せます。
          </p>
        </div>
        <div className="grid gap-2 sm:min-w-72">
          <Label htmlFor="line-recruit-admin-key">管理キー</Label>
          <Input
            id="line-recruit-admin-key"
            type="password"
            value={adminKey}
            onChange={(event) => setAdminKey(event.target.value)}
            placeholder="LINE_SETTINGS_ADMIN_KEY"
            autoComplete="off"
          />
          <Button type="button" onClick={save} disabled={!settings || state.type === "loading"}>
            {state.type === "loading" ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            保存
          </Button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-5">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <button
              key={step.key}
              type="button"
              onClick={() => setActive(step.key)}
              className={`rounded-xl p-4 text-left ring-1 transition ${
                active === step.key ? "bg-slate-950 text-white ring-slate-950" : "bg-gray-50 text-gray-900 ring-gray-200 hover:bg-gray-100"
              }`}
            >
              <Icon className="size-5" />
              <p className="mt-3 text-sm font-bold">{step.label}</p>
              <p className={`mt-1 text-xs leading-5 ${active === step.key ? "text-slate-300" : "text-gray-500"}`}>{step.help}</p>
            </button>
          );
        })}
      </div>

      <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
        {!settings ? (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Loader2 className="size-4 animate-spin" />
            読み込み中...
          </div>
        ) : null}

        {settings && active === "setup" ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <Field label="公式LINE名" value={settings.officialAccountName} onChange={(value) => update("officialAccountName", value)} placeholder="採用窓口" />
            <Field label="友だち追加URL" value={settings.addFriendUrl} onChange={(value) => update("addFriendUrl", value)} placeholder="https://lin.ee/..." />
            <Field label="Harness管理画面URL" value={settings.harnessDashboardUrl} onChange={(value) => update("harnessDashboardUrl", value)} placeholder="https://..." />
            <Field label="Harness応募フォームURL" value={settings.harnessFormUrl} onChange={(value) => update("harnessFormUrl", value)} placeholder="https://.../forms/recruit-apply" />
            <div className="lg:col-span-2">
              <Label>応募誘導メッセージ</Label>
              <textarea
                className="mt-2 min-h-24 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                value={settings.defaultApplyMessage}
                onChange={(event) => update("defaultApplyMessage", event.target.value)}
              />
            </div>
          </div>
        ) : null}

        {settings && active === "messages" ? (
          <JsonEditor
            label="返信テンプレート"
            helper="応募受付、書類依頼、面接リマインド、内定者フォローなど。"
            value={settings.messageTemplatesJson}
            onChange={(value) => update("messageTemplatesJson", value)}
          />
        ) : null}

        {settings && active === "reservation" ? (
          <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-xl bg-white p-4 ring-1 ring-gray-200">
              <div className="flex items-center gap-2 text-gray-950">
                <CalendarDays className="size-4 text-emerald-600" />
                <h3 className="text-base font-bold">メッセージ予約</h3>
              </div>
              <p className="mt-1 text-xs leading-5 text-gray-600">
                エルメの予約投稿と同じように、送信先・日時・本文を入力してLINE送信を予約します。
              </p>

              <div className="mt-4 grid gap-4">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                  <Label>配信先</Label>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    {([
                      ["individual", "個人ずつ"],
                      ["job", "採用職種ずつ"],
                      ["all", "全員"],
                    ] as const).map(([mode, label]) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setRecipientMode(mode)}
                        className={`rounded-lg px-3 py-2 text-sm font-bold ring-1 transition ${recipientMode === mode ? "bg-emerald-600 text-white ring-emerald-600" : "bg-white text-gray-700 ring-gray-200 hover:bg-emerald-50"}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  <div className="mt-3">
                    {recipientMode === "individual" ? (
                      <select
                        id="line-reserve-applicant"
                        className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                        value={selectedApplicantId}
                        onChange={(event) => setSelectedApplicantId(event.target.value)}
                      >
                        {applicants.length === 0 ? <option value="">応募者データがありません</option> : null}
                        {applicants.map((applicant) => (
                          <option key={applicant.id} value={applicant.id}>
                            {applicant.name ?? applicant.displayName ?? "LINE応募者"} / {applicant.currentStage} / {applicant.jobTitle ?? "職種未定"}
                          </option>
                        ))}
                      </select>
                    ) : null}

                    {recipientMode === "job" ? (
                      <select
                        className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                        value={selectedJobTitle}
                        onChange={(event) => setSelectedJobTitle(event.target.value)}
                      >
                        {jobTitles.length === 0 ? <option value="">職種データがありません</option> : null}
                        {jobTitles.map((jobTitle) => (
                          <option key={jobTitle} value={jobTitle}>{jobTitle}</option>
                        ))}
                      </select>
                    ) : null}

                    {recipientMode === "all" ? (
                      <div className="rounded-lg bg-white px-3 py-3 text-sm font-semibold text-gray-700 ring-1 ring-gray-200">
                        登録されているLINE応募者全員に配信します。
                      </div>
                    ) : null}
                  </div>

                  <p className="mt-2 text-xs font-bold text-emerald-700">配信予定: {targetCount}人</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="予約名" value={scheduleTitle} onChange={setScheduleTitle} placeholder="応募フォロー" />
                  <div>
                    <Label htmlFor="line-reserve-at">配信日時</Label>
                    <Input
                      id="line-reserve-at"
                      className="mt-2 bg-white"
                      type="datetime-local"
                      value={scheduleAt}
                      onChange={(event) => setScheduleAt(event.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="line-reserve-body">メッセージ本文</Label>
                    <span className="text-xs text-gray-500">{scheduleBody.length}文字</span>
                  </div>
                  <textarea
                    id="line-reserve-body"
                    className="mt-2 min-h-52 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm leading-6 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                    value={scheduleBody}
                    onChange={(event) => setScheduleBody(event.target.value)}
                    placeholder="送信するメッセージを入力"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-emerald-50 p-3 ring-1 ring-emerald-100">
                  <p className="text-xs leading-5 text-emerald-800">
                    「今すぐ送信」は即時配信、「投稿予約」は指定日時にCron処理でLINEへ送信されます。
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" onClick={sendManualMessage} disabled={state.type === "loading" || targetCount === 0}>
                      {state.type === "loading" ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                      {targetCount > 1 ? `${targetCount}人へ今すぐ送信` : "今すぐ送信"}
                    </Button>
                    <Button type="button" onClick={reserveMessage} disabled={state.type === "loading" || targetCount === 0}>
                      {state.type === "loading" ? <Loader2 className="size-4 animate-spin" /> : <CalendarDays className="size-4" />}
                      {targetCount > 1 ? `${targetCount}人へ投稿予約する` : "投稿予約する"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-white p-4 ring-1 ring-gray-200">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-bold text-gray-950">予約一覧</h3>
                <Button type="button" variant="outline" size="sm" onClick={refreshReservationData}>更新</Button>
              </div>
              <div className="mt-3 max-h-[420px] space-y-2 overflow-auto pr-1">
                {schedules.length === 0 ? (
                  <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-500 ring-1 ring-gray-200">まだ予約はありません。</div>
                ) : null}
                {schedules.map((schedule) => {
                  const applicant = applicants.find((item) => item.id === schedule.applicantId);
                  return (
                    <div key={schedule.id} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-bold text-gray-950">{schedule.title}</p>
                          <p className="mt-1 text-xs text-gray-500">{applicant?.name ?? applicant?.displayName ?? "LINE応募者"}</p>
                        </div>
                        <span className={`rounded-full px-2 py-1 text-[11px] font-bold ${schedule.status === "pending" ? "bg-amber-100 text-amber-700" : schedule.status === "sent" ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-600"}`}>
                          {schedule.status}
                        </span>
                      </div>
                      <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-gray-700">
                        <Clock className="size-3.5" />
                        {displayDateTime(schedule.scheduledFor)}
                      </p>
                      {schedule.text ? <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-xs leading-5 text-gray-600">{schedule.text}</p> : null}
                      {schedule.status === "pending" ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-3 text-red-600 hover:bg-red-50"
                          onClick={() => cancelSchedule(schedule.id)}
                          disabled={state.type === "loading"}
                        >
                          <Trash2 className="size-3.5" />
                          取り消し
                        </Button>
                      ) : null}
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
                <p className="text-xs font-bold text-gray-700">Cron実行URL</p>
                <code className="mt-1 block break-all text-[11px] text-gray-600">{scheduledProcessUrl}</code>
              </div>
              <p className="mt-3 text-xs leading-5 text-amber-700">
                本番では Vercel に <code>CRON_SECRET</code> を設定してください。今のPreview保存先は server-memory です。
              </p>
            </div>
          </div>
        ) : null}

        {settings && active === "stages" ? (
          <JsonEditor
            label="選考ステージ ↔ LINEタグ"
            helper="CRMのステージをHarnessタグ/metadataへ同期するための対応表です。"
            value={settings.stageTagMapJson}
            onChange={(value) => update("stageTagMapJson", value)}
          />
        ) : null}

        {settings && active === "test" ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl bg-white p-4 ring-1 ring-gray-200">
              <h3 className="text-sm font-bold text-gray-950">Harnessに設定するURL</h3>
              <CopyRow label="応募送信Webhook" value={submissionWebhook} copied={copied} onCopy={copy} />
              <CopyRow label="簡易応募フォーム" value={simpleApplyUrl} copied={copied} onCopy={copy} />
              <CopyRow label="公開日程予約フォーム" value={publicScheduleUrl} copied={copied} onCopy={copy} />
              <CopyRow label="予約送信Cron URL" value={scheduledProcessUrl} copied={copied} onCopy={copy} />
            </div>
            <div className="rounded-xl bg-white p-4 ring-1 ring-gray-200">
              <h3 className="text-sm font-bold text-gray-950">テスト送信</h3>
              <div className="mt-3 space-y-3">
                <Field label="送信先 friendId" value={settings.testFriendId} onChange={(value) => update("testFriendId", value)} placeholder="friend_xxxxxxxx" />
                <div>
                  <Label>送信文</Label>
                  <textarea
                    className="mt-2 min-h-24 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    value={testMessage}
                    onChange={(event) => setTestMessage(event.target.value)}
                  />
                </div>
                <Button type="button" onClick={sendTest} disabled={!adminKey || state.type === "loading"}>
                  <Send className="size-4" />
                  Harness経由でテスト送信
                </Button>
              </div>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 lg:col-span-2">
              <div className="flex items-center gap-2 text-emerald-800">
                <CheckCircle2 className="size-4" />
                <h3 className="text-sm font-bold">開通チェック</h3>
              </div>
              <ol className="mt-3 grid gap-2 text-sm leading-6 text-emerald-900 md:grid-cols-2">
                <li>1. 友だち追加URLを確認</li>
                <li>2. Harness応募フォームURLを確認</li>
                <li>3. Harness側に応募送信Webhookを設定</li>
                <li>4. /schedules で公開日程枠を作成</li>
                <li>5. テスト応募→日程予約がCRMへ入ることを確認</li>
                <li>6. /pipeline で選考ステージ管理</li>
              </ol>
            </div>
          </div>
        ) : null}
      </div>

      {state.type !== "idle" ? (
        <div
          className={
            state.type === "success"
              ? "mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
              : state.type === "error"
                ? "mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                : "mt-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600"
          }
        >
          {state.type === "loading" ? state.message : state.message}
        </div>
      ) : null}
    </section>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <Input className="mt-2 bg-white" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </div>
  );
}

function JsonEditor({ label, helper, value, onChange }: { label: string; helper: string; value: string; onChange: (value: string) => void }) {
  const valid = isValidJson(value);
  return (
    <div className="rounded-xl bg-white p-4 ring-1 ring-gray-200">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-sm font-bold text-gray-950">{label}</h3>
          <p className="mt-1 text-xs leading-5 text-gray-600">{helper}</p>
        </div>
        <span className={`rounded-full px-2 py-1 text-[11px] font-bold ring-1 ${valid ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-red-50 text-red-700 ring-red-200"}`}>
          {valid ? "JSON OK" : "JSONエラー"}
        </span>
      </div>
      <textarea
        className="mt-3 min-h-96 w-full rounded-lg border border-gray-200 bg-slate-950 px-3 py-2 font-mono text-xs leading-5 text-slate-100 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function CopyRow({ label, value, copied, onCopy }: { label: string; value: string; copied: string; onCopy: (value: string, label: string) => void }) {
  return (
    <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
      <p className="text-xs font-bold text-gray-700">{label}</p>
      <code className="mt-1 block break-all text-xs text-gray-600">{value}</code>
      <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => onCopy(value, label)}>
        <Clipboard className="size-4" />
        {copied === label ? "コピー済み" : "コピー"}
      </Button>
    </div>
  );
}
