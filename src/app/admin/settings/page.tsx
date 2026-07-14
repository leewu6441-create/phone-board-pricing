"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button"; import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n";
import { Save, Loader2, MessageCircle, Facebook, Globe, Bell } from "lucide-react"; import { toast } from "sonner";

export default function AdminSettingsPage() {
  const { t } = useTranslation();
  const [zalo, setZalo] = useState(""); const [fb, setFb] = useState("");
  const [notice, setNotice] = useState(""); const [phone, setPhone] = useState(""); const [site, setSite] = useState("");
  const [saving, setSaving] = useState(false); const [loading, setLoading] = useState(true);

  useEffect(() => { fetch("/api/admin/settings").then((r) => r.json()).then((data: any[]) => { data.forEach((s: any) => { switch (s.key) { case "zalo_link": setZalo(s.value); break; case "facebook_link": setFb(s.value); break; case "notice_text": setNotice(s.value); break; case "contact_phone": setPhone(s.value); break; case "site_name": setSite(s.value); break; } }); setLoading(false); }).catch(() => setLoading(false)); }, []);

  const save = (k: string, v: string) => fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: k, value: v }) });

  const handleSave = async () => {
    setSaving(true);
    await Promise.all([save("zalo_link", zalo), save("facebook_link", fb), save("notice_text", notice), save("contact_phone", phone), save("site_name", site)]);
    setSaving(false); toast.success(t("admin.settingsSaved"));
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6"><h1 className="text-xl font-bold text-gray-900">{t("admin.settingsTitle")}</h1><Button onClick={handleSave} disabled={saving}>{saving ? <><Loader2 size={16} className="mr-2 animate-spin" />{t("admin.saving")}</> : <><Save size={16} className="mr-2" />{t("admin.saveSettings")}</>}</Button></div>
      <div className="space-y-6">
        <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><MessageCircle size={18} className="text-blue-500" />{t("admin.zaloLink")}</CardTitle><CardDescription>{t("admin.zaloDesc")}</CardDescription></CardHeader><CardContent><Input value={zalo} onChange={(e) => setZalo(e.target.value)} /></CardContent></Card>
        <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Facebook size={18} className="text-blue-600" />{t("admin.fbLink")}</CardTitle><CardDescription>{t("admin.fbDesc")}</CardDescription></CardHeader><CardContent><Input value={fb} onChange={(e) => setFb(e.target.value)} /></CardContent></Card>
        <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Globe size={18} className="text-gray-600" />{t("admin.siteName")}</CardTitle></CardHeader><CardContent><Input value={site} onChange={(e) => setSite(e.target.value)} /></CardContent></Card>
        <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Bell size={18} className="text-yellow-500" />{t("admin.notice")}</CardTitle><CardDescription>{t("admin.noticeDesc")}</CardDescription></CardHeader><CardContent><Input value={notice} onChange={(e) => setNotice(e.target.value)} /></CardContent></Card>
      </div>
    </div>
  );
}
