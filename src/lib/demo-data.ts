export const demoStats = {
  students: 128,
  applications: 36,
  interviews: 8,
  offers: 3,
};

export const demoActivities = [
  {
    title: "工業高校から新規応募がありました",
    description: "長野工業高校 機械科 3年 / 製造オペレーター職へ応募",
    time: "10分前",
  },
  {
    title: "会社紹介ページが閲覧されました",
    description: "本日 24閲覧。動画セクションの滞在時間が高めです",
    time: "1時間前",
  },
  {
    title: "学校訪問の次回アクションを設定",
    description: "松本工業高校 進路指導担当へ求人票送付予定",
    time: "昨日",
  },
];

export const demoMembers = [
  {
    name: "山田 花子",
    email: "hanako@example.com",
    role: "owner",
    createdAt: "2026-04-01",
  },
  {
    name: "田中 一郎",
    email: "ichiro@example.com",
    role: "member",
    createdAt: "2026-04-03",
  },
];

export const demoJobs = [
  {
    id: "job-1",
    title: "製造オペレーター",
    location: "長野県松本市",
    status: "募集中",
    applicants: 12,
    score: 92,
  },
  {
    id: "job-2",
    title: "品質管理アシスタント",
    location: "長野県塩尻市",
    status: "募集中",
    applicants: 8,
    score: 87,
  },
  {
    id: "job-3",
    title: "機械保全スタッフ",
    location: "長野県松本市",
    status: "準備中",
    applicants: 0,
    score: 79,
  },
];

export const demoStudents = [
  {
    id: "st-1",
    name: "佐藤 拓海",
    school: "長野工業高校",
    department: "機械科",
    status: "面接予定",
    score: 94,
  },
  {
    id: "st-2",
    name: "小林 美咲",
    school: "松本工業高校",
    department: "電気科",
    status: "書類確認中",
    score: 88,
  },
  {
    id: "st-3",
    name: "中村 颯",
    school: "諏訪実業高校",
    department: "工業技術科",
    status: "応募",
    score: 81,
  },
];

export const demoSchools = [
  {
    id: "sc-1",
    name: "長野工業高校",
    contact: "進路指導 田村先生",
    nextAction: "求人票送付",
    students: 5,
  },
  {
    id: "sc-2",
    name: "松本工業高校",
    contact: "進路指導 中島先生",
    nextAction: "学校訪問",
    students: 3,
  },
  {
    id: "sc-3",
    name: "岡谷工業高校",
    contact: "進路指導 井上先生",
    nextAction: "会社見学案内",
    students: 2,
  },
];

export const demoApplications = [
  {
    id: "ap-1",
    student: "佐藤 拓海",
    job: "製造オペレーター",
    status: "面接予定",
    updatedAt: "2026-04-06",
  },
  {
    id: "ap-2",
    student: "小林 美咲",
    job: "品質管理アシスタント",
    status: "書類確認中",
    updatedAt: "2026-04-05",
  },
  {
    id: "ap-3",
    student: "中村 颯",
    job: "機械保全スタッフ",
    status: "応募",
    updatedAt: "2026-04-05",
  },
];

// --- AI Matching Data ---
export type MatchCandidate = {
  id: string;
  name: string;
  school: string;
  department: string;
  jobTitle: string;
  overallScore: number;
  attributeScore: number;
  preferenceScore: number;
  historyScore: number;
  matchReasons: string[];
  interviewQuestions: string[];
  appealPoints: string[];
};

export const demoMatchCandidates: MatchCandidate[] = [
  {
    id: "mc-1",
    name: "佐藤 拓海",
    school: "長野工業高校",
    department: "機械科",
    jobTitle: "製造オペレーター",
    overallScore: 94,
    attributeScore: 96,
    preferenceScore: 91,
    historyScore: 95,
    matchReasons: [
      "機械科で旋盤・フライス加工の実習経験が豊富。即戦力として期待できます。",
      "長野工業高校は過去3年間で当社に5名の入社実績があり、定着率100%です。",
      "本人の「ものづくりに携わりたい」という志望動機が当社の理念と一致しています。",
    ],
    interviewQuestions: [
      "実習で最も印象に残った加工作業と、そこで工夫したことを教えてください。",
      "チームで作業する際に心がけていることはありますか？",
      "将来、どのような技術者になりたいと考えていますか？",
    ],
    appealPoints: [
      "入社1年目から技能検定取得を支援する制度があります。",
      "先輩社員のマンツーマン指導体制（メンター制度）を紹介してください。",
      "同校OBの活躍事例を具体的に伝えると効果的です。",
    ],
  },
  {
    id: "mc-2",
    name: "小林 美咲",
    school: "松本工業高校",
    department: "電気科",
    jobTitle: "品質管理アシスタント",
    overallScore: 88,
    attributeScore: 85,
    preferenceScore: 92,
    historyScore: 87,
    matchReasons: [
      "電気科で計測機器の扱いに慣れており、品質管理業務への適性が高いです。",
      "成績上位で真面目な性格。細かい作業を正確にこなす力があります。",
      "通勤圏内（塩尻市）で、勤務地の希望条件と完全に一致しています。",
    ],
    interviewQuestions: [
      "品質管理に興味を持ったきっかけを教えてください。",
      "授業や実習で、精密な計測・検査を行った経験はありますか？",
      "仕事で大切にしたいことを3つ挙げるとしたら何ですか？",
    ],
    appealPoints: [
      "品質管理部門は女性社員も多く活躍しており、働きやすい環境です。",
      "ISO9001の品質管理体制について具体的に説明してください。",
      "資格取得支援（品質管理検定など）の制度を紹介すると良いでしょう。",
    ],
  },
  {
    id: "mc-3",
    name: "中村 颯",
    school: "諏訪実業高校",
    department: "工業技術科",
    jobTitle: "機械保全スタッフ",
    overallScore: 81,
    attributeScore: 78,
    preferenceScore: 83,
    historyScore: 82,
    matchReasons: [
      "工業技術科でメカトロニクスの基礎を学んでおり、保全業務の素養があります。",
      "部活動（ロボット部）でトラブルシューティングの経験を積んでいます。",
      "「機械と向き合う仕事がしたい」という本人の希望が当社求人と合致しています。",
    ],
    interviewQuestions: [
      "ロボット部の活動で、機械の不具合を解決した経験を教えてください。",
      "新しい機械や技術を学ぶとき、どのようなアプローチを取りますか？",
      "チームメンバーと意見が合わなかったとき、どう対処しましたか？",
    ],
    appealPoints: [
      "設備の定期メンテナンスだけでなく、改善提案も歓迎する社風です。",
      "最新のCNC加工機を導入しており、先端技術に触れられる環境です。",
      "入社2年目で機械保全技能士の資格取得実績があることを伝えてください。",
    ],
  },
  {
    id: "mc-4",
    name: "高橋 蓮",
    school: "上田千曲高校",
    department: "機械科",
    jobTitle: "製造オペレーター",
    overallScore: 76,
    attributeScore: 74,
    preferenceScore: 79,
    historyScore: 75,
    matchReasons: [
      "機械科の基礎知識を持ち、図面読解力があります。",
      "体力があり、交代勤務にも対応可能と面談で回答しています。",
      "ただし通勤距離がやや遠く（上田市→松本市）、通勤手段の確認が必要です。",
    ],
    interviewQuestions: [
      "松本市への通勤について、具体的にどのように考えていますか？",
      "製造業に興味を持った理由を教えてください。",
      "高校生活で最も力を入れたことは何ですか？",
    ],
    appealPoints: [
      "社員寮の案内をすると通勤問題を解消できます。",
      "未経験からでも成長できる研修プログラムの紹介が効果的です。",
      "若手社員の定着率の高さ（3年以内離職率10%以下）を伝えてください。",
    ],
  },
  {
    id: "mc-5",
    name: "渡辺 結衣",
    school: "長野工業高校",
    department: "電子科",
    jobTitle: "品質管理アシスタント",
    overallScore: 72,
    attributeScore: 70,
    preferenceScore: 76,
    historyScore: 70,
    matchReasons: [
      "電子科で精密機器の取り扱い経験があり、品質管理の素養があります。",
      "真面目で協調性がある一方、まだ志望動機が明確でない段階です。",
      "長野工業高校との関係性を活かしてアプローチ可能です。",
    ],
    interviewQuestions: [
      "高校の授業で特に好きだった科目と、その理由を教えてください。",
      "将来の仕事で「これだけは大切にしたい」と思うことはありますか？",
      "友人からどんな性格だと言われますか？",
    ],
    appealPoints: [
      "会社見学を通じて実際の職場の雰囲気を体感してもらうのが効果的です。",
      "同校OBとの座談会を企画すると志望度が上がる可能性があります。",
      "品質管理の仕事内容を動画で分かりやすく見せると良いでしょう。",
    ],
  },
];

// --- Pipeline / Application Data ---
export type PipelineStage =
  | "マッチング候補"
  | "見学参加"
  | "応募受付"
  | "面接"
  | "内定";

export type PipelineCandidate = {
  id: string;
  name: string;
  school: string;
  jobTitle: string;
  score: number;
  stage: PipelineStage;
  updatedAt: string;
  note?: string;
};

export const pipelineStages: PipelineStage[] = [
  "マッチング候補",
  "見学参加",
  "応募受付",
  "面接",
  "内定",
];

export const demoPipelineCandidates: PipelineCandidate[] = [
  {
    id: "pc-1",
    name: "佐藤 拓海",
    school: "長野工業高校",
    jobTitle: "製造オペレーター",
    score: 94,
    stage: "面接",
    updatedAt: "2026-04-04",
    note: "4/8 面接予定。機械科の実習経験を深掘りする。",
  },
  {
    id: "pc-2",
    name: "小林 美咲",
    school: "松本工業高校",
    jobTitle: "品質管理アシスタント",
    score: 88,
    stage: "応募受付",
    updatedAt: "2026-04-03",
    note: "書類確認中。成績証明書の到着待ち。",
  },
  {
    id: "pc-3",
    name: "中村 颯",
    school: "諏訪実業高校",
    jobTitle: "機械保全スタッフ",
    score: 81,
    stage: "応募受付",
    updatedAt: "2026-04-03",
  },
  {
    id: "pc-4",
    name: "高橋 蓮",
    school: "上田千曲高校",
    jobTitle: "製造オペレーター",
    score: 76,
    stage: "見学参加",
    updatedAt: "2026-04-02",
    note: "4/10 会社見学参加予定。社員寮の案内も行う。",
  },
  {
    id: "pc-5",
    name: "渡辺 結衣",
    school: "長野工業高校",
    jobTitle: "品質管理アシスタント",
    score: 72,
    stage: "マッチング候補",
    updatedAt: "2026-04-01",
    note: "学校訪問時に進路指導の先生から紹介あり。",
  },
  {
    id: "pc-6",
    name: "伊藤 大翔",
    school: "松本工業高校",
    jobTitle: "製造オペレーター",
    score: 85,
    stage: "見学参加",
    updatedAt: "2026-04-02",
  },
  {
    id: "pc-7",
    name: "加藤 陽菜",
    school: "岡谷工業高校",
    jobTitle: "品質管理アシスタント",
    score: 79,
    stage: "マッチング候補",
    updatedAt: "2026-03-30",
  },
  {
    id: "pc-8",
    name: "鈴木 翔太",
    school: "長野工業高校",
    jobTitle: "機械保全スタッフ",
    score: 90,
    stage: "内定",
    updatedAt: "2026-03-28",
    note: "4/15 内定通知済み。承諾待ち。",
  },
  {
    id: "pc-9",
    name: "山本 桃花",
    school: "岡谷工業高校",
    jobTitle: "製造オペレーター",
    score: 77,
    stage: "マッチング候補",
    updatedAt: "2026-03-29",
  },
  {
    id: "pc-10",
    name: "田中 悠人",
    school: "諏訪実業高校",
    jobTitle: "製造オペレーター",
    score: 83,
    stage: "面接",
    updatedAt: "2026-04-04",
    note: "4/9 面接予定。志望動機の確認をメインに。",
  },
];

// --- Task Management Data ---
export type TaskPriority = "high" | "medium" | "low";
export type TaskStatus = "未着手" | "進行中" | "完了";

export type Task = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  category: string;
  relatedTo?: {
    type: "candidate" | "school" | "application";
    name: string;
  };
};

export const demoTasks: Task[] = [
  {
    id: "task-1",
    title: "長野工業高校 学校訪問",
    description: "進路指導の田村先生と面談。求人票を持参し、今年度の採用計画を共有する。",
    status: "未着手",
    priority: "high",
    dueDate: "2026-04-07",
    category: "学校訪問",
    relatedTo: { type: "school", name: "長野工業高校" },
  },
  {
    id: "task-2",
    title: "佐藤 拓海さん 面接準備",
    description: "面接質問リストの最終確認。機械科の実習内容に関する深掘り質問を準備。",
    status: "進行中",
    priority: "high",
    dueDate: "2026-04-07",
    category: "面接準備",
    relatedTo: { type: "candidate", name: "佐藤 拓海" },
  },
  {
    id: "task-3",
    title: "小林 美咲さん フォローアップ",
    description: "応募書類の確認結果を松本工業高校の中島先生経由で連絡する。",
    status: "未着手",
    priority: "medium",
    dueDate: "2026-04-08",
    category: "フォローアップ",
    relatedTo: { type: "candidate", name: "小林 美咲" },
  },
  {
    id: "task-4",
    title: "松本工業高校 求人票送付",
    description: "更新した求人票（製造オペレーター・品質管理アシスタント）を郵送する。",
    status: "未着手",
    priority: "medium",
    dueDate: "2026-04-09",
    category: "求人票送付",
    relatedTo: { type: "school", name: "松本工業高校" },
  },
  {
    id: "task-5",
    title: "田中 悠人さん 面接準備",
    description: "面接日程の最終確認。諏訪実業高校への連絡も忘れずに。",
    status: "未着手",
    priority: "high",
    dueDate: "2026-04-08",
    category: "面接準備",
    relatedTo: { type: "candidate", name: "田中 悠人" },
  },
  {
    id: "task-6",
    title: "高橋 蓮さん 会社見学準備",
    description: "見学当日のスケジュール作成。社員寮の案内資料も準備する。",
    status: "進行中",
    priority: "medium",
    dueDate: "2026-04-09",
    category: "フォローアップ",
    relatedTo: { type: "candidate", name: "高橋 蓮" },
  },
  {
    id: "task-7",
    title: "岡谷工業高校 会社見学案内",
    description: "井上先生宛に会社見学の日程候補（4月中旬）を連絡する。",
    status: "未着手",
    priority: "low",
    dueDate: "2026-04-10",
    category: "学校訪問",
    relatedTo: { type: "school", name: "岡谷工業高校" },
  },
  {
    id: "task-8",
    title: "鈴木 翔太さん 内定フォロー",
    description: "内定承諾の意思確認。入社前研修のスケジュールを案内する。",
    status: "進行中",
    priority: "high",
    dueDate: "2026-04-10",
    category: "フォローアップ",
    relatedTo: { type: "candidate", name: "鈴木 翔太" },
  },
  {
    id: "task-9",
    title: "採用ページ 動画コンテンツ更新",
    description: "先輩社員インタビュー動画を撮影・編集し、公開ページに追加する。",
    status: "未着手",
    priority: "low",
    dueDate: "2026-04-14",
    category: "求人票送付",
  },
  {
    id: "task-10",
    title: "月次採用レポート作成",
    description: "3月の採用活動実績をまとめ、経営陣に報告する。",
    status: "完了",
    priority: "medium",
    dueDate: "2026-04-03",
    category: "フォローアップ",
  },
];

export const demoCompany = {
  name: "株式会社北信精工",
  slug: "hokushin-seiko",
  industry: "金属加工・精密部品製造",
  prefecture: "長野県",
  address: "長野県松本市中央 1-2-3",
  employeeCount: 68,
  foundedYear: 1988,
  description:
    "精密部品の製造を強みに、若手が現場で成長できる教育体制を整えている中小製造業です。",
};

// --- Yield Funnel Data (歩留まり管理) ---
export type FunnelStage = 'LINE流入' | '応募' | '書類選考' | '一次面接' | '最終面接' | '内定' | '入社';

export const funnelStages: FunnelStage[] = ['LINE流入', '応募', '書類選考', '一次面接', '最終面接', '内定', '入社'];

export interface FunnelData {
  stage: FunnelStage;
  count: number;
  color: string;
}

export const demoFunnelData: FunnelData[] = [
  { stage: 'LINE流入', count: 248, color: '#6366f1' },
  { stage: '応募', count: 156, color: '#8b5cf6' },
  { stage: '書類選考', count: 98, color: '#a855f7' },
  { stage: '一次面接', count: 52, color: '#d946ef' },
  { stage: '最終面接', count: 28, color: '#ec4899' },
  { stage: '内定', count: 15, color: '#f43f5e' },
  { stage: '入社', count: 12, color: '#10b981' },
];

// Monthly funnel trend data
export interface MonthlyFunnel {
  month: string;
  LINE流入: number;
  応募: number;
  書類選考: number;
  一次面接: number;
  最終面接: number;
  内定: number;
  入社: number;
}

export const demoMonthlyFunnel: MonthlyFunnel[] = [
  { month: '2026-01', LINE流入: 45, 応募: 28, 書類選考: 18, 一次面接: 10, 最終面接: 5, 内定: 3, 入社: 2 },
  { month: '2026-02', LINE流入: 62, 応募: 38, 書類選考: 24, 一次面接: 13, 最終面接: 7, 内定: 4, 入社: 3 },
  { month: '2026-03', LINE流入: 78, 応募: 51, 書類選考: 32, 一次面接: 17, 最終面接: 9, 内定: 5, 入社: 4 },
  { month: '2026-04', LINE流入: 63, 応募: 39, 書類選考: 24, 一次面接: 12, 最終面接: 7, 内定: 3, 入社: 3 },
];

// Candidate detail for funnel management
export interface FunnelCandidate {
  id: string;
  name: string;
  source: 'LINE' | 'Web' | '紹介' | '学校';
  currentStage: FunnelStage;
  appliedAt: string;
  lastUpdated: string;
  position: string;
  note?: string;
}

export const demoFunnelCandidates: FunnelCandidate[] = [
  { id: 'fc-1', name: '佐藤 拓海', source: 'LINE', currentStage: '最終面接', appliedAt: '2026-03-15', lastUpdated: '2026-04-14', position: '製造オペレーター', note: '4/18 最終面接予定' },
  { id: 'fc-2', name: '小林 美咲', source: 'LINE', currentStage: '一次面接', appliedAt: '2026-03-20', lastUpdated: '2026-04-12', position: '品質管理', note: '面接日程調整中' },
  { id: 'fc-3', name: '中村 颯', source: 'Web', currentStage: '書類選考', appliedAt: '2026-04-01', lastUpdated: '2026-04-10', position: '機械保全' },
  { id: 'fc-4', name: '高橋 蓮', source: 'LINE', currentStage: '応募', appliedAt: '2026-04-05', lastUpdated: '2026-04-05', position: '製造オペレーター' },
  { id: 'fc-5', name: '渡辺 結衣', source: '紹介', currentStage: '内定', appliedAt: '2026-02-28', lastUpdated: '2026-04-15', position: '品質管理', note: '内定承諾待ち' },
  { id: 'fc-6', name: '伊藤 大翔', source: 'LINE', currentStage: 'LINE流入', appliedAt: '2026-04-10', lastUpdated: '2026-04-10', position: '未定' },
  { id: 'fc-7', name: '加藤 陽菜', source: '学校', currentStage: '一次面接', appliedAt: '2026-03-18', lastUpdated: '2026-04-11', position: '品質管理' },
  { id: 'fc-8', name: '鈴木 翔太', source: 'LINE', currentStage: '入社', appliedAt: '2026-01-15', lastUpdated: '2026-04-01', position: '機械保全', note: '4/1 入社済み' },
  { id: 'fc-9', name: '山本 桃花', source: 'Web', currentStage: 'LINE流入', appliedAt: '2026-04-12', lastUpdated: '2026-04-12', position: '未定' },
  { id: 'fc-10', name: '田中 悠人', source: 'LINE', currentStage: '書類選考', appliedAt: '2026-04-03', lastUpdated: '2026-04-09', position: '製造オペレーター' },
  { id: 'fc-11', name: '松田 健太', source: 'LINE', currentStage: '応募', appliedAt: '2026-04-08', lastUpdated: '2026-04-08', position: '製造オペレーター' },
  { id: 'fc-12', name: '吉田 さくら', source: '紹介', currentStage: '最終面接', appliedAt: '2026-03-10', lastUpdated: '2026-04-13', position: '品質管理', note: '最終面接通過見込み' },
];
