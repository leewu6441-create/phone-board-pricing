"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { Plus, Trash2, Loader2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { generateSlug } from "@/lib/utils";

interface ModelData {
  id: number;
  name: string;
  model_code: string | null;
  brand_id: number;
  brand_name: string;
  category_name: string;
  category_id?: number;
  is_active: boolean;
}

interface BrandData {
  id: number;
  name: string;
  category_id: number;
  category_name: string;
}

export default function AdminModelsPage() {
  const [models, setModels] = useState<ModelData[]>([]);
  const [brands, setBrands] = useState<BrandData[]>([]);
  const [loading, setLoading] = useState(true);

  // Add form
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newBrandId, setNewBrandId] = useState("");

  // Edit
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  const supabase = createClient();

  const fetchData = useCallback(async () => {
    setLoading(true);

    // Fetch brands
    const { data: brandData } = await supabase
      .from("brands")
      .select(
        `id, name, category_id, categories!inner(name)`
      )
      .order("sort_order");
    if (brandData) {
      setBrands(
        brandData.map((b: any) => ({
          id: b.id,
          name: b.name,
          category_id: b.category_id,
          category_name: b.categories?.name || "",
        }))
      );
    }

    // Fetch models
    const { data: modelData } = await supabase
      .from("device_models")
      .select(
        `*, brands!inner(id, name, categories!inner(id, name))`
      )
      .order("sort_order")
      .order("name");
    if (modelData) {
      setModels(
        modelData.map((m: any) => ({
          id: m.id,
          name: m.name,
          model_code: m.model_code,
          brand_id: m.brand_id,
          brand_name: m.brands?.name || "",
          category_name: m.brands?.categories?.name || "",
          category_id: m.brands?.categories?.id,
          is_active: m.is_active,
        }))
      );
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAdd = async () => {
    if (!newName.trim() || !newBrandId) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    const { error } = await supabase.from("device_models").insert({
      name: newName.trim(),
      model_code: newCode.trim() || null,
      brand_id: parseInt(newBrandId),
      slug: generateSlug(newName),
    });

    if (error) {
      toast.error("Lỗi khi thêm: " + error.message);
    } else {
      toast.success("Đã thêm model mới");
      setNewName("");
      setNewCode("");
      setNewBrandId("");
      setShowAdd(false);
      fetchData();
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Xóa model "${name}"? Thao tác này sẽ xóa tất cả giá liên quan.`))
      return;

    const { error } = await supabase
      .from("device_models")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Lỗi khi xóa: " + error.message);
    } else {
      toast.success("Đã xóa");
      fetchData();
    }
  };

  const startEdit = (model: ModelData) => {
    setEditingId(model.id);
    setEditName(model.name);
  };

  const saveEdit = async (id: number) => {
    if (!editName.trim()) return;

    const { error } = await supabase
      .from("device_models")
      .update({
        name: editName.trim(),
        slug: generateSlug(editName),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      toast.error("Lỗi khi sửa");
    } else {
      toast.success("Đã cập nhật");
      fetchData();
    }

    setEditingId(null);
  };

  // Group by brand
  const grouped: Record<string, ModelData[]> = {};
  models.forEach((m) => {
    const key = `${m.brand_name} (${m.category_name})`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(m);
  });

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
        <h1 className="text-xl font-bold text-gray-900">Quản lý model</h1>
        <Button onClick={() => setShowAdd(!showAdd)}>
          <Plus size={16} className="mr-2" />
          Thêm model
        </Button>
      </div>

      {/* Add Form */}
      {showAdd && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[150px]">
                <label className="text-xs text-gray-500 mb-1 block">Hãng</label>
                <select
                  value={newBrandId}
                  onChange={(e) => setNewBrandId(e.target.value)}
                  className="w-full h-9 rounded-md border border-gray-300 px-3 text-sm"
                >
                  <option value="">Chọn hãng...</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.category_name})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-[2] min-w-[200px]">
                <label className="text-xs text-gray-500 mb-1 block">Tên model</label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="VD: iPhone 16 Pro Max"
                />
              </div>
              <div className="flex-1 min-w-[120px]">
                <label className="text-xs text-gray-500 mb-1 block">Mã code (tùy chọn)</label>
                <Input
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="VD: A3296"
                />
              </div>
              <Button onClick={handleAdd}>Thêm</Button>
              <Button variant="ghost" onClick={() => setShowAdd(false)}>
                Hủy
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Model List */}
      <div className="space-y-6">
        {Object.entries(grouped).map(([groupKey, groupModels]) => (
          <Card key={groupKey}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-gray-700">
                {groupKey}
                <span className="text-gray-400 text-sm ml-2 font-normal">
                  ({groupModels.length} model)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Tên model</th>
                    <th>Mã code</th>
                    <th>Trạng thái</th>
                    <th className="w-20 text-center">Xóa</th>
                  </tr>
                </thead>
                <tbody>
                  {groupModels.map((model) => (
                    <tr key={model.id}>
                      <td>
                        {editingId === model.id ? (
                          <div className="flex items-center gap-1">
                            <Input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="h-8 text-sm"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveEdit(model.id);
                                if (e.key === "Escape") setEditingId(null);
                              }}
                            />
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 shrink-0"
                              onClick={() => saveEdit(model.id)}
                            >
                              <Check size={14} className="text-green-600" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 shrink-0"
                              onClick={() => setEditingId(null)}
                            >
                              <X size={14} className="text-red-600" />
                            </Button>
                          </div>
                        ) : (
                          <span
                            className="cursor-pointer hover:text-primary-600"
                            onClick={() => startEdit(model)}
                            title="Click để sửa"
                          >
                            {model.name}
                          </span>
                        )}
                      </td>
                      <td className="text-gray-500 text-xs">
                        {model.model_code || "-"}
                      </td>
                      <td>
                        <Badge
                          variant={
                            model.is_active ? "success" : "secondary"
                          }
                          className="text-[10px]"
                        >
                          {model.is_active ? "Active" : "Ẩn"}
                        </Badge>
                      </td>
                      <td className="text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-gray-400 hover:text-red-600"
                          onClick={() =>
                            handleDelete(model.id, model.name)
                          }
                        >
                          <Trash2 size={14} />
                        </Button>
                      </td>
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
