"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button"; import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/i18n"; import { generateSlug } from "@/lib/utils";
import { Plus, Trash2, Loader2, Check, X, ListPlus } from "lucide-react"; import { toast } from "sonner";

interface ModelData { id: number; name: string; model_code: string | null; brand_id: number; brand_name: string; category_name: string; is_active: boolean; }
interface BrandData { id: number; name: string; category_id: number; category_name: string; }

export default function AdminModelsPage() {
  const { t } = useTranslation();
  const [models, setModels] = useState<ModelData[]>([]); const [brands, setBrands] = useState<BrandData[]>([]);
  const [loading, setLoading] = useState(true); const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState(""); const [newCode, setNewCode] = useState(""); const [newBrandId, setNewBrandId] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null); const [editName, setEditName] = useState("");

  // Batch add state
  const [showBatch, setShowBatch] = useState(false);
  const [batchText, setBatchText] = useState("");
  const [batchBrandId, setBatchBrandId] = useState("");
  const [batchAdding, setBatchAdding] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try { const [mr, br] = await Promise.all([fetch("/api/admin/models"), fetch("/api/admin/brands")]); if (mr.ok) setModels(await mr.json()); if (br.ok) setBrands(await br.json()); } catch (e) {}
    setLoading(false);
  }, []);
  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAdd = async () => {
    if (!newName.trim() || !newBrandId) { toast.error(t("admin.fillAll")); return; }
    const res = await fetch("/api/admin/models", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newName.trim(), model_code: newCode.trim() || null, brand_id: parseInt(newBrandId), slug: generateSlug(newName) }) });
    if (res.ok) { toast.success(t("admin.added")); setNewName(""); setNewCode(""); setNewBrandId(""); setShowAdd(false); fetchData(); }
    else { const d = await res.json(); toast.error(t("admin.error") + ": " + (d.error || "")); }
  };

  const handleBatchAdd = async () => {
    if (!batchText.trim() || !batchBrandId) { toast.error(t("admin.fillAll")); return; }
    const names = batchText.split("\n").map((l) => l.trim()).filter(Boolean);
    if (names.length === 0) { toast.error(t("admin.fillAll")); return; }
    setBatchAdding(true);
    const res = await fetch("/api/admin/models", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ batch: true, brand_id: parseInt(batchBrandId), models: names }),
    });
    if (res.ok) {
      const data = await res.json();
      const dupes = data.results.filter((r: any) => !r.success).length;
      if (dupes > 0) {
        toast.warning(t("admin.batchResult", { ok: data.succeeded, fail: dupes }));
      } else {
        toast.success(t("admin.batchSuccess", { count: data.succeeded }));
      }
      setBatchText(""); setBatchBrandId(""); setShowBatch(false); fetchData();
    } else {
      toast.error(t("admin.error"));
    }
    setBatchAdding(false);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(t("admin.confirmDeleteModel", { name }))) return;
    const res = await fetch(`/api/admin/models?id=${id}`, { method: "DELETE" });
    if (res.ok) { toast.success(t("admin.deleted")); fetchData(); } else toast.error(t("admin.deleteError"));
  };

  const startEdit = (m: ModelData) => { setEditingId(m.id); setEditName(m.name); };
  const saveEdit = async (id: number) => {
    if (!editName.trim()) return;
    const res = await fetch("/api/admin/models", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, name: editName.trim(), slug: generateSlug(editName) }) });
    if (res.ok) { toast.success(t("admin.updated")); fetchData(); } else toast.error(t("admin.error"));
    setEditingId(null);
  };

  const grouped: Record<string, ModelData[]> = {};
  models.forEach((m) => { const k = `${m.brand_name} (${m.category_name})`; if (!grouped[k]) grouped[k] = []; grouped[k].push(m); });

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">{t("admin.modelsTitle")}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setShowBatch(!showBatch); setShowAdd(false); }}><ListPlus size={16} className="mr-2" />{t("admin.batchAdd")}</Button>
          <Button onClick={() => { setShowAdd(!showAdd); setShowBatch(false); }}><Plus size={16} className="mr-2" />{t("admin.addModel")}</Button>
        </div>
      </div>

      {/* Single Add */}
      {showAdd && (<Card className="mb-6"><CardContent className="p-4"><div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[150px]"><label className="text-xs text-gray-500 mb-1 block">{t("admin.brandName")}</label><select value={newBrandId} onChange={(e) => setNewBrandId(e.target.value)} className="w-full h-9 rounded-md border border-gray-300 px-3 text-sm"><option value="">{t("admin.selectBrand")}</option>{brands.map((b) => <option key={b.id} value={b.id}>{b.name} ({b.category_name})</option>)}</select></div>
        <div className="flex-[2] min-w-[200px]"><label className="text-xs text-gray-500 mb-1 block">{t("admin.modelName")}</label><Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder={t("admin.modelNamePH")} /></div>
        <div className="flex-1 min-w-[120px]"><label className="text-xs text-gray-500 mb-1 block">{t("admin.modelCode")}</label><Input value={newCode} onChange={(e) => setNewCode(e.target.value)} placeholder="A3296" /></div>
        <Button onClick={handleAdd}>{t("admin.add")}</Button><Button variant="ghost" onClick={() => setShowAdd(false)}>{t("admin.cancel")}</Button>
      </div></CardContent></Card>)}

      {/* Batch Add */}
      {showBatch && (<Card className="mb-6"><CardHeader className="pb-2"><CardTitle className="text-base">{t("admin.batchAddTitle")}</CardTitle></CardHeader><CardContent className="space-y-3">
        <div><label className="text-xs text-gray-500 mb-1 block">{t("admin.selectBrand")}</label><select value={batchBrandId} onChange={(e) => setBatchBrandId(e.target.value)} className="w-full h-9 rounded-md border border-gray-300 px-3 text-sm"><option value="">{t("admin.selectBrand")}...</option>{brands.map((b) => <option key={b.id} value={b.id}>{b.name} ({b.category_name})</option>)}</select></div>
        <div><label className="text-xs text-gray-500 mb-1 block">{t("admin.batchHint")}</label><textarea value={batchText} onChange={(e) => setBatchText(e.target.value)} placeholder={t("admin.batchPlaceholder")} rows={6} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm resize-y" /></div>
        <div className="flex gap-2 items-center">
          <Button onClick={handleBatchAdd} disabled={batchAdding}>{batchAdding ? <><Loader2 size={16} className="mr-2 animate-spin" />{t("admin.saving")}</> : t("admin.batchAddBtn", { count: batchText.split("\n").filter(Boolean).length })}</Button>
          <Button variant="ghost" onClick={() => setShowBatch(false)}>{t("admin.cancel")}</Button>
        </div>
      </CardContent></Card>)}

      <div className="space-y-6">
        {Object.entries(grouped).map(([gk, gm]) => (<Card key={gk}><CardHeader className="pb-2"><CardTitle className="text-base text-gray-700">{gk} <span className="text-gray-400 text-sm ml-2 font-normal">({gm.length})</span></CardTitle></CardHeader>
          <CardContent><table className="admin-table"><thead><tr><th>{t("admin.colName")}</th><th>{t("admin.colCode")}</th><th>{t("admin.colStatus")}</th><th className="w-20 text-center">{t("admin.colDelete")}</th></tr></thead>
            <tbody>{gm.map((m) => (<tr key={m.id}>
              <td>{editingId === m.id ? (<div className="flex items-center gap-1"><Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-8 text-sm" autoFocus onKeyDown={(e) => { if (e.key === "Enter") saveEdit(m.id); if (e.key === "Escape") setEditingId(null); }} /><Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => saveEdit(m.id)}><Check size={14} className="text-green-600" /></Button><Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingId(null)}><X size={14} className="text-red-600" /></Button></div>) : (<span className="cursor-pointer hover:text-primary-600" onClick={() => startEdit(m)}>{m.name}</span>)}</td>
              <td className="text-gray-500 text-xs">{m.model_code || "-"}</td>
              <td><Badge variant={m.is_active ? "success" : "secondary"} className="text-[10px]">{m.is_active ? t("admin.active") : t("admin.hidden")}</Badge></td>
              <td className="text-center"><Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-red-600" onClick={() => handleDelete(m.id, m.name)}><Trash2 size={14} /></Button></td>
            </tr>))}</tbody></table></CardContent></Card>))}
      </div>
    </div>
  );
}
