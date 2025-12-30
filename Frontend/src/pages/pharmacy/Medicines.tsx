import { useState } from "react";
import PharmacySidebar from "../../components/PharmacySidebar";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Plus, Search, Edit, Trash2, Package } from "lucide-react";
import { useToast } from "../../hooks/use-toast";

interface Medicine {
  id: string;
  name: string;
  category: string;
  stock: number;
  price: number;
  expiryDate: string;
}

const initialMedicines: Medicine[] = [
  { id: "1", name: "Paracetamol 500mg", category: "Pain Relief", stock: 500, price: 500, expiryDate: "2026-03-15" },
  { id: "2", name: "Amoxicillin 250mg", category: "Antibiotic", stock: 200, price: 1500, expiryDate: "2025-12-20" },
  { id: "3", name: "Ibuprofen 400mg", category: "Pain Relief", stock: 15, price: 800, expiryDate: "2026-01-10" },
  { id: "4", name: "Vitamin C 1000mg", category: "Vitamins", stock: 350, price: 2000, expiryDate: "2026-06-30" },
  { id: "5", name: "Metformin 500mg", category: "Diabetes", stock: 8, price: 3500, expiryDate: "2025-11-25" },
];

const PharmacyMedicines = () => {
  const [medicines, setMedicines] = useState<Medicine[]>(initialMedicines);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    stock: "",
    price: "",
    expiryDate: "",
  });

  const filteredMedicines = medicines.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingMedicine) {
      setMedicines(medicines.map(m => 
        m.id === editingMedicine.id 
          ? { ...m, ...formData, stock: parseInt(formData.stock), price: parseInt(formData.price) }
          : m
      ));
      toast({ title: "Medicine updated successfully" });
    } else {
      const newMedicine: Medicine = {
        id: Date.now().toString(),
        name: formData.name,
        category: formData.category,
        stock: parseInt(formData.stock),
        price: parseInt(formData.price),
        expiryDate: formData.expiryDate,
      };
      setMedicines([...medicines, newMedicine]);
      toast({ title: "Medicine added successfully" });
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
    });
    setIsAddOpen(true);
  };

  const handleDelete = (id: string) => {
    setMedicines(medicines.filter(m => m.id !== id));
    toast({ title: "Medicine deleted successfully" });
  };

  const resetForm = () => {
    setFormData({ name: "", category: "", stock: "", price: "", expiryDate: "" });
    setEditingMedicine(null);
    setIsAddOpen(false);
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: "Out of Stock", className: "bg-destructive/10 text-destructive" };
    if (stock < 20) return { label: "Low Stock", className: "bg-warning/10 text-warning" };
    return { label: "In Stock", className: "bg-success/10 text-success" };
  };

  return (
    <PharmacySidebar>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Medicines</h1>
            <p className="text-muted-foreground mt-1">Manage your pharmacy inventory</p>
          </div>
          
          <Dialog open={isAddOpen} onOpenChange={(open) => { setIsAddOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button variant="hero">
                <Plus className="w-4 h-4" />
                Add Medicine
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingMedicine ? "Edit Medicine" : "Add New Medicine"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Medicine Name</Label>
                  <Input 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Paracetamol 500mg"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input 
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Pain Relief"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Stock Quantity</Label>
                    <Input 
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      placeholder="0"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Price (RWF)</Label>
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
                  <Label>Expiry Date</Label>
                  <Input 
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    required
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" className="flex-1" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="hero" className="flex-1">
                    {editingMedicine ? "Update" : "Add Medicine"}
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
            placeholder="Search medicines..."
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
                  <p className="text-sm text-muted-foreground mb-4">{medicine.category}</p>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                    <div>
                      <span className="text-muted-foreground">Stock:</span>
                      <span className="ml-1 font-medium">{medicine.stock}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Price:</span>
                      <span className="ml-1 font-medium">{medicine.price.toLocaleString()} RWF</span>
                    </div>
                  </div>

                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(medicine)}>
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
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
            <p className="text-muted-foreground">No medicines found</p>
          </div>
        )}
      </div>
    </PharmacySidebar>
  );
};

export default PharmacyMedicines;
