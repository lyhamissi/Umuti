import { useState, useRef, useEffect } from "react";
import PharmacySidebar from "../../components/PharmacySidebar";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Plus, Search, Edit, Trash2, Package, Upload, FileText, Loader2, RefreshCw } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { useLanguage } from "../../components/LanguageSwitcher";
import { medicineApi, type PharmacyMedicine, type Medicine } from "../../lib/api";

interface InventoryItem extends PharmacyMedicine {
  medicine: Medicine;
}

const PharmacyMedicines = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [allMedicines, setAllMedicines] = useState<Medicine[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [addMode, setAddMode] = useState<"manual" | "document">("manual");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMedicineId, setSelectedMedicineId] = useState("");
  const [medicineSearch, setMedicineSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    quantity: "",
    price: "",
    expiryDate: "",
  });

  const fetchInventory = async () => {
    try {
      setIsLoading(true);
      const response = await medicineApi.getMyInventory();
      if (response.data) {
        setInventory(response.data as InventoryItem[]);
      }
    } catch (err) {
      const error = err as Error;
      toast({
        title: "Error",
        description: error.message || "Failed to fetch inventory",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllMedicines = async () => {
    try {
      const response = await medicineApi.getAll({ limit: 100 });
      if (response.data) {
        setAllMedicines((response.data as unknown as { medicines?: Medicine[] })?.medicines || response.data as unknown as Medicine[]);
      }
    } catch (err) {
      console.error("Failed to fetch medicines:", err);
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchAllMedicines();
  }, []);

  const filteredInventory = inventory.filter(item =>
    item.medicine?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.medicine?.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMedicines = allMedicines.filter(m =>
    m.name.toLowerCase().includes(medicineSearch.toLowerCase()) ||
    m.genericName?.toLowerCase().includes(medicineSearch.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      if (editingItem) {
        // Update existing inventory item
        await medicineApi.updateInventoryItem(editingItem.id, {
          quantity: parseInt(formData.quantity),
          price: parseInt(formData.price),
          expiryDate: formData.expiryDate || undefined,
        });
        toast({ title: t("medicineUpdated") });
      } else {
        // Add new item to inventory
        if (!selectedMedicineId) {
          toast({
            title: "Select Medicine",
            description: "Please select a medicine to add",
            variant: "destructive",
          });
          setIsProcessing(false);
          return;
        }
        await medicineApi.addToInventory({
          medicineId: selectedMedicineId,
          quantity: parseInt(formData.quantity),
          price: parseInt(formData.price),
          expiryDate: formData.expiryDate || undefined,
        });
        toast({ title: t("medicineAdded") });
      }
      resetForm();
      fetchInventory();
    } catch (err) {
      const error = err as Error;
      toast({
        title: "Error",
        description: error.message || "Failed to save",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      quantity: item.quantity.toString(),
      price: item.price.toString(),
      expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().split("T")[0] : "",
    });
    setAddMode("manual");
    setIsAddOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await medicineApi.deleteInventoryItem(id);
      toast({ title: t("medicineDeleted") });
      fetchInventory();
    } catch (err) {
      const error = err as Error;
      toast({
        title: "Error",
        description: error.message || "Failed to delete",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({ quantity: "", price: "", expiryDate: "" });
    setEditingItem(null);
    setSelectedMedicineId("");
    setMedicineSearch("");
    setIsAddOpen(false);
    setAddMode("manual");
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: t("outOfStock"), className: "bg-destructive/10 text-destructive" };
    if (stock < 20) return { label: t("lowStock"), className: "bg-warning/10 text-warning" };
    return { label: t("inStock"), className: "bg-success/10 text-success" };
  };

  const parseCSV = (content: string) => {
    const lines = content.trim().split("\n");
    const items: { name: string; quantity: number; price: number; expiryDate?: string }[] = [];

    const startIndex = lines[0].toLowerCase().includes("name") ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const values = lines[i].split(",").map(v => v.trim().replace(/"/g, ""));
      if (values.length >= 3) {
        items.push({
          name: values[0] || "",
          quantity: parseInt(values[1]) || 0,
          price: parseInt(values[2]) || 0,
          expiryDate: values[3] || undefined,
        });
      }
    }
    return items;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);

    try {
      const content = await file.text();
      const items = parseCSV(content);

      if (items.length === 0) {
        toast({
          title: t("importError"),
          description: "No valid items found in the file.",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      // For each item, find matching medicine and add to inventory
      let addedCount = 0;
      for (const item of items) {
        const matchingMedicine = allMedicines.find(m =>
          m.name.toLowerCase().includes(item.name.toLowerCase())
        );

        if (matchingMedicine) {
          try {
            await medicineApi.addToInventory({
              medicineId: matchingMedicine.id,
              quantity: item.quantity,
              price: item.price,
              expiryDate: item.expiryDate,
            });
            addedCount++;
          } catch (err) {
            console.error(`Failed to add ${item.name}:`, err);
          }
        }
      }

      if (addedCount > 0) {
        toast({
          title: `${addedCount} ${t("medicinesImported")}`,
        });
        fetchInventory();
        resetForm();
      } else {
        toast({
          title: t("importError"),
          description: "Could not match any medicines. Make sure medicine names exist in the system.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: t("importError"),
        description: "Could not read the file. Please try again.",
        variant: "destructive",
      });
    }

    setIsProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <PharmacySidebar>
      <div className="space-y-6">
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

            <Dialog open={isAddOpen} onOpenChange={(open) => { setIsAddOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button variant="hero">
                  <Plus className="w-4 h-4" />
                  {t("addMedicine")}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingItem ? t("editMedicine") : t("addNewMedicine")}</DialogTitle>
                </DialogHeader>

                {!editingItem && (
                  <Tabs value={addMode} onValueChange={(v) => setAddMode(v as "manual" | "document")} className="mb-4">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="manual">
                        <Edit className="w-4 h-4 mr-2" />
                        {t("addManually")}
                      </TabsTrigger>
                      <TabsTrigger value="document">
                        <Upload className="w-4 h-4 mr-2" />
                        {t("addFromDocument")}
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                )}

                {addMode === "document" && !editingItem ? (
                  <div className="space-y-6 py-4">
                    <div className="border-2 border-dashed rounded-lg p-8 text-center">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,.txt"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />

                      {isProcessing ? (
                        <div className="space-y-4">
                          <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin" />
                          <p className="text-muted-foreground">{t("processingDocument")}</p>
                        </div>
                      ) : (
                        <>
                          <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                          <h3 className="text-lg font-semibold mb-2">{t("uploadDocument")}</h3>
                          <p className="text-sm text-muted-foreground mb-4">{t("uploadDocumentDesc")}</p>
                          <Button
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            {t("selectFile")}
                          </Button>
                          <p className="text-xs text-muted-foreground mt-4">{t("supportedFormats")}</p>
                        </>
                      )}
                    </div>

                    <div className="bg-secondary/50 rounded-lg p-4">
                      <h4 className="font-medium mb-2">Expected Format (CSV/TXT):</h4>
                      <code className="text-xs text-muted-foreground block">
                        Name, Quantity, Price, ExpiryDate<br />
                        Paracetamol 500mg, 100, 500, 2026-12-31<br />
                        Amoxicillin 250mg, 50, 1500, 2025-06-30
                      </code>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {!editingItem && (
                      <div className="space-y-2">
                        <Label>{t("medicineName")}</Label>
                        <Input
                          placeholder="Search medicines..."
                          value={medicineSearch}
                          onChange={(e) => setMedicineSearch(e.target.value)}
                        />
                        {medicineSearch && filteredMedicines.length > 0 && (
                          <div className="max-h-40 overflow-y-auto border rounded-lg">
                            {filteredMedicines.slice(0, 10).map((medicine) => (
                              <div
                                key={medicine.id}
                                className={`p-2 cursor-pointer hover:bg-secondary ${selectedMedicineId === medicine.id ? "bg-primary/10" : ""}`}
                                onClick={() => {
                                  setSelectedMedicineId(medicine.id);
                                  setMedicineSearch(medicine.name);
                                }}
                              >
                                <p className="font-medium">{medicine.name}</p>
                                <p className="text-xs text-muted-foreground">{medicine.category}</p>
                              </div>
                            ))}
                          </div>
                        )}
                        {selectedMedicineId && (
                          <p className="text-sm text-success">Selected: {allMedicines.find(m => m.id === selectedMedicineId)?.name}</p>
                        )}
                      </div>
                    )}

                    {editingItem && (
                      <div className="p-3 bg-secondary rounded-lg">
                        <p className="font-medium">{editingItem.medicine?.name}</p>
                        <p className="text-sm text-muted-foreground">{editingItem.medicine?.category}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t("stockQuantity")}</Label>
                        <Input
                          type="number"
                          value={formData.quantity}
                          onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                          placeholder="0"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t("price")} (RWF)</Label>
                        <Input
                          type="number"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          placeholder="0"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("expiryDate")}</Label>
                      <Input
                        type="date"
                        value={formData.expiryDate}
                        onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button type="button" variant="outline" className="flex-1" onClick={resetForm}>
                        {t("cancel")}
                      </Button>
                      <Button type="submit" variant="hero" className="flex-1" disabled={isProcessing}>
                        {isProcessing ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : null}
                        {editingItem ? t("update") : t("addMedicine")}
                      </Button>
                    </div>
                  </form>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder={t("searchMedicines")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Loading State */}
        {isLoading ? (
          <Card>
            <CardContent className="py-12 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading inventory...</p>
            </CardContent>
          </Card>
        ) : inventory.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No medicines in your inventory yet</p>
              <p className="text-sm text-muted-foreground mt-1">Add medicines to start managing your stock</p>
            </CardContent>
          </Card>
        ) : (
          /* Medicines Grid */
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredInventory.map((item) => {
              const status = getStockStatus(item.quantity);
              return (
                <Card key={item.id} className="group">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-xl bg-secondary">
                        <Package className="w-5 h-5 text-primary" />
                      </div>
                      <Badge className={status.className}>{status.label}</Badge>
                    </div>

                    <h3 className="font-semibold text-lg mb-1">{item.medicine?.name || "Unknown Medicine"}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{item.medicine?.category || "Uncategorized"}</p>
                    {item.medicine?.strength && (
                      <p className="text-xs text-primary font-medium mb-3">{item.medicine.strength}</p>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                      <div>
                        <span className="text-muted-foreground">{t("stock")}:</span>
                        <span className="ml-1 font-medium">{item.quantity}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t("price")}:</span>
                        <span className="ml-1 font-medium">{item.price.toLocaleString()} RWF</span>
                      </div>
                    </div>

                    {item.expiryDate && (
                      <p className="text-xs text-muted-foreground mb-4">
                        Expires: {new Date(item.expiryDate).toLocaleDateString()}
                      </p>
                    )}

                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(item)}>
                        <Edit className="w-4 h-4 mr-1" />
                        {t("edit")}
                      </Button>
                      <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {!isLoading && filteredInventory.length === 0 && inventory.length > 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{t("noMedicinesFound")}</p>
          </div>
        )}
      </div>
    </PharmacySidebar>
  );
};

export default PharmacyMedicines;
