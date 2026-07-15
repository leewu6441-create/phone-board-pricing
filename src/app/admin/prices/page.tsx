"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatVnd } from "@/lib/format";
import { useTranslation } from "@/lib/i18n";
import { convertVnd } from "@/lib/exchange";
import { Plus, Trash2, Save, Check, X, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

interface PriceData {
  id: number; device_model_id: number; variant: string; price_vnd: number;
  battery_info: string | null; storage: string | null; region_version: string | null; listing_type: string | null;
  is_active: boolean; model_name: string; brand_name: string; category_slug: string;
}
interface ModelOption { id: number; name: string; brand_name: string; category_slug: string; }
interface Rates { CNY: number; USD: number; }

let adminRatesCache: Rates | null = null;

async function getAdminRates(): Promise<Rates> {
  if (adminRatesCache) return adminRatesCache;
  const res = await fetch("/api/exchange-rates");
  adminRatesCache = await res.json();
  return adminRatesCache!;
}

export default function AdminPricesPage() {
  const { t } = useTranslation();
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [models, setModels] = useState<ModelOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [rates, setRates] = useState<Rates | null>(adminRatesCache);
  const [saving, setSaving] = useState(false);
  const [editingCell, setEditingCell] = useState<{id: number; field: string; value: string} | null>(null);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterModel, setFilterModel] = useState("all");

  useEffect(() => { getAdminRates().then(setRates); }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try { const [pr, mr] = await Promise.all([fetch("/api/admin/prices"), fetch("/api/admin/models")]); if (pr.ok) setPrices(await pr.json()); if (mr.ok) setModels(await mr.json()); } catch (e) {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = prices.filter((p) => { if (filterCategory !== "all" && p.category_slug !== filterCategory) return false; if (filterModel !== "all" && p.device_model_id !== parseInt(filterModel)) return false; return true; });
  const availModels = models.filter((m) => filterCategory === "all" || m.category_slug === filterCategory);
  const cnyRate = rates?.CNY || 0.00029;
  const isApple = filterCategory === "apple" || (filterCategory === "all" && filtered.some(p => p.category_slug === "apple"));

  const startEdit = (id: number, field: string, value: string) => setEditingCell({ id, field, value });

  const saveEdit = async () => {
    if (!editingCell) return;
    const u: any = { id: editingCell.id };
    if (editingCell.field === "price_vnd") {
      const n = parseInt(editingCell.value.replace(/\D/g, ""));
      if (isNaN(n) || n <= 0) { toast.error(t("admin.invalidPrice")); setEditingCell(null); return; }
      u.price_vnd = n;
    } else {
      u[editingCell.field] = editingCell.value;
    }
    const res = await fetch("/api/admin/prices", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(u) });
    if (res.ok) { toast.success(t("admin.priceSaved")); setPrices((prev) => prev.map((p) => (p.id === editingCell.id ? { ...p, ...u } : p))); }
    else toast.error(t("admin.priceSaveError"));
    setEditingCell(null);
  };

  const handleToggleActive = async (id: number, currentActive: boolean) => {
    const res = await fetch("/api/admin/prices", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, is_active: !currentActive }) });
    if (res.ok) { toast.success(currentActive ? t("admin.hidden") : t("admin.shown")); setPrices((prev) => prev.map((p) => (p.id === id ? { ...p, is_active: !currentActive } : p))); }
    else toast.error(t("admin.error"));
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(t("admin.confirmDelete", { name }))) return;
    const res = await fetch(`/api/admin/prices?id=${id}`, { method: "DELETE" });
    if (res.ok) { toast.success(t("admin.deleted")); setPrices((prev) => prev.filter((p) => p.id !== id)); }
    else toast.error(t("admin.deleteError"));
  };

  const handleAdd = async () => {
    if (filterModel === "all") { toast.error(t("admin.selectModel")); return; }
    const model = models.find(m => m.id === parseInt(filterModel));
    const listingType = model?.category_slug === "apple" ? "sale" : "recycle";
    const res = await fetch("/api/admin/prices", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ device_model_id: parseInt(filterModel), variant: t("admin.newVariant"), price_vnd: 0, listing_type: listingType }),
    });
    if (res.ok) { toast.success(t("admin.added")); fetchData(); } else toast.error(t("admin.addError"));
  };

  const saveAll = async () => { setSaving(true); let ok = 0; for (const p of filtered) { await fetch("/api/admin/prices", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: p.id, variant: p.variant, price_vnd: p.price_vnd, battery_info: p.battery_info, storage: p.storage, region_version: p.region_version, listing_type: p.listing_type }) }); ok++; } setSaving(false); toast.success(t("admin.savedCount", { count: ok })); };

  const grouped: Record<number, PriceData[]> = {};
  filtered.forEach((p) => { if (!grouped[p.device_model_id]) grouped[p.device_model_id] = []; grouped[p.device_model_id].push(p); });

  const editableCell = (price: PriceData, field: string, display: string, className = "") => {
    if (editingCell?.id === price.id && editingCell?.field === field) {
      return (
        <div className="flex items-center gap-1">
          <Input value={editingCell.value} onChange={(e) => setEditingCell({ ...editingCell, value: e.target.value })} className="h-8 text-sm" autoFocus onKeyDown={(e) => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditingCell(null); }} />
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={saveEdit}><Check size={14} className="text-green-600" /></Button>
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingCell(null)}><X size={14} className="text-red-600" /></Button>
        </div>
      );
    }
    return <span className={`cursor-pointer hover:text-primary-600 hover:underline ${className}`} onClick={() => startEdit(price.id, field, (price as any)[field] || "")}>{display}</span>;
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">{t("admin.pricesTitle")}</h1>
        <Button onClick={saveAll} disabled={saving}>{saving ? <><Loader2 size={16} className="mr-2 animate-spin" />{t("admin.saving")}</> : <><Save size={16} className="mr-2" />{t("admin.saveAll")}</>}</Button>
      </div>
      <Card className="mb-6"><CardContent className="p-4 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[150px]"><label className="text-xs text-gray-500 mb-1 block">{t("admin.filterCategory")}</label>
          <select value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setFilterModel("all"); }} className="w-full h-9 rounded-md border border-gray-300 px-3 text-sm">
            <option value="all">{t("admin.filterAll")}</option>
            <option value="apple">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 inline mr-1" fill="currentColor"><path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 21.99 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 21.99C7.79 22.03 6.8 20.68 5.96 19.47C4.25 16.97 2.94 12.45 4.7 9.39C5.57 7.87 7.13 6.91 8.82 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.24 4.34 13 3.5Z"/></svg>
              Apple
            </option>
            <option value="android">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 inline mr-1" fill="currentColor"><path d="M6,18c0,0.55 0.45,1 1,1h1v3.5c0,0.83 0.67,1.5 1.5,1.5s1.5,-0.67 1.5,-1.5V19h2v3.5c0,0.83 0.67,1.5 1.5,1.5s1.5,-0.67 1.5,-1.5V19h1c0.55,0 1,-0.45 1,-1V8H6V18ZM3.5,8C2.67,8 2,8.67 2,9.5v7c0,0.83 0.67,1.5 1.5,1.5S5,17.33 5,16.5v-7C5,8.67 4.33,8 3.5,8ZM20.5,8c-0.83,0 -1.5,0.67 -1.5,1.5v7c0,0.83 0.67,1.5 1.5,1.5s1.5,-0.67 1.5,-1.5v-7c0,-0.83 -0.67,-1.5 -1.5,-1.5ZM15.53,2.16l1.3,-1.3c0.2,-0.2 0.2,-0.51 0,-0.71c-0.2,-0.2 -0.51,-0.2 -0.71,0l-1.48,1.48C13.85,1.23 12.95,1 12,1c-0.96,0 -1.86,0.23 -2.66,0.63L7.85,0.15c-0.2,-0.2 -0.51,-0.2 -0.71,0c-0.2,0.2 -0.2,0.51 0,0.71l1.3,1.3C6.97,3.26 6,5.01 6,7h12c0,-1.99 -0.97,-3.75 -2.47,-4.84Z"/></svg>
              Android
            </option>
          </select></div>
        <div className="flex-[2] min-w-[200px]"><label className="text-xs text-gray-500 mb-1 block">{t("admin.filterModel")}</label>
          <select value={filterModel} onChange={(e) => setFilterModel(e.target.value)} className="w-full h-9 rounded-md border border-gray-300 px-3 text-sm">
            <option value="all">{t("admin.filterAllModels")}</option>{availModels.map((m) => <option key={m.id} value={m.id}>{m.brand_name} - {m.name}</option>)}</select></div>
        <div className="flex items-end"><Button variant="outline" size="sm" onClick={handleAdd} className="h-9"><Plus size={16} className="mr-1" />{t("admin.addRow")}</Button></div>
      </CardContent></Card>

      <div className="space-y-6">
        {Object.entries(grouped).map(([mid, mprices]) => { const model = models.find((m) => m.id === parseInt(mid)); const isAppleModel = model?.category_slug === "apple"; return (
          <Card key={mid}><CardHeader className="pb-2"><div className="flex items-center gap-2">
            <Badge variant="secondary">{model?.brand_name || ""}</Badge>
            <Badge variant={isAppleModel ? "default" : "outline"} className={isAppleModel ? "bg-gray-900" : ""}>
              {isAppleModel
                ? <svg viewBox="0 0 24 24" className="h-3 w-3" fill="white"><path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 21.99 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 21.99C7.79 22.03 6.8 20.68 5.96 19.47C4.25 16.97 2.94 12.45 4.7 9.39C5.57 7.87 7.13 6.91 8.82 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.24 4.34 13 3.5Z"/></svg>
                : <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor"><path d="M6,18c0,0.55 0.45,1 1,1h1v3.5c0,0.83 0.67,1.5 1.5,1.5s1.5,-0.67 1.5,-1.5V19h2v3.5c0,0.83 0.67,1.5 1.5,1.5s1.5,-0.67 1.5,-1.5V19h1c0.55,0 1,-0.45 1,-1V8H6V18ZM3.5,8C2.67,8 2,8.67 2,9.5v7c0,0.83 0.67,1.5 1.5,1.5S5,17.33 5,16.5v-7C5,8.67 4.33,8 3.5,8ZM20.5,8c-0.83,0 -1.5,0.67 -1.5,1.5v7c0,0.83 0.67,1.5 1.5,1.5s1.5,-0.67 1.5,-1.5v-7c0,-0.83 -0.67,-1.5 -1.5,-1.5ZM15.53,2.16l1.3,-1.3c0.2,-0.2 0.2,-0.51 0,-0.71c-0.2,-0.2 -0.51,-0.2 -0.71,0l-1.48,1.48C13.85,1.23 12.95,1 12,1c-0.96,0 -1.86,0.23 -2.66,0.63L7.85,0.15c-0.2,-0.2 -0.51,-0.2 -0.71,0c-0.2,0.2 -0.2,0.51 0,0.71l1.3,1.3C6.97,3.26 6,5.01 6,7h12c0,-1.99 -0.97,-3.75 -2.47,-4.84Z"/></svg>
              }
            </Badge>
            <CardTitle className="text-base">{model?.name || `Model #${mid}`}</CardTitle>
          </div></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
              <table className="admin-table"><thead><tr>
                <th className="w-8">#</th>
                <th>{t("admin.colVersion")}</th>
                {isAppleModel && <><th>{t("apple.storage")}</th><th>{t("apple.battery")}</th><th>{t("apple.region")}</th></>}
                <th className="w-32 text-right">¥ CNY</th>
                <th className="w-36 text-right">VND</th>
                <th className="w-20 text-center">{t("admin.colDelete")}</th>
              </tr></thead>
              <tbody>{mprices.map((price, idx) => {
                const cnyPrice = convertVnd(price.price_vnd, "CNY", { CNY: cnyRate, USD: 0.00004 });
                return (
                <tr key={price.id} className={price.is_active ? "" : "opacity-50 bg-gray-50"}><td className="text-gray-400 text-xs">{idx + 1}</td>
                  <td>{editableCell(price, "variant", price.variant)}</td>
                  {isAppleModel && <>
                    <td>{editableCell(price, "storage", price.storage || "-", "text-xs text-gray-500")}</td>
                    <td>{editableCell(price, "battery_info", price.battery_info || "-", "text-xs text-gray-500")}</td>
                    <td>{editableCell(price, "region_version", price.region_version || "-", "text-xs text-gray-500")}</td>
                  </>}
                  <td className="text-right">
                    <span className="font-semibold text-red-600">{formatPrice(cnyPrice, "CNY")}</span>
                  </td>
                  <td className="text-right">
                    {editingCell?.id === price.id && editingCell?.field === "price_vnd" ? (
                      <div className="flex items-center gap-1 justify-end"><Input value={editingCell.value} onChange={(e) => setEditingCell({ ...editingCell, value: e.target.value })} className="h-8 text-sm w-36 text-right" autoFocus onKeyDown={(e) => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditingCell(null); }} /><Button size="icon" variant="ghost" className="h-7 w-7" onClick={saveEdit}><Check size={14} className="text-green-600" /></Button><Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingCell(null)}><X size={14} className="text-red-600" /></Button></div>
                    ) : (
                      <span className="cursor-pointer text-gray-500 hover:underline text-xs" onClick={() => startEdit(price.id, "price_vnd", price.price_vnd.toString())}>{formatVnd(price.price_vnd)}</span>
                    )}
                  </td>
                  <td className="text-center">
                    <div className="flex items-center justify-center gap-0.5">
                      <Button variant="ghost" size="icon" className={`h-7 w-7 ${price.is_active ? "text-gray-400 hover:text-yellow-600" : "text-yellow-500 hover:text-green-600"}`} onClick={() => handleToggleActive(price.id, price.is_active)} title={price.is_active ? t("admin.hide") : t("admin.show")}>
                        {price.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-red-600" onClick={() => handleDelete(price.id, price.variant)}><Trash2 size={14} /></Button>
                    </div>
                  </td>
                </tr>
              )})}{mprices.length === 0 && <tr><td colSpan={isAppleModel ? 8 : 5} className="text-center text-gray-400 py-6">{t("admin.noData")}</td></tr>}</tbody></table>
              </div>
            </CardContent>
          </Card>
        );})}
        {Object.keys(grouped).length === 0 && <Card><CardContent className="py-12 text-center text-gray-400">{t("admin.noDataYet")}</CardContent></Card>}
      </div>
    </div>
  );
}
