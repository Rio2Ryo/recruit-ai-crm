import "server-only";

export type LineOperationalSettings = {
  officialAccountName: string;
  officialAccountManagerUrl: string;
  addFriendUrl: string;
  richMenuApplyUrl: string;
  harnessDashboardUrl: string;
  harnessFormUrl: string;
  defaultApplyMessage: string;
  testFriendId: string;
  stageTagMapJson: string;
  messageTemplatesJson: string;
  scheduledMessageRulesJson: string;
  automationRulesJson: string;
  richMenuPlanJson: string;
  broadcastDraftsJson: string;
  updatedAt?: string;
};

const globalForLineSettings = globalThis as unknown as {
  lineOperationalSettings?: LineOperationalSettings;
};

// DB persistence target:
// - Prisma model: LineIntegrationSettings
// - Secret values stay in Vercel env, not this table.
// - Until Prisma client/runtime DATABASE_URL are wired, Preview uses this server-memory fallback.
export function getDefaultLineOperationalSettings(baseUrl: string): LineOperationalSettings {
  return {
    officialAccountName: "採用窓口",
    officialAccountManagerUrl: "https://manager.line.biz/",
    addFriendUrl: "",
    richMenuApplyUrl: `${baseUrl.replace(/\/$/, "")}/line/apply`,
    harnessDashboardUrl: "",
    harnessFormUrl: "",
    defaultApplyMessage:
      `公式LINEから応募できます。応募フォームを開いて、氏名・学校名・希望職種を送信してください。\n応募後、公開中の日程があればこちらから面接・会社見学を予約できます: ${baseUrl.replace(/\/$/, "")}/schedule`,
    testFriendId: "",
    stageTagMapJson: JSON.stringify(
      [
        { stage: "LINE流入", tagName: "LINE流入", tagId: "", autoApply: true },
        { stage: "応募", tagName: "応募済み", tagId: "", autoApply: true },
        { stage: "書類選考", tagName: "書類選考中", tagId: "", autoApply: true },
        { stage: "一次面接", tagName: "一次面接", tagId: "", autoApply: true },
        { stage: "最終面接", tagName: "最終面接", tagId: "", autoApply: true },
        { stage: "内定", tagName: "内定", tagId: "", autoApply: true },
        { stage: "入社", tagName: "入社予定", tagId: "", autoApply: true },
      ],
      null,
      2
    ),
    messageTemplatesJson: JSON.stringify(
      [
        { id: "apply-thanks", title: "応募受付", body: `{{name}}さん、応募ありがとうございます。公開中の日程があれば、こちらから面接・会社見学を予約できます: ${baseUrl.replace(/\/$/, "")}/schedule` },
        { id: "apply-followup-1d", title: "応募1日後フォロー", body: `{{name}}さん、応募内容を確認中です。追加で質問があればこのLINEに返信してください。公開日程はこちらです: ${baseUrl.replace(/\/$/, "")}/schedule` },
        { id: "interview-reminder", title: "面接前日リマインド", body: "{{name}}さん、明日は面接日です。ご不明点があればこのLINEへ返信してください。" },
        { id: "document-request", title: "書類提出依頼", body: "選考に必要な書類をご提出ください。提出方法はこちらです: {{url}}" },
        { id: "offer-follow", title: "内定者フォロー", body: "内定おめでとうございます。入社までのご案内を順次お送りします。" },
      ],
      null,
      2
    ),
    scheduledMessageRulesJson: JSON.stringify(
      [
        {
          id: "schedule-apply-followup-1d",
          title: "応募1日後フォロー",
          enabled: true,
          trigger: "stage_entered",
          stage: "応募",
          templateId: "apply-followup-1d",
          delayAmount: 1,
          delayUnit: "days",
        },
      ],
      null,
      2
    ),
    automationRulesJson: JSON.stringify(
      [
        { trigger: "form_submitted", condition: "formId == recruit-apply", actions: ["addTag:応募済み", "setMetadata:recruitStage=応募", "sendTemplate:apply-thanks"] },
        { trigger: "stage_changed", condition: "stage == 一次面接", actions: ["addTag:一次面接", "scheduleTemplate:interview-reminder:-1d"] },
        { trigger: "message_keyword", condition: "応募 OR 求人", actions: ["reply:defaultApplyMessage"] },
      ],
      null,
      2
    ),
    richMenuPlanJson: JSON.stringify(
      [
        { label: "応募する", action: "uri", urlKey: "richMenuApplyUrl" },
        { label: "募集要項", action: "uri", url: "/jobs" },
        { label: "会社を知る", action: "uri", url: "/company" },
        { label: "質問する", action: "message", text: "質問" },
      ],
      null,
      2
    ),
    broadcastDraftsJson: JSON.stringify(
      [
        { id: "open-company-visit", title: "会社見学案内", target: "tag:LINE流入", body: `会社見学の日程を公開しました。参加希望の方はこちらから予約してください: ${baseUrl.replace(/\/$/, "")}/schedule`, status: "draft" },
        { id: "deadline-reminder", title: "応募締切リマインド", target: "tag:未応募", body: "応募締切が近づいています。気になる方はフォームからエントリーしてください。", status: "draft" },
      ],
      null,
      2
    ),
  };
}

export function getLineOperationalSettings(baseUrl: string) {
  return {
    ...getDefaultLineOperationalSettings(baseUrl),
    ...globalForLineSettings.lineOperationalSettings,
  };
}

export function saveLineOperationalSettings(baseUrl: string, input: Partial<LineOperationalSettings>) {
  const current = getLineOperationalSettings(baseUrl);
  globalForLineSettings.lineOperationalSettings = {
    ...current,
    ...Object.fromEntries(
      Object.entries(input).filter(([, value]) => typeof value === "string")
    ),
    updatedAt: new Date().toISOString(),
  };

  return globalForLineSettings.lineOperationalSettings;
}

export async function getLineOperationalSettingsAsync(baseUrl: string) {
  return getLineOperationalSettings(baseUrl);
}

export async function saveLineOperationalSettingsAsync(baseUrl: string, input: Partial<LineOperationalSettings>) {
  return saveLineOperationalSettings(baseUrl, input);
}
