"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Loader2, Check, X } from "lucide-react";
import { toast } from "sonner";

interface BrandData { id: number; name: string; category_id: number; category_name: string; is_active: boolean; _count?: number; }
interface CategoryData { id: number; name: string; }

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<BrandData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCategoryId, setNewCategoryId] = useState("1");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/brands");
    if (res.ok) setBrands(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAdd = async () => {
    if (!newName.trim() || !newCategoryId) { toast.error("Vui lòng nhập đầy đủ"); return; }
    const slug = newName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const res = await fetch("/api/admin/brands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), category_id: parseInt(newCategoryId), slug }),
    });
    if (res.ok) { toast.success("Đã thêm"); setNewName(""); setShowAdd(false); fetchData(); }
    else toast.error("Lỗi khi thêm");
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Xóa "${name}"?`)) return;
    const res = await fetch(`/api/admin/brands?id=${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Đã xóa"); fetchData(); }
    else toast.error("Lỗi khi xóa");
  };

  const startEdit = (b: BrandData) => { setEditingId(b.id); setEditName(b.name); };
  const saveEdit = async (id: number) => {
    if (!editName.trim()) return;
    const slug = editName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const res = await fetch("/api/admin/brands", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, name: editName.trim(), slug }),
    });
    if (res.ok) { toast.success("Đã cập nhật"); fetchData(); }
    else toast.error("Lỗi");
    setEditingId(null);
  };

  const grouped: Record<string, BrandData[]> = {};
  brands.forEach((b) => { if (!grouped[b.category_name]) grouped[b.category_name] = []; grouped[b.category_name].push(b); });

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Quản lý hãng</h1>
        <Button onClick={() => setShowAdd(!showAdd)}><Plus size={16} className="mr-2" />Thêm hãng</Button>
      </div>
      {showAdd && (
        <Card className="mb-6"><CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[150px]"><label className="text-xs text-gray-500 mb-1 block">Danh mục</label>
              <select value={newCategoryId} onChange={(e) => setNewCategoryId(e.target.value)} className="w-full h-9 rounded-md border border-gray-300 px-3 text-sm">
                <option value="1">Apple</option>
                <option value="2">Android</option>
              </select>
            </div>
            <div className="flex-[2] min-w-[200px]"><label className="text-xs text-gray-500 mb-1 block">Tên hãng</label><Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="VD: Samsung" /></div>
            <Button onClick={handleAdd}>Thêm</Button>
            <Button variant="ghost" onClick={() => setShowAdd(false)}>Hủy</Button>
          </div>
        </CardContent></Card>
      )}
      <div className="space-y-6">
        {Object.entries(grouped).map(([catName, catBrands]) => (
          <Card key={catName}><CardHeader className="pb-2"><CardTitle className="text-base text-gray-700">{catName} <span className="text-gray-400 text-sm ml-2 font-normal">({catBrands.length})</span></CardTitle></CardHeader>
            <CardContent>
              <table className="admin-table"><thead><tr><th>Tên hãng</th><th>Số model</th><th>Trạng thái</th><th className="w-20 text-center">Xóa</th></tr></thead>
                <tbody>
                  {catBrands.map((b) => (
                    <tr key={b.id}>
                      <td>
                        {editingId === b.id ? (
                          <div className="flex items-center gap-1">
                            <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-8 text-sm" autoFocus onKeyDown={(e) => { if (e.key === "Enter") saveEdit(b.id); if (e.key === "Escape") setEditingId(null); }} />
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => saveEdit(b.id)}><Check size={14} className="text-green-600" /></Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingId(null)}><X size={14} className="text-red-600" /></Button>
                          </div>
                        ) : (<span className="cursor-pointer hover:text-primary-600" onClick={() => startEdit(b)}>{b.name}</span>)}
                      </td>
                      <td className="text-gray-500">{b._count || 0}</td>
                      <td><Badge variant={b.is_active ? "success" : "secondary"} className="text-[10px]">{b.is_active ? "Active" : "Ẩn"}</Badge></td>
                      <td className="text-center"><Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-red-600" onClick={() => handleDelete(b.id, b.name)}><Trash2 size={14} /></Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
