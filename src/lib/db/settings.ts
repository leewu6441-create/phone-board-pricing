import { prisma } from "@/lib/prisma";
import { DEFAULT_ZALO_LINK, DEFAULT_FACEBOOK_LINK, DEFAULT_QRCODE_IMAGE, DEFAULT_WECHAT_ID, DEFAULT_WECHAT_QRCODE } from "@/lib/constants";

const defaults: Record<string, string> = {
  zalo_link: DEFAULT_ZALO_LINK,
  facebook_link: DEFAULT_FACEBOOK_LINK,
  qrcode_image: DEFAULT_QRCODE_IMAGE,
  wechat_id: DEFAULT_WECHAT_ID,
  wechat_qrcode: DEFAULT_WECHAT_QRCODE,
  ad_media: "[]",
  ticker_text: "",
  contact_phone: "",
  notice_text: "",
  site_name: "Vertex",
};

export async function getSetting(key: string): Promise<string | null> {
  const setting = await prisma.siteSetting.findUnique({
    where: { key },
    select: { value: true },
  });

  if (!setting) {
    return defaults[key] || null;
  }

  return setting.value;
}

export async function getAllSettings(): Promise<Record<string, string>> {
  const settings = await prisma.siteSetting.findMany();
  const result: Record<string, string> = {};

  for (const s of settings) {
    result[s.key] = s.value || "";
  }

  // Fill in defaults for missing keys
  for (const [key, value] of Object.entries(defaults)) {
    if (!(key in result)) {
      result[key] = value;
    }
  }

  return result;
}

export async function updateSetting(
  key: string,
  value: string
): Promise<boolean> {
  await prisma.siteSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
  return true;
}
