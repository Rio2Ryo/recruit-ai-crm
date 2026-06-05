export type FunnelStage = "LINE流入" | "応募" | "書類選考" | "一次面接" | "最終面接" | "内定" | "入社";

export const funnelStages: FunnelStage[] = ["LINE流入", "応募", "書類選考", "一次面接", "最終面接", "内定", "入社"];

export type PipelineStage = "マッチング候補" | "見学参加" | "応募受付" | "面接" | "内定";

export const pipelineStages: PipelineStage[] = ["マッチング候補", "見学参加", "応募受付", "面接", "内定"];

export type FunnelCandidate = {
  id: string;
  name: string;
  source: "LINE" | "Web" | "紹介" | "学校";
  currentStage: FunnelStage;
  appliedAt: string;
  lastUpdated: string;
  position: string;
  note?: string;
};
