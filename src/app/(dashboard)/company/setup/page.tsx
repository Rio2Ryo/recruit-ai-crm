"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Header } from "@/components/layout/header";

const prefectures = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
  "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
  "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
  "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県",
];

export default function CompanySetupPage() {
  const [form, setForm] = useState({
    name: "",
    slug: "",
    industry: "",
    address: "",
    prefecture: "",
    employeeCount: "",
    foundedYear: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "name" && !form.slug) {
      // Auto-generate slug from name
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]+/g, "-")
        .replace(/^-|-$/g, "");
      setForm((prev) => ({ ...prev, slug }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // TODO: POST /api/company with form data
    // Create company + add current user as owner

    setLoading(false);
  };

  return (
    <>
      <Header title="企業情報を設定" />
      <div className="p-6 max-w-2xl">
        <Card className="p-6">
          <p className="text-sm text-gray-500 mb-6">
            採用活動を始めるために、企業情報を登録してください。
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">会社名 *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                required
                placeholder="株式会社○○製作所"
              />
            </div>

            <div>
              <Label htmlFor="slug">公開URL用スラッグ *</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">/company/</span>
                <Input
                  id="slug"
                  value={form.slug}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      slug: e.target.value.replace(/[^a-z0-9-]/g, ""),
                    }))
                  }
                  required
                  placeholder="example-mfg"
                  pattern="[a-z0-9-]+"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                英小文字・数字・ハイフンのみ
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="industry">業種</Label>
                <Input
                  id="industry"
                  value={form.industry}
                  onChange={(e) => updateField("industry", e.target.value)}
                  placeholder="金属加工"
                />
              </div>
              <div>
                <Label htmlFor="prefecture">都道府県</Label>
                <select
                  id="prefecture"
                  value={form.prefecture}
                  onChange={(e) => updateField("prefecture", e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">選択してください</option>
                  {prefectures.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="address">所在地</Label>
              <Input
                id="address"
                value={form.address}
                onChange={(e) => updateField("address", e.target.value)}
                placeholder="○○市○○町1-2-3"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employeeCount">従業員数</Label>
                <Input
                  id="employeeCount"
                  type="number"
                  value={form.employeeCount}
                  onChange={(e) => updateField("employeeCount", e.target.value)}
                  placeholder="50"
                />
              </div>
              <div>
                <Label htmlFor="foundedYear">設立年</Label>
                <Input
                  id="foundedYear"
                  type="number"
                  value={form.foundedYear}
                  onChange={(e) => updateField("foundedYear", e.target.value)}
                  placeholder="1985"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">企業説明</Label>
              <textarea
                id="description"
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                rows={4}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-vertical"
                placeholder="企業の事業内容や特徴を記入してください"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "保存中..." : "企業情報を保存して開始"}
            </Button>
          </form>
        </Card>
      </div>
    </>
  );
}
