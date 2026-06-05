import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CompanyPage() {
  return (
    <>
      <Header title="企業情報" />
      <div className="p-6 space-y-6 max-w-5xl">
        <Card className="border-dashed p-10 text-center">
          <h2 className="text-lg font-semibold text-gray-900">企業情報は未登録です</h2>
          <p className="mt-2 text-sm text-gray-500">登録された企業情報だけを表示します。ダミーデータは表示していません。</p>
          <Button className="mt-6" disabled>企業情報を登録</Button>
        </Card>
      </div>
    </>
  );
}
