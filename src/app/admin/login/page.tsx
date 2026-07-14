"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export default function AdminLoginPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || t("admin.loginError")); }
      else { router.push("/admin"); router.refresh(); }
    } catch { setError(t("admin.loginServerError")); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-3 flex items-center justify-center w-12 h-12 rounded-full bg-primary-100">
            <Smartphone className="h-6 w-6 text-primary-600" />
          </div>
          <CardTitle className="text-lg">{t("admin.loginTitle")}</CardTitle>
          <p className="text-xs text-gray-500 mt-1">Bảng Giá Mainboard</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2"><Label htmlFor="email">{t("admin.loginEmail")}</Label><Input id="email" type="email" placeholder="admin@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus /></div>
            <div className="space-y-2"><Label htmlFor="password">{t("admin.loginPassword")}</Label><Input id="password" type="password" placeholder="••••••" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
            {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-3 py-2">{error}</div>}
            <Button type="submit" className="w-full" disabled={loading}>{loading ? t("admin.loggingIn") : t("admin.loginBtn")}</Button>
          </form>
          <p className="text-[11px] text-gray-400 text-center mt-4">{t("admin.loginOnly")}</p>
        </CardContent>
      </Card>
    </div>
  );
}
