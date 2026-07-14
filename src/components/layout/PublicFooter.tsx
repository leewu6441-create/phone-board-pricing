"use client";

import { useTranslation } from "@/lib/i18n";

export function PublicFooter() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-100 border-t border-gray-200 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-xs text-gray-500">
            {t("footer.rights", { year })}
          </p>
          <p className="text-xs text-gray-400">
            {t("footer.disclaimer")}
          </p>
        </div>
      </div>
    </footer>
  );
}
