import { useState } from "react";
import PharmacySidebar from "../../components/PharmacySidebar";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Plus, Search, Edit, Trash2, Package, X } from "lucide-react";
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
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: t("outOfStock"), className: "bg-destructive/10 text-destructive" };
    if (stock < 20) return { label: t("lowStock"), className: "bg-warning/10 text-warning" };
    return { label: t("inStock"), className: "bg-success/10 text-success" };
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
