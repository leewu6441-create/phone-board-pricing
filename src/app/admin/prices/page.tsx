"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
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
    id: number;
    field: "variant" | "price_vnd";
    value: string;
  } | null>(null);

  // Filter state
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterModel, setFilterModel] = useState<string>("all");

  const supabase = createClient();

  const fetchData = useCallback(async () => {
    setLoading(true);

    // Fetch models
    const { data: modelData } = await supabase
      .from("device_models")
      .select(
        `
        id, name,
        brands!inner(
          name,
          categories!inner(slug)
        )
      `
      )
      .order("sort_order");
    if (modelData) {
      setModels(
        modelData.map((m: any) => ({
          id: m.id,
          name: m.name,
          brand_name: m.brands?.name || "",
          category_slug: m.brands?.categories?.slug || "",
        }))
      );
    }

    // Fetch prices
    const { data: priceData } = await supabase
      .from("price_entries")
      .select(
        `
        *,
        device_models!inner(
          name,
          brands!inner(
            name,
            categories!inner(slug)
          )
        )
      `
      )
      .order("device_model_id")
      .order("sort_order");

    if (priceData) {
      setPrices(
        priceData.map((p: any) => ({
          ...p,
          model_name: p.device_models?.name || "",
          brand_name: p.device_models?.brands?.name || "",
          category_slug: p.device_models?.brands?.categories?.slug || "",
        }))
      );
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter
  const filteredPrices = prices.filter((p) => {
    if (filterCategory !== "all" && p.category_slug !== filterCategory)
      return false;
    if (
      filterModel !== "all" &&
      p.device_model_id !== parseInt(filterModel)
    )
      return false;
    return true;
  });

  // Get unique model IDs in current filtered results for dropdown
  const availableModels = models.filter(
    (m) => filterCategory === "all" || m.category_slug === filterCategory
  );

  // Inline cell editing
  const startEdit = (id: number, field: "variant" | "price_vnd", value: string) => {
    setEditingCell({ id, field, value });
  };

  const saveEdit = async () => {
    if (!editingCell) return;

    const updates: any = {};
    if (editingCell.field === "variant") {
      updates.variant = editingCell.value;
    } else {
      const numValue = parseInt(editingCell.value.replace(/\D/g, ""));
      if (isNaN(numValue) || numValue <= 0) {
        toast.error("Giá không hợp lệ");
        setEditingCell(null);
        return;
      }
      updates.price_vnd = numValue;
      updates.updated_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("price_entries")
      .update(updates)
      .eq("id", editingCell.id);

    if (error) {
      toast.error("Lỗi khi lưu");
    } else {
      toast.success("Đã lưu");
      setPrices((prev) =>
        prev.map((p) =>
          p.id === editingCell.id ? { ...p, ...updates } : p
        )
      );
    }

    setEditingCell(null);
  };

  const handleDelete = async (id: number, modelName: string) => {
    if (!confirm(`Xóa "${modelName}"? Hành động này không thể hoàn tác.`)) return;

    const { error } = await supabase
      .from("price_entries")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Lỗi khi xóa");
    } else {
      toast.success("Đã xóa");
      setPrices((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleAdd = async () => {
    if (filterModel === "all") {
      toast.error("Vui lòng chọn một model trước");
      return;
    }

    const { data, error } = await supabase
      .from("price_entries")
      .insert({
        device_model_id: parseInt(filterModel),
        variant: "Phiên bản mới",
        price_vnd: 0,
      })
      .select()
      .single();

    if (error) {
      toast.error("Lỗi khi thêm");
    } else {
      toast.success("Đã thêm dòng mới");
      fetchData();
    }
  };

  const saveAll = async () => {
    setSaving(true);
    let success = 0;
    let fail = 0;

    for (const price of filteredPrices) {
      const { error } = await supabase
        .from("price_entries")
        .update({
          variant: price.variant,
          price_vnd: price.price_vnd,
          updated_at: new Date().toISOString(),
        })
        .eq("id", price.id);

      if (error) fail++;
      else success++;
    }

    setSaving(false);
    if (fail === 0) {
      toast.success(`Đã lưu ${success} mục`);
    } else {
      toast.warning(`Đã lưu ${success}, lỗi ${fail} mục`);
    }
  };

  // Group prices by model
  const grouped: Record<number, PriceData[]> = {};
  filteredPrices.forEach((p) => {
    if (!grouped[p.device_model_id]) grouped[p.device_model_id] = [];
    grouped[p.device_model_id].push(p);
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
        <h1 className="text-xl font-bold text-gray-900">Quản lý bảng giá</h1>
        <Button onClick={saveAll} disabled={saving}>
          {saving ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              Đang lưu...
            </>
          ) : (
            <>
              <Save size={16} className="mr-2" />
              Lưu tất cả
            </>
          )}
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[150px]">
            <label className="text-xs text-gray-500 mb-1 block">
              Danh mục
            </label>
            <select
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setFilterModel("all");
              }}
              className="w-full h-9 rounded-md border border-gray-300 px-3 text-sm"
            >
              <option value="all">Tất cả</option>
              <option value="apple">🍎 Apple</option>
              <option value="android">🤖 Android</option>
            </select>
          </div>
          <div className="flex-[2] min-w-[200px]">
            <label className="text-xs text-gray-500 mb-1 block">Model</label>
            <select
              value={filterModel}
              onChange={(e) => setFilterModel(e.target.value)}
              className="w-full h-9 rounded-md border border-gray-300 px-3 text-sm"
            >
              <option value="all">Tất cả model</option>
              {availableModels.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.brand_name} - {m.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAdd}
              className="h-9"
            >
              <Plus size={16} className="mr-1" />
              Thêm dòng
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Price Table */}
      <div className="space-y-6">
        {Object.entries(grouped).map(([modelId, modelPrices]) => {
          const model = models.find((m) => m.id === parseInt(modelId));
          return (
            <Card key={modelId}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {model?.brand_name || ""}
                  </Badge>
                  <Badge
                    variant={
                      model?.category_slug === "apple"
                        ? "default"
                        : "outline"
                    }
                  >
                    {model?.category_slug === "apple" ? "🍎" : "🤖"}
                  </Badge>
                  <CardTitle className="text-base">
                    {model?.name || `Model #${modelId}`}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th className="w-8">#</th>
                      <th>Phiên bản / Tình trạng</th>
                      <th className="w-48 text-right">Giá (VND)</th>
                      <th className="w-20 text-center">Xóa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modelPrices.map((price, idx) => (
                      <tr key={price.id}>
                        <td className="text-gray-400 text-xs">{idx + 1}</td>
                        <td>
                          {editingCell?.id === price.id &&
                          editingCell?.field === "variant" ? (
                            <div className="flex items-center gap-1">
                              <Input
                                value={editingCell.value}
                                onChange={(e) =>
                                  setEditingCell({
                                    ...editingCell,
                                    value: e.target.value,
                                  })
                                }
                                className="h-8 text-sm"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") saveEdit();
                                  if (e.key === "Escape")
                                    setEditingCell(null);
                                }}
                              />
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 shrink-0"
                                onClick={saveEdit}
                              >
                                <Check size={14} className="text-green-600" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 shrink-0"
                                onClick={() => setEditingCell(null)}
                              >
                                <X size={14} className="text-red-600" />
                              </Button>
                            </div>
                          ) : (
                            <span
                              className="cursor-pointer hover:text-primary-600 hover:underline"
                              onClick={() =>
                                startEdit(price.id, "variant", price.variant)
                              }
                              title="Click để sửa"
                            >
                              {price.variant}
                            </span>
                          )}
                        </td>
                        <td className="text-right">
                          {editingCell?.id === price.id &&
                          editingCell?.field === "price_vnd" ? (
                            <div className="flex items-center gap-1 justify-end">
                              <Input
                                value={editingCell.value}
                                onChange={(e) =>
                                  setEditingCell({
                                    ...editingCell,
                                    value: e.target.value,
                                  })
                                }
                                className="h-8 text-sm w-40 text-right"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") saveEdit();
                                  if (e.key === "Escape")
                                    setEditingCell(null);
                                }}
                              />
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 shrink-0"
                                onClick={saveEdit}
                              >
                                <Check size={14} className="text-green-600" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 shrink-0"
                                onClick={() => setEditingCell(null)}
                              >
                                <X size={14} className="text-red-600" />
                              </Button>
                            </div>
                          ) : (
                            <span
                              className="cursor-pointer font-semibold text-red-600 hover:underline"
                              onClick={() =>
                                startEdit(
                                  price.id,
                                  "price_vnd",
                                  price.price_vnd.toString()
                                )
                              }
                              title="Click để sửa giá"
                            >
                              {formatVnd(price.price_vnd)}
                            </span>
                          )}
                        </td>
                        <td className="text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-gray-400 hover:text-red-600"
                            onClick={() =>
                              handleDelete(price.id, price.variant)
                            }
                          >
                            <Trash2 size={14} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {modelPrices.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="text-center text-gray-400 py-6"
                        >
                          Không có dữ liệu
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          );
        })}

        {Object.keys(grouped).length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-gray-400">
              Chưa có dữ liệu. Vui lòng thêm model và giá.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
