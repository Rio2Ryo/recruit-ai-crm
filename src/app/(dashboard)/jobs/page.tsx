import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { demoJobs } from "@/lib/demo-data";

export default function JobsPage() {
  return (
    <>
      <Header title="求人管理" />
      <div className="p-6 max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">公開中の求人</h2>
            <p className="text-sm text-gray-500">求人ごとの応募数とAIマッチ度を確認できます。</p>
          </div>
          <Button disabled>求人を追加</Button>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {demoJobs.map((job) => (
            <Card key={job.id} className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{job.location}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${job.status === "募集中" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
                  {job.status}
                </span>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-gray-500">応募数</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">{job.applicants}</p>
                </div>
                <div className="rounded-lg bg-indigo-50 p-4">
                  <p className="text-indigo-600">平均AIマッチ度</p>
                  <p className="mt-1 text-2xl font-bold text-indigo-700">{job.score}%</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
