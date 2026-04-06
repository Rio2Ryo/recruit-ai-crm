import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { demoCompany } from "@/lib/demo-data";

export default function CompanyPage() {
  return (
    <>
      <Header title="企業情報" />
      <div className="p-6 space-y-6 max-w-5xl">
        <Card className="p-6 flex items-start justify-between gap-6">
          <div>
            <p className="text-sm text-indigo-600 font-medium">公開中の企業ページ</p>
            <h2 className="mt-1 text-2xl font-bold text-gray-900">{demoCompany.name}</h2>
            <p className="mt-2 text-sm text-gray-500">{demoCompany.industry} / {demoCompany.prefecture}</p>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-600">{demoCompany.description}</p>
          </div>
          <div className="rounded-xl bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
            /company/{demoCompany.slug}
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card className="p-6">
            <h3 className="text-base font-semibold text-gray-900">基本情報</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">所在地</dt>
                <dd className="text-gray-900">{demoCompany.address}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">従業員数</dt>
                <dd className="text-gray-900">{demoCompany.employeeCount}名</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">設立年</dt>
                <dd className="text-gray-900">{demoCompany.foundedYear}年</dd>
              </div>
            </dl>
          </Card>

          <Card className="p-6">
            <h3 className="text-base font-semibold text-gray-900">魅力発信セクション</h3>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              <li>• 会社紹介動画</li>
              <li>• フォトギャラリー</li>
              <li>• 先輩社員インタビュー</li>
              <li>• AI生成の紹介文</li>
            </ul>
            <Button className="mt-6" disabled>編集機能は次フェーズ</Button>
          </Card>
        </div>
      </div>
    </>
  );
}
