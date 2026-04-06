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
