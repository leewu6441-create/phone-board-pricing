"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
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

  const supabase = createClient();

  const fetchSettings = useCallback(async () => {
    const { data, error } = await supabase
      .from("site_settings")
      .select("key, value");

    if (!error && data) {
      data.forEach((item: { key: string; value: string }) => {
        switch (item.key) {
          case "zalo_link":
            setZaloLink(item.value);
            break;
          case "facebook_link":
            setFacebookLink(item.value);
            break;
          case "notice_text":
            setNoticeText(item.value);
            break;
          case "contact_phone":
            setContactPhone(item.value);
            break;
          case "site_name":
            setSiteName(item.value);
            break;
        }
      });
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async () => {
    setSaving(true);

    const settings = [
      { key: "zalo_link", value: zaloLink },
      { key: "facebook_link", value: facebookLink },
      { key: "notice_text", value: noticeText },
      { key: "contact_phone", value: contactPhone },
      { key: "site_name", value: siteName },
    ];

    const { error } = await supabase.from("site_settings").upsert(settings, {
      onConflict: "key",
    });

    setSaving(false);

    if (error) {
      toast.error("Lỗi khi lưu cài đặt");
    } else {
      toast.success("Đã lưu cài đặt");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Cài đặt trang web</h1>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" /> Đang lưu...
            </>
          ) : (
            <>
              <Save size={16} className="mr-2" /> Lưu cài đặt
            </>
          )}
        </Button>
      </div>

      <div className="space-y-6">
        {/* Zalo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageCircle size={18} className="text-blue-500" />
              Liên kết Zalo
            </CardTitle>
            <CardDescription>
              Link Zalo cá nhân hoặc Official Account. VD:
              https://zalo.me/0912345678
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              value={zaloLink}
              onChange={(e) => setZaloLink(e.target.value)}
              placeholder="https://zalo.me/your-phone"
            />
          </CardContent>
        </Card>

        {/* Facebook */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Facebook size={18} className="text-blue-600" />
              Liên kết Facebook
            </CardTitle>
            <CardDescription>
              Link nhóm Facebook của bạn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              value={facebookLink}
              onChange={(e) => setFacebookLink(e.target.value)}
              placeholder="https://facebook.com/groups/your-group"
            />
          </CardContent>
        </Card>

        {/* Site Name */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe size={18} className="text-gray-600" />
              Tên trang web
            </CardTitle>
            <CardDescription>
              Tên hiển thị trên header của trang
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              placeholder="Bảng Giá Mainboard"
            />
          </CardContent>
        </Card>

        {/* Notice */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell size={18} className="text-yellow-500" />
              Thông báo
            </CardTitle>
            <CardDescription>
              Hiển thị ở đầu trang chủ. Để trống nếu không có thông báo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              value={noticeText}
              onChange={(e) => setNoticeText(e.target.value)}
              placeholder="VD: Hôm nay giá iPhone 15 tăng nhẹ"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
