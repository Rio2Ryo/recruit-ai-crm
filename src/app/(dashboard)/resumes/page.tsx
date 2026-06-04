"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, Eye, FileText, ImageIcon, LockKeyhole, UploadCloud } from "lucide-react";

const statusClass: Record<string, string> = {
  解析済み: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  確認待ち: "bg-amber-50 text-amber-700 ring-amber-200",
  未アップロード: "bg-gray-100 text-gray-600 ring-gray-200",
};

type ResumeRow = {
  id: string;
  student: string;
  school: string;
  department: string;
  title: string;
  status: string;
  access: string;
  updatedAt: string;
  summary: string;
  highlights: string[];
  contentUrl?: string;
  storageKey?: string;
  mimeType?: string;
  size?: number;
  lineUserId?: string;
  messageId?: string;
};

function isImageResume(resume: ResumeRow) {
  return resume.mimeType?.startsWith("image/") || /\.(png|jpe?g|gif|webp)$/i.test(resume.title);
}

function isPdfResume(resume: ResumeRow) {
  return resume.mimeType === "application/pdf" || /\.pdf$/i.test(resume.title);
}

function formatFileSize(size?: number) {
  if (!size) return "サイズ未取得";
  if (size < 1024 * 1024) return `${Math.ceil(size / 1024)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

export default function ResumesPage() {
  const [lineResumes, setLineResumes] = useState<ResumeRow[]>([]);
  const resumes: ResumeRow[] = lineResumes;
  const parsedCount = resumes.filter((resume) => resume.status === "解析済み").length;

  useEffect(() => {
    fetch("/api/line/applicants", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return;
        const json = await response.json();
        setLineResumes(json.resumes ?? []);
      })
      .catch(() => setLineResumes([]));
  }, []);

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
            <p className="mt-2 text-2xl font-bold text-gray-950">{resumes.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs font-medium text-gray-500">解析済み</p>
            <p className="mt-2 text-2xl font-bold text-emerald-600">{parsedCount}</p>
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
            {resumes.map((resume) => {
              const canPreview = Boolean(resume.contentUrl);
              const imageResume = isImageResume(resume);
              const pdfResume = isPdfResume(resume);

              return (
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
                        {resume.storageKey ? (
                          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
                            本体保存済み
                          </span>
                        ) : null}
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

                      {canPreview ? (
                        <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2">
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                              {imageResume ? <ImageIcon className="size-4" /> : <FileText className="size-4" />}
                              書類プレビュー
                            </div>
                            <span className="text-xs text-gray-500">{resume.mimeType ?? "形式未取得"} / {formatFileSize(resume.size)}</span>
                          </div>
                          {imageResume ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={resume.contentUrl} alt={`${resume.student} ${resume.title}`} className="max-h-80 w-full object-contain bg-white" />
                          ) : pdfResume ? (
                            <iframe src={resume.contentUrl} title={`${resume.student} ${resume.title}`} className="h-96 w-full bg-white" />
                          ) : (
                            <div className="flex min-h-32 items-center justify-center p-6 text-sm text-gray-600">
                              この形式はブラウザ内プレビュー非対応です。新規タブまたはダウンロードで確認してください。
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                          ファイル本体の保存URLがありません。今後受信するLINE添付はSupabase Storageへ保存され、ここに表示されます。
                        </div>
                      )}
                    </div>
                    <div className="w-full rounded-lg bg-gray-50 p-4 text-sm lg:w-60">
                      <p className="text-xs font-medium text-gray-500">アクセス権限</p>
                      <p className="mt-1 font-semibold text-gray-900">{resume.access}</p>
                      <p className="mt-3 text-xs font-medium text-gray-500">更新日</p>
                      <p className="mt-1 text-gray-700">{resume.updatedAt}</p>
                      {resume.lineUserId ? (
                        <>
                          <p className="mt-3 text-xs font-medium text-gray-500">LINE user ID</p>
                          <p className="mt-1 break-all text-xs text-gray-700">{resume.lineUserId}</p>
                        </>
                      ) : null}
                      {canPreview ? (
                        <div className="mt-4 grid gap-2">
                          <a href={resume.contentUrl} target="_blank" rel="noreferrer" className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 text-sm font-medium text-gray-900 transition hover:bg-gray-100">
                            <Eye className="size-4" />
                            新規タブで確認
                            <ExternalLink className="size-3" />
                          </a>
                          <a href={`${resume.contentUrl}?download=1`} className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 text-sm font-medium text-gray-900 transition hover:bg-gray-100">
                            <Download className="size-4" />
                            ダウンロード
                          </a>
                        </div>
                      ) : (
                        <Button variant="outline" className="mt-4 w-full" disabled>
                          本体未保存
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </>
  );
}
