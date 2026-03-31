import { useState, useRef, useEffect, useCallback } from "react";
import PharmacySidebar from "../../components/PharmacySidebar";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  Upload,
  Loader2,
  RefreshCw,
  Power,
  PowerOff,
  X,
  CheckCircle2,
  AlertCircle,
  Pill,
} from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { useLanguage } from "../../components/LanguageSwitcher";
import {
  medicineApi,
  type PharmacyMedicine,
  type Medicine,
} from "../../lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

interface InventoryItem extends PharmacyMedicine {
  medicine: Medicine;
}

interface SimilarEntry {
  name: string;
  quantity: string;
  price: string;
  expiryDate: string;
  category: string;
  selectedMedicine: Medicine | null;
  showSuggestions: boolean;
}

interface CsvRow {
  name: string;
  quantity: number;
  price: number;
  expiryDate?: string;
  category: string;
  matched?: Medicine;
  status: "matched" | "unmatched";
}

// ── helpers ──────────────────────────────────────────────────────────────────

function parseCSV(content: string, medicines: Medicine[]): CsvRow[] {
  const lines = content.trim().split(/\r?\n/);
  const startIndex = lines[0].toLowerCase().includes("name") ? 1 : 0;
  const rows: CsvRow[] = [];

  for (let i = startIndex; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""));
    if (values.length < 2 || !values[0]) continue;

    const name = values[0];
    const quantity = parseInt(values[1]) || 0;
    const price = parseFloat(values[2]) || 0;
    const expiryDate = values[3] || undefined;

    const matched = medicines.find(
      (m) =>
        m.name.toLowerCase() === name.toLowerCase() ||
        m.name.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(m.name.toLowerCase())
    );

    rows.push({ 
      name, 
      quantity, 
      price, 
      expiryDate, 
      matched, 
      category: matched?.category || "General",
      status: matched ? "matched" : "unmatched" 
    });
  }
  return rows;
}

function strengthColor(strength?: string) {
  if (!strength) return "bg-slate-100 text-slate-600";
  const s = strength.toLowerCase();
  if (s.includes("strong") || s.includes("high") || parseInt(s) >= 500)
    return "bg-red-100 text-red-700";
  if (s.includes("medium") || s.includes("mod") || (parseInt(s) >= 200 && parseInt(s) < 500))
    return "bg-orange-100 text-orange-700";
  if (s.includes("mild") || s.includes("low") || parseInt(s) < 200)
    return "bg-green-100 text-green-700";
  return "bg-blue-100 text-blue-700";
}

// ── component ─────────────────────────────────────────────────────────────────

const PharmacyMedicines = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [allMedicines, setAllMedicines] = useState<Medicine[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  // ── dialog state ──
  const [dialogMode, setDialogMode] = useState<"closed" | "add" | "edit">("closed");
  const [addTab, setAddTab] = useState<"manual" | "document">("manual");

  // ── manual add state ──
  const [medicineNameInput, setMedicineNameInput] = useState("");
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [formData, setFormData] = useState({ quantity: "", price: "", expiryDate: "", category: "" });
  const [similarEntries, setSimilarEntries] = useState<SimilarEntry[]>([]);

  // ── edit state ──
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [editForm, setEditForm] = useState({ quantity: "", price: "", expiryDate: "" });

  // ── document state ──
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [csvRows, setCsvRows] = useState<CsvRow[]>([]);
  const [csvParsed, setCsvParsed] = useState(false);

  // ── data fetching ──────────────────────────────────────────────────────────

  const fetchInventory = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await medicineApi.getMyInventory();
      if (response.data) setInventory(response.data as InventoryItem[]);
    } catch (err) {
      const error = err as Error;
      toast({ title: "Error", description: error.message || "Failed to load inventory", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const fetchAllMedicines = useCallback(async () => {
    try {
      const [medsRes, catsRes] = await Promise.all([
        medicineApi.getAll({ limit: 1000 }),
        medicineApi.getCategories()
      ]);
      if (medsRes.data) setAllMedicines(medsRes.data);
      if (catsRes.data) setCategories(catsRes.data as unknown as string[]);
    } catch (err) {
      console.error("Failed to fetch medicines or categories:", err);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
    fetchAllMedicines();
  }, [fetchInventory, fetchAllMedicines]);

  // ── filtering & matching ───────────────────────────────────────────────────

  const filteredInventory = inventory.filter(
    (item) =>
      item.medicine?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.medicine?.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.medicine?.strength?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSuggestions = (input: string) => {
    if (input.length < 2) return [];
    return allMedicines.filter((m) =>
      m.name.toLowerCase().includes(input.toLowerCase()) ||
      m.genericName?.toLowerCase().includes(input.toLowerCase())
    ).slice(0, 5);
  };

  const nameSuggestions = getSuggestions(medicineNameInput);

  // ── form helpers ──────────────────────────────────────────────────────────

  const resetAdd = () => {
    setMedicineNameInput("");
    setSelectedMedicine(null);
    setShowSuggestions(false);
    setFormData({ quantity: "", price: "", expiryDate: "", category: "" });
    setSimilarEntries([]);
    setCsvRows([]);
    setCsvParsed(false);
    setAddTab("manual");
  };

  const openAdd = () => { resetAdd(); setDialogMode("add"); };
  const openEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setEditForm({
      quantity: item.quantity.toString(),
      price: item.price.toString(),
      expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().split("T")[0] : "",
    });
    setDialogMode("edit");
  };
  const closeDialog = () => { setDialogMode("closed"); setEditingItem(null); resetAdd(); };

  const handleSelectMedicine = (m: Medicine) => {
    setSelectedMedicine(m);
    setMedicineNameInput(m.name);
    setShowSuggestions(false);
  };

  const addSimilarRow = () => {
    setSimilarEntries((prev) => [
      ...prev,
      { name: "", quantity: "", price: "", expiryDate: "", category: "", selectedMedicine: null, showSuggestions: false },
    ]);
  };

  const removeSimilar = (idx: number) =>
    setSimilarEntries((prev) => prev.filter((_, i) => i !== idx));

  const updateSimilar = (idx: number, field: keyof SimilarEntry, value: any) =>
    setSimilarEntries((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s))
    );

  const fuzzyMatch = (name: string): Medicine | null => {
    if (!name) return null;
    return allMedicines.find(m =>
      m.name.toLowerCase() === name.trim().toLowerCase()
    ) || allMedicines.find(m =>
      m.name.toLowerCase().includes(name.trim().toLowerCase())
    ) || null;
  };

  // ── actions ───────────────────────────────────────────────────────────────

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    let targetMedicine = selectedMedicine || fuzzyMatch(medicineNameInput);

    if (!targetMedicine && (!medicineNameInput.trim() || !formData.category.trim())) {
      toast({
        title: "Missing Information",
        description: "Please select a medicine from suggestions or provide a name and category for the new medicine.",
        variant: "destructive"
      });
      return;
    }

    // Prepare items for bulk add
    const itemsToCreate: any[] = [];
    
    // Add main medicine
    itemsToCreate.push({
      medicineId: targetMedicine?.id,
      name: !targetMedicine ? medicineNameInput : undefined,
      category: !targetMedicine ? formData.category : undefined,
      quantity: parseInt(formData.quantity) || 0,
      price: parseFloat(formData.price) || 0,
      expiryDate: formData.expiryDate || undefined,
    });

    // Add similar medicines
    for (const entry of similarEntries) {
      const match = entry.selectedMedicine || fuzzyMatch(entry.name);
      
      if (!match && (!entry.name.trim() || !entry.category.trim())) {
        toast({
          title: "Incomplete Similar Medicine",
          description: `Please provide a category for "${entry.name || 'Unnamed Similar'}".`,
          variant: "destructive"
        });
        return;
      }

      itemsToCreate.push({
        medicineId: match?.id,
        name: !match ? entry.name : undefined,
        category: !match ? entry.category : undefined,
        quantity: parseInt(entry.quantity) || 0,
        price: parseFloat(entry.price) || 0,
        expiryDate: entry.expiryDate || undefined,
      });
    }

    setIsProcessing(true);
    try {
      const response = await medicineApi.addToInventoryBulk(itemsToCreate);
      const createdItems = response.data?.data;

      // Link similarities if we have main and at least one similar
      if (createdItems && createdItems.length > 1) {
        const mainId = createdItems[0].medicineId;
        const otherIds = createdItems.slice(1).map((i: any) => i.medicineId);
        await medicineApi.createSimilarity(mainId, otherIds);
      }

      toast({ title: itemsToCreate.length > 1 ? "Medicines added and linked!" : "Medicine added!" });
      closeDialog();
      fetchInventory();
    } catch (err) {
      const error = err as Error;
      toast({ title: "Error", description: error.message || "Failed to add medicine", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setIsProcessing(true);
    try {
      await medicineApi.updateInventoryItem(editingItem.id, {
        quantity: parseInt(editForm.quantity),
        price: parseFloat(editForm.price),
        expiryDate: editForm.expiryDate || undefined,
      });
      toast({ title: "Inventory updated!" });
      closeDialog();
      fetchInventory();
    } catch (err) {
      const error = err as Error;
      toast({ title: "Error", description: error.message || "Failed to update", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleStock = async (item: InventoryItem) => {
    try {
      await medicineApi.updateInventoryItem(item.id, { inStock: !item.inStock });
      toast({ title: item.inStock ? "Marked as out of stock" : "Marked as in stock" });
      fetchInventory();
    } catch (err) {
      const error = err as Error;
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (item: InventoryItem) => {
    if (!confirm(`Remove ${item.medicine?.name} from inventory?`)) return;
    try {
      await medicineApi.deleteInventoryItem(item.id);
      toast({ title: "Medicine removed" });
      fetchInventory();
    } catch (err) {
      const error = err as Error;
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  // ── CSV document handling ─────────────────────────────────────────────────

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      const rows = parseCSV(content, allMedicines);
      setCsvRows(rows);
      setCsvParsed(true);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmitCSV = async () => {
    const validRows = csvRows.filter((r) => r.status === "matched" || (r.name && r.category));
    if (validRows.length === 0) {
      toast({ title: "No valid items", description: "None of the CSV rows are matched or have a category assigned.", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    try {
      const items = validRows.map((r) => ({
        medicineId: r.matched?.id,
        name: r.status === "unmatched" ? r.name : undefined,
        category: r.status === "unmatched" ? r.category : undefined,
        quantity: r.quantity,
        price: r.price,
        expiryDate: r.expiryDate,
      }));
      await medicineApi.addToInventoryBulk(items);
      toast({ title: `${validRows.length} medicine(s) imported!` });
      closeDialog();
      fetchInventory();
    } catch (err) {
      const error = err as Error;
      toast({ title: "Import failed", description: error.message, variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  // ── stock status badge ────────────────────────────────────────────────────

  const stockBadge = (item: InventoryItem) => {
    if (!item.inStock || item.quantity === 0)
      return { label: "Out of Stock", className: "bg-red-100 text-red-700 border-red-200" };
    if (item.quantity < 20)
      return { label: "Low Stock", className: "bg-amber-100 text-amber-700 border-amber-200" };
    return { label: "In Stock", className: "bg-emerald-100 text-emerald-700 border-emerald-200" };
  };

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <PharmacySidebar>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{t("medicines")}</h1>
            <p className="text-muted-foreground mt-1">{t("manageInventory")}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchInventory} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="hero" onClick={openAdd}>
              <Plus className="w-4 h-4 mr-1" />
              {t("addMedicine")}
            </Button>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search your inventory…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Loading */}
        {isLoading ? (
          <Card>
            <CardContent className="py-16 flex flex-col items-center justify-center">
              <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading your inventory…</p>
            </CardContent>
          </Card>
        ) : inventory.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Package className="w-14 h-14 mx-auto text-muted-foreground mb-4" />
              <p className="font-semibold text-lg">No medicines yet</p>
              <p className="text-sm text-muted-foreground mt-1 mb-4">Add medicines to start managing your stock</p>
              <Button variant="hero" onClick={openAdd}>
                <Plus className="w-4 h-4 mr-1" /> Add First Medicine
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredInventory.map((item) => {
              const sb = stockBadge(item);
              return (
                <Card key={item.id} className="group hover:shadow-md transition-shadow relative overflow-hidden">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Pill className="w-5 h-5 text-primary" />
                      </div>
                      <Badge className={`text-[10px] h-5 border ${sb.className}`}>{sb.label}</Badge>
                    </div>

                    <h3 className="font-bold text-lg leading-tight mb-1 truncate pr-2">
                      {item.medicine?.name}
                    </h3>

                    <div className="flex gap-2 items-center mb-3">
                      {item.medicine?.category && (
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                          {item.medicine.category}
                        </span>
                      )}
                      {item.medicine?.strength && (
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${strengthColor(item.medicine.strength)}`}>
                          {item.medicine.strength}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Quantity</span>
                        <span className="font-semibold">{item.quantity}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Price</span>
                        <span className="font-semibold">{item.price.toLocaleString()} RWF</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t">
                      <Button variant="ghost" size="sm" className="flex-1 h-8 text-xs" onClick={() => openEdit(item)}>
                        <Edit className="w-3 h-3 mr-1" /> Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`w-8 h-8 p-0 ${item.inStock ? "text-amber-500" : "text-emerald-500"}`}
                        onClick={() => handleToggleStock(item)}
                      >
                        {item.inStock ? <PowerOff className="w-3.5 h-3.5" /> : <Power className="w-3.5 h-3.5" />}
                      </Button>
                      <Button variant="ghost" size="sm" className="w-8 h-8 p-0 text-destructive" onClick={() => handleDelete(item)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── ADD DIALOG ──────────────────────────────────────────────────── */}
      <Dialog open={dialogMode === "add"} onOpenChange={(o) => { if (!o) closeDialog(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Medicine</DialogTitle>
          </DialogHeader>

          <div className="flex gap-2 p-1 bg-muted rounded-lg mb-4">
            <button
              className={`flex-1 py-1.5 text-xs font-bold rounded transition-all ${addTab === "manual" ? "bg-background shadow text-primary" : "text-muted-foreground"}`}
              onClick={() => setAddTab("manual")}
            >
              Manual
            </button>
            <button
              className={`flex-1 py-1.5 text-xs font-bold rounded transition-all ${addTab === "document" ? "bg-background shadow text-primary" : "text-muted-foreground"}`}
              onClick={() => setAddTab("document")}
            >
              Document
            </button>
          </div>

          {addTab === "manual" && (
            <form onSubmit={handleSubmitAdd} className="space-y-6">
              <div className="grid gap-4">
                <div className="space-y-2 relative">
                  <Label className="text-xs font-bold uppercase tracking-tight text-muted-foreground">Medicine Name</Label>
                  <Input
                    placeholder="Enter medicine name..."
                    value={medicineNameInput}
                    onChange={(e) => {
                      setMedicineNameInput(e.target.value);
                      setShowSuggestions(true);
                      if (selectedMedicine && e.target.value !== selectedMedicine.name) setSelectedMedicine(null);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                  />
                  {showSuggestions && nameSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 w-full bg-background border rounded-lg shadow-xl z-50 mt-1 max-h-48 overflow-auto">
                      {nameSuggestions.map((m) => (
                        <div
                          key={m.id}
                          className="px-4 py-2 hover:bg-muted cursor-pointer flex justify-between items-center"
                          onMouseDown={() => handleSelectMedicine(m)}
                        >
                          <div>
                            <p className="font-bold text-sm tracking-tight">{m.name}</p>
                            <p className="text-[10px] text-muted-foreground uppercase">{m.category}</p>
                          </div>
                          {m.strength && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${strengthColor(m.strength)}`}>
                              {m.strength}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {selectedMedicine && (
                    <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-primary/5 border border-primary/20 rounded-lg text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                      <span className="font-bold">{selectedMedicine.name}</span>
                      <span className="text-muted-foreground opacity-60">detected</span>
                    </div>
                  )}
                </div>

                <div className={`grid grid-cols-1 ${!selectedMedicine ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-4 pt-2`}>
                  {!selectedMedicine && (
                    <div className="space-y-2">
                       <Label className="text-xs font-bold uppercase tracking-tight text-primary">Category *</Label>
                       <Select 
                        value={formData.category} 
                        onValueChange={(val: string) => setFormData({ ...formData, category: val })}
                      >
                        <SelectTrigger className="h-10 bg-primary/5 border-primary/20">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent className="z-[100]">
                          {categories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                          <SelectItem value="General">General</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-tight text-muted-foreground">Quantity</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      className="h-10"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-tight text-muted-foreground">Price (RWF)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-tight text-muted-foreground">Expiry</Label>
                    <Input
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold uppercase tracking-widest">Similar Medicines</h4>
                    <span className="text-[10px] text-muted-foreground">(Optional)</span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    className="h-7 text-[10px] font-bold uppercase px-2 py-0"
                    onClick={addSimilarRow}
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add Similar
                  </Button>
                </div>

                <div className="space-y-4">
                  {similarEntries.length === 0 ? (
                    <div className="text-center py-6 border-2 border-dashed rounded-xl bg-muted/20">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">No similar medicines added</p>
                    </div>
                  ) : (
                    similarEntries.map((s, idx) => (
                      <div key={idx} className="p-4 bg-muted/30 rounded-2xl border border-muted-foreground/10 space-y-4 relative group">
                        <button
                          type="button"
                          onClick={() => removeSimilar(idx)}
                          className="absolute -top-2 -right-2 bg-background border rounded-full p-1 text-destructive shadow-sm hover:scale-110 transition-transform"
                        >
                          <X className="w-3 h-3" />
                        </button>

                        <div className="space-y-2 relative">
                          <Label className="text-[10px] font-bold uppercase text-muted-foreground">Similar Medicine Name</Label>
                          <Input
                            placeholder="Type to search..."
                            className="h-8 text-sm bg-background"
                            value={s.name}
                            onChange={(e) => {
                              updateSimilar(idx, "name", e.target.value);
                              updateSimilar(idx, "showSuggestions", true);
                              if (s.selectedMedicine && e.target.value !== s.selectedMedicine.name) {
                                updateSimilar(idx, "selectedMedicine", null);
                              }
                            }}
                            onFocus={() => updateSimilar(idx, "showSuggestions", true)}
                          />
                          {s.showSuggestions && getSuggestions(s.name).length > 0 && (
                            <div className="absolute top-full left-0 w-full bg-background border rounded-lg shadow-xl z-50 mt-1 max-h-40 overflow-auto">
                              {getSuggestions(s.name).map((m) => (
                                <div
                                  key={m.id}
                                  className="px-4 py-2 hover:bg-muted cursor-pointer flex justify-between items-center"
                                  onMouseDown={() => {
                                    updateSimilar(idx, "selectedMedicine", m);
                                    updateSimilar(idx, "name", m.name);
                                    updateSimilar(idx, "showSuggestions", false);
                                  }}
                                >
                                  <p className="font-bold text-xs">{m.name}</p>
                                  <span className="text-[9px] text-muted-foreground uppercase">{m.strength}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {s.selectedMedicine && (
                            <div className="flex items-center gap-1.5 mt-1">
                              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-primary/10 rounded-full w-fit border border-primary/20">
                                <CheckCircle2 className="w-2.5 h-2.5 text-primary" />
                                <span className="text-[9px] font-bold text-primary">{s.selectedMedicine.name}</span>
                              </div>
                              {s.selectedMedicine.strength && (
                                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase ${strengthColor(s.selectedMedicine.strength)}`}>
                                  {s.selectedMedicine.strength}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                          <div className="space-y-1">
                            <Label className="text-[9px] font-bold uppercase text-muted-foreground">Qty</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              className="h-8 text-xs bg-background"
                              value={s.quantity}
                              onChange={(e) => updateSimilar(idx, "quantity", e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[9px] font-bold uppercase text-muted-foreground">Price</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              className="h-8 text-xs bg-background"
                              value={s.price}
                              onChange={(e) => updateSimilar(idx, "price", e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[9px] font-bold uppercase text-muted-foreground">Expiry</Label>
                            <Input
                              type="date"
                              className="h-8 text-xs bg-background p-1"
                              value={s.expiryDate}
                              onChange={(e) => updateSimilar(idx, "expiryDate", e.target.value)}
                            />
                          </div>
                          {!s.selectedMedicine && (
                            <div className="space-y-1">
                              <Label className="text-[9px] font-bold uppercase text-primary">Category *</Label>
                              <Select 
                                value={s.category} 
                                onValueChange={(val: string) => updateSimilar(idx, "category", val)}
                              >
                                <SelectTrigger className="h-8 bg-primary/5 border-primary/20 text-[10px]">
                                  <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                  {categories.map(cat => (
                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                  ))}
                                  <SelectItem value="General">General</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1 font-bold text-xs uppercase" onClick={closeDialog}>Cancel</Button>
                <Button type="submit" variant="hero" className="flex-[2] font-bold text-xs uppercase tracking-widest" disabled={isProcessing}>
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Add"}
                </Button>
              </div>
            </form>
          )}

          {addTab === "document" && (
            <div className="space-y-6 py-4">
              {!csvParsed ? (
                <div
                  className="border-2 border-dashed rounded-2xl p-12 text-center hover:border-primary hover:bg-primary/5 transition-all cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                  <p className="font-bold text-sm">Upload Inventory Document</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">CSV or TXT files only</p>
                  <input ref={fileInputRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleFileChange} />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="max-h-60 overflow-auto border rounded-xl">
                    <table className="w-full text-xs">
                      <thead className="bg-muted sticky top-0">
                        <tr className="text-[10px] font-bold uppercase text-muted-foreground border-b">
                          <th className="px-3 py-2 text-left">File Name</th>
                          <th className="px-3 py-2 text-left">Matched System Name</th>
                          <th className="px-3 py-2 text-left">Category</th>
                          <th className="px-3 py-2 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {csvRows.map((r, i) => (
                          <tr key={i} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                            <td className="px-3 py-2 truncate max-w-[120px]">{r.name}</td>
                            <td className="px-3 py-2 font-bold min-w-[140px] truncate max-w-[140px]">
                              {r.matched?.name || <span className="text-destructive font-normal italic opacity-60">Not found</span>}
                            </td>
                            <td className="px-3 py-2">
                              {r.status === "unmatched" ? (
                                <Select 
                                  value={r.category} 
                                  onValueChange={(val: string) => {
                                    const newRows = [...csvRows];
                                    newRows[i].category = val;
                                    setCsvRows(newRows);
                                  }}
                                >
                                  <SelectTrigger className="h-7 text-[10px] bg-background border-primary/20">
                                    <SelectValue placeholder="Category" />
                                  </SelectTrigger>
                                  <SelectContent className="z-[110]">
                                    {categories.map(cat => (
                                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                    <SelectItem value="General">General</SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded truncate max-w-[100px] inline-block">
                                  {r.category}
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {r.status === "matched" ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mx-auto" />
                              ) : (
                                <AlertCircle className="w-3.5 h-3.5 text-destructive mx-auto" strokeWidth={3} />
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 font-bold text-xs uppercase" onClick={() => { setCsvRows([]); setCsvParsed(false); }}>Clear</Button>
                    <Button
                      className="flex-[2] font-bold text-xs uppercase tracking-widest"
                      onClick={handleSubmitCSV}
                      disabled={isProcessing || csvRows.length === 0}
                    >
                      {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : `Import ${csvRows.length} items`}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── EDIT DIALOG ─────────────────────────────────────────────────── */}
      <Dialog open={dialogMode === "edit"} onOpenChange={(o) => { if (!o) closeDialog(); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Update Inventory</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitEdit} className="space-y-5 py-2">
            <div className="p-3 bg-muted rounded-xl">
              <p className="font-bold text-sm mb-1">{editingItem?.medicine?.name}</p>
              <p className="text-[10px] uppercase text-muted-foreground">{editingItem?.medicine?.category}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Quantity</Label>
                <Input type="number" value={editForm.quantity} onChange={(e) => setEditForm({...editForm, quantity: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Price</Label>
                <Input type="number" value={editForm.price} onChange={(e) => setEditForm({...editForm, price: e.target.value})} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground">Expiry</Label>
              <Input type="date" value={editForm.expiryDate} onChange={(e) => setEditForm({...editForm, expiryDate: e.target.value})} />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1 font-bold text-xs uppercase" onClick={closeDialog}>Cancel</Button>
              <Button type="submit" variant="hero" className="flex-[2] font-bold text-xs uppercase tracking-widest" disabled={isProcessing}>
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </PharmacySidebar>
  );
};

export default PharmacyMedicines;
