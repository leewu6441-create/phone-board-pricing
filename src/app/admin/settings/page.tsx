"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Save, Loader2, MessageCircle, Facebook, Globe, Bell } from "lucide-react";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const [zaloLink, setZaloLink] = useState("");
  const [facebookLink, setFacebookLink] = useState("");
  const [noticeText, setNoticeText] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [siteName, setSiteName] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data: any[]) => {
        data.forEach((s) => {
          switch (s.key) {
            case "zalo_link": setZaloLink(s.value); break;
            case "facebook_link": setFacebookLink(s.value); break;
            case "notice_text": setNoticeText(s.value); break;
            case "contact_phone": setContactPhone(s.value); break;
            case "site_name": setSiteName(s.value); break;
          }
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const save = async (key: string, value: string) => {
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    });
  };

  const handleSave = async () => {
    setSaving(true);
    await Promise.all([
      save("zalo_link", zaloLink),
      save("facebook_link", facebookLink),
      save("notice_text", noticeText),
      save("contact_phone", contactPhone),
      save("site_name", siteName),
    ]);
    setSaving(false);
    toast.success("Đã lưu cài đặt");
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Cài đặt trang web</h1>
        <Button onClick={handleSave} disabled={saving}>{saving ? <><Loader2 size={16} className="mr-2 animate-spin" />Đang lưu...</> : <><Save size={16} className="mr-2" />Lưu cài đặt</>}</Button>
      </div>
      <div className="space-y-6">
        <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><MessageCircle size={18} className="text-blue-500" />Liên kết Zalo</CardTitle><CardDescription>Link Zalo cá nhân. VD: https://zalo.me/0912345678</CardDescription></CardHeader><CardContent><Input value={zaloLink} onChange={(e) => setZaloLink(e.target.value)} /></CardContent></Card>
        <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Facebook size={18} className="text-blue-600" />Liên kết Facebook</CardTitle><CardDescription>Link nhóm Facebook</CardDescription></CardHeader><CardContent><Input value={facebookLink} onChange={(e) => setFacebookLink(e.target.value)} /></CardContent></Card>
        <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Globe size={18} className="text-gray-600" />Tên trang web</CardTitle></CardHeader><CardContent><Input value={siteName} onChange={(e) => setSiteName(e.target.value)} /></CardContent></Card>
        <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Bell size={18} className="text-yellow-500" />Thông báo</CardTitle><CardDescription>Hiển thị ở đầu trang chủ</CardDescription></CardHeader><CardContent><Input value={noticeText} onChange={(e) => setNoticeText(e.target.value)} /></CardContent></Card>
      </div>
    </div>
  );
}
