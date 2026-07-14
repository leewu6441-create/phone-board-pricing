"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatVnd } from "@/lib/format";
import { Plus, Trash2, Save, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PriceData {
  id: number;
  device_model_id: number;
  variant: string;
  price_vnd: number;
  is_active: boolean;
  model_name: string;
  brand_name: string;
  category_slug: string;
}

interface ModelOption {
  id: number;
  name: string;
  brand_name: string;
  category_slug: string;
}

export default function AdminPricesPage() {
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [models, setModels] = useState<ModelOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingCell, setEditingCell] = useState<{
    id: number; field: "variant" | "price_vnd"; value: string;
  } | null>(null);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterModel, setFilterModel] = useState("all");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [priceRes, modelRes] = await Promise.all([
        fetch("/api/admin/prices"),
        fetch("/api/admin/models"),
      ]);
      if (priceRes.ok) setPrices(await priceRes.json());
      if (modelRes.ok) setModels(await modelRes.json());
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredPrices = prices.filter((p) => {
    if (filterCategory !== "all" && p.category_slug !== filterCategory) return false;
    if (filterModel !== "all" && p.device_model_id !== parseInt(filterModel)) return false;
    return true;
  });

  const availableModels = models.filter(
    (m) => filterCategory === "all" || m.category_slug === filterCategory
  );

  const startEdit = (id: number, field: "variant" | "price_vnd", value: string) => {
    setEditingCell({ id, field, value });
  };

  const saveEdit = async () => {
    if (!editingCell) return;
    const updates: any = { id: editingCell.id };
    if (editingCell.field === "variant") {
      updates.variant = editingCell.value;
    } else {
      const numValue = parseInt(editingCell.value.replace(/\D/g, ""));
      if (isNaN(numValue) || numValue <= 0) { toast.error("Giá không hợp lệ"); setEditingCell(null); return; }
      updates.price_vnd = numValue;
    }

    const res = await fetch("/api/admin/prices", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    if (res.ok) {
      toast.success("Đã lưu");
      setPrices((prev) => prev.map((p) => (p.id === editingCell.id ? { ...p, ...updates } : p)));
    } else {
      toast.error("Lỗi khi lưu");
    }
    setEditingCell(null);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Xóa "${name}"?`)) return;
    const res = await fetch(`/api/admin/prices?id=${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Đã xóa"); setPrices((prev) => prev.filter((p) => p.id !== id)); }
    else toast.error("Lỗi khi xóa");
  };

  const handleAdd = async () => {
    if (filterModel === "all") { toast.error("Vui lòng chọn model"); return; }
    const res = await fetch("/api/admin/prices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ device_model_id: parseInt(filterModel), variant: "Phiên bản mới", price_vnd: 0 }),
    });
    if (res.ok) { toast.success("Đã thêm"); fetchData(); }
    else toast.error("Lỗi khi thêm");
  };

  const saveAll = async () => {
    setSaving(true);
    let ok = 0;
    for (const p of filteredPrices) {
      const res = await fetch("/api/admin/prices", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: p.id, variant: p.variant, price_vnd: p.price_vnd }),
      });
      if (res.ok) ok++;
    }
    setSaving(false);
    toast.success(`Đã lưu ${ok} mục`);
  };

  const grouped: Record<number, PriceData[]> = {};
  filteredPrices.forEach((p) => {
    if (!grouped[p.device_model_id]) grouped[p.device_model_id] = [];
    grouped[p.device_model_id].push(p);
  });

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Quản lý bảng giá</h1>
        <Button onClick={saveAll} disabled={saving}>
          {saving ? <><Loader2 size={16} className="mr-2 animate-spin" />Đang lưu...</> : <><Save size={16} className="mr-2" />Lưu tất cả</>}
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[150px]">
            <label className="text-xs text-gray-500 mb-1 block">Danh mục</label>
            <select value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setFilterModel("all"); }} className="w-full h-9 rounded-md border border-gray-300 px-3 text-sm">
              <option value="all">Tất cả</option>
              <option value="apple">🍎 Apple</option>
              <option value="android">🤖 Android</option>
            </select>
          </div>
          <div className="flex-[2] min-w-[200px]">
            <label className="text-xs text-gray-500 mb-1 block">Model</label>
            <select value={filterModel} onChange={(e) => setFilterModel(e.target.value)} className="w-full h-9 rounded-md border border-gray-300 px-3 text-sm">
              <option value="all">Tất cả model</option>
              {availableModels.map((m) => <option key={m.id} value={m.id}>{m.brand_name} - {m.name}</option>)}
            </select>
          </div>
          <div className="flex items-end"><Button variant="outline" size="sm" onClick={handleAdd} className="h-9"><Plus size={16} className="mr-1" />Thêm dòng</Button></div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {Object.entries(grouped).map(([modelId, modelPrices]) => {
          const model = models.find((m) => m.id === parseInt(modelId));
          return (
            <Card key={modelId}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{model?.brand_name || ""}</Badge>
                  <Badge variant={model?.category_slug === "apple" ? "default" : "outline"}>{model?.category_slug === "apple" ? "🍎" : "🤖"}</Badge>
                  <CardTitle className="text-base">{model?.name || `Model #${modelId}`}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <table className="admin-table">
                  <thead><tr><th className="w-8">#</th><th>Phiên bản</th><th className="w-48 text-right">Giá (VND)</th><th className="w-20 text-center">Xóa</th></tr></thead>
                  <tbody>
                    {modelPrices.map((price, idx) => (
                      <tr key={price.id}>
                        <td className="text-gray-400 text-xs">{idx + 1}</td>
                        <td>
                          {editingCell?.id === price.id && editingCell?.field === "variant" ? (
                            <div className="flex items-center gap-1">
                              <Input value={editingCell.value} onChange={(e) => setEditingCell({ ...editingCell, value: e.target.value })} className="h-8 text-sm" autoFocus onKeyDown={(e) => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditingCell(null); }} />
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={saveEdit}><Check size={14} className="text-green-600" /></Button>
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingCell(null)}><X size={14} className="text-red-600" /></Button>
                            </div>
                          ) : (
                            <span className="cursor-pointer hover:text-primary-600 hover:underline" onClick={() => startEdit(price.id, "variant", price.variant)}>{price.variant}</span>
                          )}
                        </td>
                        <td className="text-right">
                          {editingCell?.id === price.id && editingCell?.field === "price_vnd" ? (
                            <div className="flex items-center gap-1 justify-end">
                              <Input value={editingCell.value} onChange={(e) => setEditingCell({ ...editingCell, value: e.target.value })} className="h-8 text-sm w-40 text-right" autoFocus onKeyDown={(e) => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditingCell(null); }} />
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={saveEdit}><Check size={14} className="text-green-600" /></Button>
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingCell(null)}><X size={14} className="text-red-600" /></Button>
                            </div>
                          ) : (
                            <span className="cursor-pointer font-semibold text-red-600 hover:underline" onClick={() => startEdit(price.id, "price_vnd", price.price_vnd.toString())}>{formatVnd(price.price_vnd)}</span>
                          )}
                        </td>
                        <td className="text-center">
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-red-600" onClick={() => handleDelete(price.id, price.variant)}><Trash2 size={14} /></Button>
                        </td>
                      </tr>
                    ))}
                    {modelPrices.length === 0 && <tr><td colSpan={4} className="text-center text-gray-400 py-6">Không có dữ liệu</td></tr>}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          );
        })}
        {Object.keys(grouped).length === 0 && <Card><CardContent className="py-12 text-center text-gray-400">Chưa có dữ liệu</CardContent></Card>}
      </div>
    </div>
  );
}
