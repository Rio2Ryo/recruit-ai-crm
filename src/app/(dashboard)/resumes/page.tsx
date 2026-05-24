import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { demoResumes } from "@/lib/demo-data";
import { FileText, LockKeyhole, UploadCloud } from "lucide-react";

const statusClass: Record<string, string> = {
  解析済み: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  確認待ち: "bg-amber-50 text-amber-700 ring-amber-200",
  未アップロード: "bg-gray-100 text-gray-600 ring-gray-200",
};

export default function ResumesPage() {
  return (
    <>
      <Header title="履歴書DB" />
      <div className="max-w-6xl space-y-6 p-6">
        <Card className="overflow-hidden border-indigo-100 bg-gradient-to-r from-indigo-50 to-white p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-indigo-700">
                <FileText className="size-4" />
                Resume Database
              </div>
              <h2 className="mt-2 text-xl font-bold text-slate-950">候補者の履歴書・応募書類を一元管理</h2>
              <p className="mt-1 text-sm text-slate-600">
                PDF/画像/応募フォーム回答を候補者に紐づけ、AI要約・確認ステータス・アクセス権限を管理します。
              </p>
            </div>
            <Button disabled className="gap-2">
              <UploadCloud className="size-4" />
              履歴書をアップロード（近日対応）
            </Button>
          </div>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-4">
            <p className="text-xs font-medium text-gray-500">登録書類</p>
            <p className="mt-2 text-2xl font-bold text-gray-950">{demoResumes.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs font-medium text-gray-500">解析済み</p>
            <p className="mt-2 text-2xl font-bold text-emerald-600">1</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs font-medium text-gray-500">権限ガード</p>
            <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-indigo-700">
              <LockKeyhole className="size-4" />
              採用担当以上
            </p>
          </Card>
        </div>

        <Card className="overflow-hidden">
          <div className="border-b border-gray-100 px-6 py-4">
            <h3 className="text-base font-semibold text-gray-900">履歴書一覧</h3>
            <p className="mt-1 text-sm text-gray-500">実DBでは Resume テーブルから候補者・学校・応募状況と結合して表示します。</p>
          </div>
          <div className="divide-y divide-gray-100">
            {demoResumes.map((resume) => (
              <div key={resume.id} className="p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-base font-bold text-gray-950">{resume.student}</h4>
                      <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                        {resume.school} / {resume.department}
                      </span>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${statusClass[resume.status]}`}>
                        {resume.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-medium text-gray-700">{resume.title}</p>
                    <p className="mt-1 text-sm text-gray-600">{resume.summary}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {resume.highlights.map((item) => (
                        <span key={item} className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="w-full rounded-lg bg-gray-50 p-4 text-sm lg:w-56">
                    <p className="text-xs font-medium text-gray-500">アクセス権限</p>
                    <p className="mt-1 font-semibold text-gray-900">{resume.access}</p>
                    <p className="mt-3 text-xs font-medium text-gray-500">更新日</p>
                    <p className="mt-1 text-gray-700">{resume.updatedAt}</p>
                    <Button variant="outline" className="mt-4 w-full" disabled>
                      詳細を見る
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
