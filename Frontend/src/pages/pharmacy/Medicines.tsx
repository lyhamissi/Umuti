import { useState, useRef } from "react";
import PharmacySidebar from "../../components/PharmacySidebar";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Plus, Search, Edit, Trash2, Package, X, Upload, FileText, Loader2 } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { useLanguage } from "../../components/LanguageSwitcher";

interface SimilarMedicine {
  name: string;
  price: number;
}

interface Medicine {
  id: string;
  name: string;
  category: string;
  stock: number;
  price: number;
  expiryDate: string;
  strength: string;
  similarMedicines: SimilarMedicine[];
}

const initialMedicines: Medicine[] = [
  { id: "1", name: "Paracetamol 500mg", category: "Pain Relief", stock: 500, price: 500, expiryDate: "2026-03-15", strength: "500mg - Mild", similarMedicines: [{ name: "Acetaminophen 500mg", price: 450 }] },
  { id: "2", name: "Amoxicillin 250mg", category: "Antibiotic", stock: 200, price: 1500, expiryDate: "2025-12-20", strength: "250mg - Standard", similarMedicines: [] },
  { id: "3", name: "Ibuprofen 400mg", category: "Pain Relief", stock: 15, price: 800, expiryDate: "2026-01-10", strength: "400mg - Strong", similarMedicines: [{ name: "Advil 400mg", price: 850 }] },
  { id: "4", name: "Vitamin C 1000mg", category: "Vitamins", stock: 350, price: 2000, expiryDate: "2026-06-30", strength: "1000mg - High Dose", similarMedicines: [] },
  { id: "5", name: "Metformin 500mg", category: "Diabetes", stock: 8, price: 3500, expiryDate: "2025-11-25", strength: "500mg - Standard", similarMedicines: [{ name: "Glucophage 500mg", price: 3800 }] },
];

const PharmacyMedicines = () => {
  const [medicines, setMedicines] = useState<Medicine[]>(initialMedicines);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [addMode, setAddMode] = useState<"manual" | "document">("manual");
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    stock: "",
    price: "",
    expiryDate: "",
    strength: "",
  });

  const [similarMedicines, setSimilarMedicines] = useState<SimilarMedicine[]>([]);
  const [newSimilar, setNewSimilar] = useState({ name: "", price: "" });

  const filteredMedicines = medicines.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddSimilar = () => {
    if (newSimilar.name && newSimilar.price) {
      setSimilarMedicines([...similarMedicines, { name: newSimilar.name, price: parseInt(newSimilar.price) }]);
      setNewSimilar({ name: "", price: "" });
    }
  };

  const handleRemoveSimilar = (index: number) => {
    setSimilarMedicines(similarMedicines.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingMedicine) {
      setMedicines(medicines.map(m => 
        m.id === editingMedicine.id 
          ? { 
              ...m, 
              ...formData, 
              stock: parseInt(formData.stock), 
              price: parseInt(formData.price),
              similarMedicines 
            }
          : m
      ));
      toast({ title: t("medicineUpdated") });
    } else {
      const newMedicine: Medicine = {
        id: Date.now().toString(),
        name: formData.name,
        category: formData.category,
        stock: parseInt(formData.stock),
        price: parseInt(formData.price),
        expiryDate: formData.expiryDate,
        strength: formData.strength,
        similarMedicines,
      };
      setMedicines([...medicines, newMedicine]);
      toast({ title: t("medicineAdded") });
    }

    resetForm();
  };

  const handleEdit = (medicine: Medicine) => {
    setEditingMedicine(medicine);
    setFormData({
      name: medicine.name,
      category: medicine.category,
      stock: medicine.stock.toString(),
      price: medicine.price.toString(),
      expiryDate: medicine.expiryDate,
      strength: medicine.strength,
    });
    setSimilarMedicines(medicine.similarMedicines || []);
    setAddMode("manual");
    setIsAddOpen(true);
  };

  const handleDelete = (id: string) => {
    setMedicines(medicines.filter(m => m.id !== id));
    toast({ title: t("medicineDeleted") });
  };

  const resetForm = () => {
    setFormData({ name: "", category: "", stock: "", price: "", expiryDate: "", strength: "" });
    setSimilarMedicines([]);
    setNewSimilar({ name: "", price: "" });
    setEditingMedicine(null);
    setIsAddOpen(false);
    setAddMode("manual");
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: t("outOfStock"), className: "bg-destructive/10 text-destructive" };
    if (stock < 20) return { label: t("lowStock"), className: "bg-warning/10 text-warning" };
    return { label: t("inStock"), className: "bg-success/10 text-success" };
  };

  const parseCSV = (content: string): Medicine[] => {
    const lines = content.trim().split("\n");
    const parsedMedicines: Medicine[] = [];
    
    // Skip header row if exists
    const startIndex = lines[0].toLowerCase().includes("name") ? 1 : 0;
    
    for (let i = startIndex; i < lines.length; i++) {
      const values = lines[i].split(",").map(v => v.trim().replace(/"/g, ""));
      if (values.length >= 4) {
        parsedMedicines.push({
          id: Date.now().toString() + i,
          name: values[0] || "",
          category: values[1] || "",
          stock: parseInt(values[2]) || 0,
          price: parseInt(values[3]) || 0,
          expiryDate: values[4] || new Date().toISOString().split("T")[0],
          strength: values[5] || "",
          similarMedicines: [],
        });
      }
    }
    return parsedMedicines;
  };

  const parseTXT = (content: string): Medicine[] => {
    const lines = content.trim().split("\n");
    const parsedMedicines: Medicine[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Try to parse as: Name | Category | Stock | Price | Expiry | Strength
      const parts = line.split(/[|,\t]/).map(p => p.trim());
      if (parts.length >= 4) {
        parsedMedicines.push({
          id: Date.now().toString() + i,
          name: parts[0] || "",
          category: parts[1] || "",
          stock: parseInt(parts[2]) || 0,
          price: parseInt(parts[3]) || 0,
          expiryDate: parts[4] || new Date().toISOString().split("T")[0],
          strength: parts[5] || "",
          similarMedicines: [],
        });
      }
    }
    return parsedMedicines;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);

    try {
      const content = await file.text();
      let parsedMedicines: Medicine[] = [];

      if (file.name.endsWith(".csv")) {
        parsedMedicines = parseCSV(content);
      } else if (file.name.endsWith(".txt")) {
        parsedMedicines = parseTXT(content);
      } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        // For Excel files, we'd need a library like xlsx
        // For now, show a message about supported formats
        toast({
          title: t("importError"),
          description: "Excel files require additional setup. Please use CSV or TXT format.",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      if (parsedMedicines.length > 0) {
        setMedicines([...medicines, ...parsedMedicines]);
        toast({
          title: `${parsedMedicines.length} ${t("medicinesImported")}`,
        });
        resetForm();
      } else {
        toast({
          title: t("importError"),
          description: "No valid medicines found in the file. Please check the format.",
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
          
          <Dialog open={isAddOpen} onOpenChange={(open) => { setIsAddOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button variant="hero">
                <Plus className="w-4 h-4" />
                {t("addMedicine")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingMedicine ? t("editMedicine") : t("addNewMedicine")}</DialogTitle>
              </DialogHeader>

              {!editingMedicine && (
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

              {addMode === "document" && !editingMedicine ? (
                <div className="space-y-6 py-4">
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,.txt,.xlsx,.xls"
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
                      Name, Category, Stock, Price, ExpiryDate, Strength<br />
                      Paracetamol 500mg, Pain Relief, 100, 500, 2026-12-31, 500mg - Mild<br />
                      Amoxicillin 250mg, Antibiotic, 50, 1500, 2025-06-30, 250mg - Standard
                    </code>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t("medicineName")}</Label>
                    <Input 
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder={t("medicineNamePlaceholder")}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t("category")}</Label>
                      <Input 
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        placeholder={t("categoryPlaceholder")}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("strength")}</Label>
                      <Input 
                        value={formData.strength}
                        onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                        placeholder={t("strengthPlaceholder")}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t("stockQuantity")}</Label>
                      <Input 
                        type="number"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                        placeholder="0"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("price")}</Label>
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
                      required
                    />
                  </div>

                  {/* Similar Medicines Section */}
                  <div className="space-y-3 pt-4 border-t">
                    <Label className="text-base font-semibold">{t("similarMedicines")}</Label>
                    
                    {/* Add new similar medicine */}
                    <div className="flex gap-2">
                      <Input 
                        value={newSimilar.name}
                        onChange={(e) => setNewSimilar({ ...newSimilar, name: e.target.value })}
                        placeholder={t("similarMedicineName")}
                        className="flex-1"
                      />
                      <Input 
                        type="number"
                        value={newSimilar.price}
                        onChange={(e) => setNewSimilar({ ...newSimilar, price: e.target.value })}
                        placeholder={t("similarMedicinePrice")}
                        className="w-32"
                      />
                      <Button type="button" variant="outline" onClick={handleAddSimilar}>
                        {t("addSimilar")}
                      </Button>
                    </div>

                    {/* List of similar medicines */}
                    {similarMedicines.length > 0 && (
                      <div className="space-y-2">
                        {similarMedicines.map((similar, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                            <div>
                              <span className="font-medium">{similar.name}</span>
                              <span className="text-muted-foreground ml-2">- {similar.price.toLocaleString()} RWF</span>
                            </div>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleRemoveSimilar(index)}
                              className="text-destructive hover:text-destructive"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="button" variant="outline" className="flex-1" onClick={resetForm}>
                      {t("cancel")}
                    </Button>
                    <Button type="submit" variant="hero" className="flex-1">
                      {editingMedicine ? t("update") : t("addMedicine")}
                    </Button>
                  </div>
                </form>
              )}
            </DialogContent>
          </Dialog>
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

        {/* Medicines Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMedicines.map((medicine) => {
            const status = getStockStatus(medicine.stock);
            return (
              <Card key={medicine.id} className="group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-xl bg-secondary">
                      <Package className="w-5 h-5 text-primary" />
                    </div>
                    <Badge className={status.className}>{status.label}</Badge>
                  </div>
                  
                  <h3 className="font-semibold text-lg mb-1">{medicine.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{medicine.category}</p>
                  {medicine.strength && (
                    <p className="text-xs text-primary font-medium mb-3">{medicine.strength}</p>
                  )}
                  
                  <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                    <div>
                      <span className="text-muted-foreground">{t("stock")}:</span>
                      <span className="ml-1 font-medium">{medicine.stock}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t("price")}:</span>
                      <span className="ml-1 font-medium">{medicine.price.toLocaleString()} RWF</span>
                    </div>
                  </div>

                  {medicine.similarMedicines && medicine.similarMedicines.length > 0 && (
                    <div className="mb-4 p-2 bg-secondary/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">{t("similarMedicines")}:</p>
                      {medicine.similarMedicines.map((similar, idx) => (
                        <p key={idx} className="text-xs">{similar.name} - {similar.price.toLocaleString()} RWF</p>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(medicine)}>
                      <Edit className="w-4 h-4 mr-1" />
                      {t("edit")}
                    </Button>
                    <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(medicine.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredMedicines.length === 0 && (
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