"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button"; import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n";
import { Save, Loader2, Facebook, Globe, Bell, QrCode, MessageSquareText, Upload, X, Image, Video, Link } from "lucide-react"; import { toast } from "sonner";

interface AdMediaItem { type: "image" | "video"; data: string; link?: string; }

export default function AdminSettingsPage() {
  const { t } = useTranslation();
  const [fb, setFb] = useState("");
  const [qrcode, setQrcode] = useState("");
  const [wechat, setWechat] = useState("");
  const [wechatQrcode, setWechatQrcode] = useState("");
  const [adMedia, setAdMedia] = useState<AdMediaItem[]>([]);
  const [editingLinkIdx, setEditingLinkIdx] = useState<number | null>(null);
  const [editLinkVal, setEditLinkVal] = useState("");
  const [tickerText, setTickerText] = useState("");
  const [notice, setNotice] = useState(""); const [phone, setPhone] = useState(""); const [site, setSite] = useState("");
  const [saving, setSaving] = useState(false); const [loading, setLoading] = useState(true);
  const zaloQrRef = useRef<HTMLInputElement>(null);
  const wechatQrRef = useRef<HTMLInputElement>(null);
  const adImageRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetch("/api/admin/settings").then((r) => r.json()).then((data: any[]) => { data.forEach((s: any) => { switch (s.key) {
    case "facebook_link": setFb(s.value); break;
    case "qrcode_image": setQrcode(s.value); break;
    case "wechat_id": setWechat(s.value); break;
    case "wechat_qrcode": setWechatQrcode(s.value); break;
    case "ad_media": case "ad_images": try { const p = JSON.parse(s.value || "[]"); setAdMedia(Array.isArray(p) ? p.map((item: any) => typeof item === "string" ? { type: "image" as const, data: item } : item) : []); } catch { setAdMedia([]); } break;
    case "ticker_text": setTickerText(s.value); break;
    case "notice_text": setNotice(s.value); break;
    case "contact_phone": setPhone(s.value); break;
    case "site_name": setSite(s.value); break;
  }}); setLoading(false); }).catch(() => setLoading(false)); }, []);

  const save = (k: string, v: string) => fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: k, value: v }) });

  const handleSave = async () => {
    setSaving(true);
    await Promise.all([
      save("facebook_link", fb), save("qrcode_image", qrcode), save("wechat_id", wechat), save("wechat_qrcode", wechatQrcode),
      save("ad_media", JSON.stringify(adMedia)), save("ad_images", JSON.stringify(adMedia)),
      save("ticker_text", tickerText),
      save("notice_text", notice), save("contact_phone", phone), save("site_name", site),
    ]);
    setSaving(false); toast.success(t("admin.settingsSaved"));
  };

  const handleFileUpload = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) { toast.error("Image too large (max 500KB)"); return; }
    const reader = new FileReader();
    reader.onload = () => { setter(reader.result as string); };
    reader.readAsDataURL(file);
  };

  const clearImage = (setter: (v: string) => void, ref: React.RefObject<HTMLInputElement | null>) => () => { setter(""); if (ref.current) ref.current.value = ""; };

  const [videoUrl, setVideoUrl] = useState("");

  const addAdImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) { toast.error("Image too large (max 500KB)"); return; }
    const reader = new FileReader();
    reader.onload = () => { setAdMedia((prev) => [...prev, { type: "image", data: reader.result as string }]); };
    reader.readAsDataURL(file);
    if (adImageRef.current) adImageRef.current.value = "";
  };

  const addAdVideo = () => {
    const url = videoUrl.trim();
    if (!url) { toast.error("Enter a video URL"); return; }
    if (!url.startsWith("http")) { toast.error("URL must start with http:// or https://"); return; }
    setAdMedia((prev) => [...prev, { type: "video", data: url }]);
    setVideoUrl("");
  };

  const removeAdMedia = (idx: number) => setAdMedia((prev) => prev.filter((_, i) => i !== idx));

  const startEditLink = (idx: number, currentLink: string) => { setEditingLinkIdx(idx); setEditLinkVal(currentLink); };
  const saveLink = () => {
    if (editingLinkIdx === null) return;
    setAdMedia((prev) => prev.map((item, i) => i === editingLinkIdx ? { ...item, link: editLinkVal } : item));
    setEditingLinkIdx(null);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6"><h1 className="text-xl font-bold text-gray-900">{t("admin.settingsTitle")}</h1><Button onClick={handleSave} disabled={saving}>{saving ? <><Loader2 size={16} className="mr-2 animate-spin" />{t("admin.saving")}</> : <><Save size={16} className="mr-2" />{t("admin.saveSettings")}</>}</Button></div>
      <div className="space-y-6">
        {/* Ad Banner Media */}
        <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Image size={18} className="text-purple-500" />{t("admin.adImages")}</CardTitle><CardDescription>{t("admin.adImagesDesc")}</CardDescription></CardHeader><CardContent className="space-y-3">
          {adMedia.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {adMedia.map((item, i) => (
                <div key={i} className="relative w-32 rounded-lg overflow-hidden border bg-black">
                  {item.type === "video" ? (
                    <video src={item.data} className="w-full h-20 object-contain" muted />
                  ) : (
                    <img src={item.data} alt={`Ad ${i + 1}`} className="w-full h-20 object-cover" />
                  )}
                  <span className={`absolute top-0.5 left-0.5 text-[9px] font-bold px-1 py-0.5 rounded text-white ${item.type === "video" ? "bg-blue-500" : "bg-green-500"}`}>
                    {item.type === "video" ? "VID" : "IMG"}
                  </span>
                  <button onClick={() => removeAdMedia(i)} className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"><X size={12} /></button>
                  {/* Link indicator */}
                  {item.link ? (
                    <span className="absolute bottom-0.5 left-0.5 text-[9px] bg-blue-500 text-white px-1 rounded" title={item.link}>🔗</span>
                  ) : null}
                  {/* Set link button */}
                  {editingLinkIdx === i ? (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-1 p-1">
                      <input value={editLinkVal} onChange={(e) => setEditLinkVal(e.target.value)} placeholder="https://..." className="w-full text-[10px] px-1 py-0.5 rounded" autoFocus onKeyDown={(e) => { if (e.key === "Enter") saveLink(); if (e.key === "Escape") setEditingLinkIdx(null); }} />
                      <div className="flex gap-1">
                        <button onClick={saveLink} className="text-[10px] bg-green-500 text-white px-1 rounded">OK</button>
                        <button onClick={() => setEditingLinkIdx(null)} className="text-[10px] bg-gray-500 text-white px-1 rounded">X</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => startEditLink(i, item.link || "")} className="absolute bottom-0.5 right-0.5 bg-black/50 hover:bg-black/80 text-white rounded p-0.5" title="Set link"><Link size={10} /></button>
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="space-y-2">
            <div className="flex gap-2 flex-wrap">
              <Button type="button" variant="outline" size="sm" onClick={() => adImageRef.current?.click()}><Image size={14} className="mr-1" />{t("admin.adAddImage")}</Button>
              <input ref={adImageRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={addAdImage} className="hidden" />
              <span className="text-xs text-gray-400 self-center">{t("admin.adImageHint")}</span>
            </div>
            <div className="flex gap-2">
              <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://example.com/video.mp4" className="flex-1 h-9 text-sm" />
              <Button type="button" variant="outline" size="sm" onClick={addAdVideo}><Video size={14} className="mr-1" />{t("admin.adAddVideo")}</Button>
            </div>
          </div>
        </CardContent></Card>

        {/* Ticker Text */}
        <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Bell size={18} className="text-blue-500" />{t("admin.tickerText")}</CardTitle><CardDescription>{t("admin.tickerDesc")}</CardDescription></CardHeader><CardContent><Input value={tickerText} onChange={(e) => setTickerText(e.target.value)} placeholder={t("admin.tickerPlaceholder")} /></CardContent></Card>

        {/* Zalo QR */}
        <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><QrCode size={18} className="text-blue-500" />{t("admin.qrCodeImage")}</CardTitle><CardDescription>{t("admin.qrCodeDesc")}</CardDescription></CardHeader><CardContent className="space-y-3">
          {qrcode ? (
            <div className="relative inline-block">
              <img src={qrcode} alt="Zalo QR" className="max-w-[200px] max-h-[200px] rounded-lg border" />
              <button onClick={clearImage(setQrcode, zaloQrRef)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"><X size={14} /></button>
            </div>
          ) : (
            <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-sm">{t("admin.qrCodeDesc")}</div>
          )}
          <Button type="button" variant="outline" size="sm" onClick={() => zaloQrRef.current?.click()}><Upload size={14} className="mr-1" />{t("admin.qrCodeUpload")}</Button>
          <input ref={zaloQrRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFileUpload(setQrcode)} className="hidden" />
        </CardContent></Card>

        {/* Facebook */}
        <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Facebook size={18} className="text-blue-600" />{t("admin.fbLink")}</CardTitle><CardDescription>{t("admin.fbDesc")}</CardDescription></CardHeader><CardContent><Input value={fb} onChange={(e) => setFb(e.target.value)} /></CardContent></Card>

        {/* WeChat */}
        <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><MessageSquareText size={18} className="text-green-600" />{t("admin.wechatId")}</CardTitle><CardDescription>{t("admin.wechatDesc")}</CardDescription></CardHeader><CardContent><Input value={wechat} onChange={(e) => setWechat(e.target.value)} placeholder="wxid_abc123" /></CardContent></Card>
        <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><QrCode size={18} className="text-green-500" />{t("admin.wechatQrCode")}</CardTitle><CardDescription>{t("admin.wechatQrDesc")}</CardDescription></CardHeader><CardContent className="space-y-3">
          {wechatQrcode ? (
            <div className="relative inline-block"><img src={wechatQrcode} alt="WeChat QR" className="max-w-[200px] max-h-[200px] rounded-lg border" />
              <button onClick={clearImage(setWechatQrcode, wechatQrRef)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"><X size={14} /></button></div>
          ) : (<div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-sm">{t("admin.wechatQrDesc")}</div>)}
          <Button type="button" variant="outline" size="sm" onClick={() => wechatQrRef.current?.click()}><Upload size={14} className="mr-1" />{t("admin.wechatQrUpload")}</Button>
          <input ref={wechatQrRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFileUpload(setWechatQrcode)} className="hidden" />
        </CardContent></Card>

        {/* Site Name */}
        <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Globe size={18} className="text-gray-600" />{t("admin.siteName")}</CardTitle></CardHeader><CardContent><Input value={site} onChange={(e) => setSite(e.target.value)} /></CardContent></Card>

        {/* Notice */}
        <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Bell size={18} className="text-yellow-500" />{t("admin.notice")}</CardTitle><CardDescription>{t("admin.noticeDesc")}</CardDescription></CardHeader><CardContent><Input value={notice} onChange={(e) => setNotice(e.target.value)} /></CardContent></Card>
      </div>
    </div>
  );
}
