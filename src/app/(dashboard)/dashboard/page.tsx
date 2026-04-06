import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { demoActivities, demoJobs, demoStats, demoStudents } from "@/lib/demo-data";

export default function DashboardPage() {
  return (
    <>
      <Header title="ダッシュボード" />
      <div className="p-6 space-y-6">
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide">候補者数</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{demoStats.students}</p>
            <p className="mt-2 text-sm text-emerald-600">前週比 +12%</p>
          </Card>
          <Card className="p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide">応募数</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{demoStats.applications}</p>
            <p className="mt-2 text-sm text-emerald-600">公開ページ経由が好調</p>
          </Card>
          <Card className="p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide">面接予定</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{demoStats.interviews}</p>
            <p className="mt-2 text-sm text-amber-600">今週 3件集中</p>
          </Card>
          <Card className="p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide">内定数</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{demoStats.offers}</p>
            <p className="mt-2 text-sm text-sky-600">承諾率 66%</p>
          </Card>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <Card className="p-6 xl:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-gray-900">注目候補者</h2>
                <p className="text-sm text-gray-500">AIマッチ度の高い候補者を優先表示</p>
              </div>
            </div>
            <div className="space-y-3">
              {demoStudents.map((student) => (
                <div key={student.id} className="rounded-xl border border-gray-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-gray-900">{student.name}</p>
                      <p className="text-sm text-gray-500">{student.school} / {student.department}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">AIマッチ度</p>
                      <p className="text-lg font-bold text-indigo-600">{student.score}%</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-gray-700">{student.status}</span>
                    <span className="text-gray-500">面接質問提案あり</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-base font-semibold text-gray-900">最近のアクティビティ</h2>
            <div className="mt-4 space-y-4">
              {demoActivities.map((activity) => (
                <div key={activity.title} className="border-l-2 border-indigo-200 pl-4">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="mt-1 text-sm text-gray-500">{activity.description}</p>
                  <p className="mt-1 text-xs text-gray-400">{activity.time}</p>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Card className="p-6">
            <h2 className="text-base font-semibold text-gray-900">求人別の状況</h2>
            <div className="mt-4 space-y-4">
              {demoJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between rounded-xl border border-gray-200 p-4">
                  <div>
                    <p className="font-medium text-gray-900">{job.title}</p>
                    <p className="text-sm text-gray-500">{job.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-900">応募 {job.applicants}件</p>
                    <p className="text-xs text-gray-500">平均マッチ度 {job.score}%</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-indigo-600 to-violet-600 text-white border-0">
            <h2 className="text-base font-semibold">公開企業ページ プレビュー</h2>
            <p className="mt-2 text-sm text-indigo-100">
              学生向けの魅力発信ページから、そのまま応募までつながる導線を確認できます。
            </p>
            <div className="mt-6 rounded-2xl bg-white/10 p-5 backdrop-blur">
              <p className="text-sm text-indigo-100">注目ポイント</p>
              <ul className="mt-3 space-y-2 text-sm">
                <li>• 会社紹介 / 写真 / 動画を1ページに集約</li>
                <li>• 求人詳細ごとに簡易応募フォームを表示</li>
                <li>• 応募後は候補者CRMへ自動登録予定</li>
              </ul>
            </div>
          </Card>
        </section>
      </div>
    </>
  );
}
