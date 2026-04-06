"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // TODO: Supabase Auth sign in
    // const { error } = await supabase.auth.signInWithPassword({ email, password });
    // if (error) setError(error.message);
    // else router.push("/dashboard");

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-sm p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">採用CRM</h1>
          <p className="text-sm text-gray-500 mt-1">管理画面にログイン</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@example.com"
            />
          </div>
          <div>
            <Label htmlFor="password">パスワード</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "ログイン中..." : "ログイン"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
