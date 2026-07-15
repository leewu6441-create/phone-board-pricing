"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button"; import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n";
import { Save, Loader2, MessageCircle, Facebook, Globe, Bell, QrCode, MessageSquareText, Upload, X } from "lucide-react"; import { toast } from "sonner";

export default function AdminSettingsPage() {
  const { t } = useTranslation();
  const [zalo, setZalo] = useState(""); const [fb, setFb] = useState("");
  const [qrcode, setQrcode] = useState(""); // Zalo QR code (base64 or URL)
  const [wechat, setWechat] = useState("");
  const [wechatQrcode, setWechatQrcode] = useState(""); // WeChat QR code (base64 or URL)
  const [notice, setNotice] = useState(""); const [phone, setPhone] = useState(""); const [site, setSite] = useState("");
  const [saving, setSaving] = useState(false); const [loading, setLoading] = useState(true);
  const zaloQrRef = useRef<HTMLInputElement>(null);
  const wechatQrRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetch("/api/admin/settings").then((r) => r.json()).then((data: any[]) => { data.forEach((s: any) => { switch (s.key) { case "zalo_link": setZalo(s.value); break; case "facebook_link": setFb(s.value); break; case "qrcode_image": setQrcode(s.value); break; case "wechat_id": setWechat(s.value); break; case "wechat_qrcode": setWechatQrcode(s.value); break; case "notice_text": setNotice(s.value); break; case "contact_phone": setPhone(s.value); break; case "site_name": setSite(s.value); break; } }); setLoading(false); }).catch(() => setLoading(false)); }, []);

  const save = (k: string, v: string) => fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: k, value: v }) });

  const handleSave = async () => {
    setSaving(true);
    await Promise.all([save("zalo_link", zalo), save("facebook_link", fb), save("qrcode_image", qrcode), save("wechat_id", wechat), save("wechat_qrcode", wechatQrcode), save("notice_text", notice), save("contact_phone", phone), save("site_name", site)]);
    setSaving(false); toast.success(t("admin.settingsSaved"));
  };

  const handleFileUpload = (setter: (v: string) => void, ref: React.RefObject<HTMLInputElement | null>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) { toast.error("Image too large (max 500KB)"); return; }
    const reader = new FileReader();
    reader.onload = () => { setter(reader.result as string); };
    reader.readAsDataURL(file);
    if (ref.current) ref.current.value = "";
  };

  const clearImage = (setter: (v: string) => void, ref: React.RefObject<HTMLInputElement | null>) => () => { setter(""); if (ref.current) ref.current.value = ""; };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6"><h1 className="text-xl font-bold text-gray-900">{t("admin.settingsTitle")}</h1><Button onClick={handleSave} disabled={saving}>{saving ? <><Loader2 size={16} className="mr-2 animate-spin" />{t("admin.saving")}</> : <><Save size={16} className="mr-2" />{t("admin.saveSettings")}</>}</Button></div>
      <div className="space-y-6">
        <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><MessageCircle size={18} className="text-blue-500" />{t("admin.zaloLink")}</CardTitle><CardDescription>{t("admin.zaloDesc")}</CardDescription></CardHeader><CardContent><Input value={zalo} onChange={(e) => setZalo(e.target.value)} /></CardContent></Card>
        <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><QrCode size={18} className="text-blue-400" />{t("admin.qrCodeImage")}</CardTitle><CardDescription>{t("admin.qrCodeDesc")}</CardDescription></CardHeader><CardContent className="space-y-3">
          {qrcode ? (
            <div className="relative inline-block">
              <img src={qrcode} alt="Zalo QR" className="max-w-[200px] max-h-[200px] rounded-lg border" />
              <button onClick={clearImage(setQrcode, zaloQrRef)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600" title="Remove"><X size={14} /></button>
            </div>
          ) : (
            <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-sm">{t("admin.qrCodeDesc")}</div>
          )}
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => zaloQrRef.current?.click()}><Upload size={14} className="mr-1" />{t("admin.qrCodeUpload")}</Button>
            <input ref={zaloQrRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFileUpload(setQrcode, zaloQrRef)} className="hidden" />
          </div>
        </CardContent></Card>
        <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Facebook size={18} className="text-blue-600" />{t("admin.fbLink")}</CardTitle><CardDescription>{t("admin.fbDesc")}</CardDescription></CardHeader><CardContent><Input value={fb} onChange={(e) => setFb(e.target.value)} /></CardContent></Card>
        <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><MessageSquareText size={18} className="text-green-600" />{t("admin.wechatId")}</CardTitle><CardDescription>{t("admin.wechatDesc")}</CardDescription></CardHeader><CardContent><Input value={wechat} onChange={(e) => setWechat(e.target.value)} placeholder="wxid_abc123" /></CardContent></Card>
        <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><QrCode size={18} className="text-green-500" />{t("admin.wechatQrCode")}</CardTitle><CardDescription>{t("admin.wechatQrDesc")}</CardDescription></CardHeader><CardContent className="space-y-3">
          {wechatQrcode ? (
            <div className="relative inline-block">
              <img src={wechatQrcode} alt="WeChat QR" className="max-w-[200px] max-h-[200px] rounded-lg border" />
              <button onClick={clearImage(setWechatQrcode, wechatQrRef)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600" title="Remove"><X size={14} /></button>
            </div>
          ) : (
            <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-sm">{t("admin.wechatQrDesc")}</div>
          )}
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => wechatQrRef.current?.click()}><Upload size={14} className="mr-1" />{t("admin.wechatQrUpload")}</Button>
            <input ref={wechatQrRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFileUpload(setWechatQrcode, wechatQrRef)} className="hidden" />
          </div>
        </CardContent></Card>
        <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Globe size={18} className="text-gray-600" />{t("admin.siteName")}</CardTitle></CardHeader><CardContent><Input value={site} onChange={(e) => setSite(e.target.value)} /></CardContent></Card>
        <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Bell size={18} className="text-yellow-500" />{t("admin.notice")}</CardTitle><CardDescription>{t("admin.noticeDesc")}</CardDescription></CardHeader><CardContent><Input value={notice} onChange={(e) => setNotice(e.target.value)} /></CardContent></Card>
      </div>
    </div>
  );
}
