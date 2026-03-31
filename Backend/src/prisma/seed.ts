import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@umuti.com" },
    update: {},
    create: {
      email: "admin@umuti.com",
      password: adminPassword,
      name: "UMUTI Admin",
      role: "ADMIN",
    },
  });
  console.log("✅ Admin user created:", admin.email);

  // Create pharmacy owner users
  const pharmacyPassword = await bcrypt.hash("pharmacy123", 12);

  const pharmacyOwners = await Promise.all([
    prisma.user.upsert({
      where: { email: "pharmacare@example.com" },
      update: {},
      create: {
        email: "pharmacare@example.com",
        password: pharmacyPassword,
        name: "Jean Pierre Habimana",
        phone: "+250 788 123 456",
        role: "PHARMACY",
      },
    }),
    prisma.user.upsert({
      where: { email: "healthfirst@example.com" },
      update: {},
      create: {
        email: "healthfirst@example.com",
        password: pharmacyPassword,
        name: "Marie Claire Uwimana",
        phone: "+250 788 234 567",
        role: "PHARMACY",
      },
    }),
    prisma.user.upsert({
      where: { email: "mediplus@example.com" },
      update: {},
      create: {
        email: "mediplus@example.com",
        password: pharmacyPassword,
        name: "Emmanuel Niyonzima",
        phone: "+250 788 345 678",
        role: "PHARMACY",
      },
    }),
    prisma.user.upsert({
      where: { email: "citypharmacy@example.com" },
      update: {},
      create: {
        email: "citypharmacy@example.com",
        password: pharmacyPassword,
        name: "Ange Uwimana",
        phone: "+250 788 456 789",
        role: "PHARMACY",
      },
    }),
  ]);
  console.log("✅ Pharmacy owners created:", pharmacyOwners.length);

  // Create medicines
  const medicines = await Promise.all([
    // Pain Relief
    prisma.medicine.upsert({
      where: { id: "med_paracetamol_500" },
      update: {},
      create: {
        id: "med_paracetamol_500",
        name: "Paracetamol 500mg",
        genericName: "Acetaminophen",
        category: "Pain Relief",
        dosageForm: "Tablet",
        strength: "500mg",
        manufacturer: "Various",
      },
    }),
    prisma.medicine.upsert({
      where: { id: "med_ibuprofen_400" },
      update: {},
      create: {
        id: "med_ibuprofen_400",
        name: "Ibuprofen 400mg",
        genericName: "Ibuprofen",
        category: "Pain Relief",
        dosageForm: "Tablet",
        strength: "400mg",
        manufacturer: "Various",
      },
    }),
    prisma.medicine.upsert({
      where: { id: "med_aspirin_300" },
      update: {},
      create: {
        id: "med_aspirin_300",
        name: "Aspirin 300mg",
        genericName: "Acetylsalicylic acid",
        category: "Pain Relief",
        dosageForm: "Tablet",
        strength: "300mg",
        manufacturer: "Bayer",
      },
    }),
    // Antibiotics
    prisma.medicine.upsert({
      where: { id: "med_amoxicillin_250" },
      update: {},
      create: {
        id: "med_amoxicillin_250",
        name: "Amoxicillin 250mg",
        genericName: "Amoxicillin",
        category: "Antibiotics",
        dosageForm: "Capsule",
        strength: "250mg",
        manufacturer: "Various",
      },
    }),
    prisma.medicine.upsert({
      where: { id: "med_amoxicillin_500" },
      update: {},
      create: {
        id: "med_amoxicillin_500",
        name: "Amoxicillin 500mg",
        genericName: "Amoxicillin",
        category: "Antibiotics",
        dosageForm: "Capsule",
        strength: "500mg",
        manufacturer: "Various",
      },
    }),
    prisma.medicine.upsert({
      where: { id: "med_azithromycin_500" },
      update: {},
      create: {
        id: "med_azithromycin_500",
        name: "Azithromycin 500mg",
        genericName: "Azithromycin",
        category: "Antibiotics",
        dosageForm: "Tablet",
        strength: "500mg",
        manufacturer: "Pfizer",
      },
    }),
    // Vitamins
    prisma.medicine.upsert({
      where: { id: "med_vitaminc_1000" },
      update: {},
      create: {
        id: "med_vitaminc_1000",
        name: "Vitamin C 1000mg",
        genericName: "Ascorbic Acid",
        category: "Vitamins",
        dosageForm: "Tablet",
        strength: "1000mg",
        manufacturer: "Various",
      },
    }),
    prisma.medicine.upsert({
      where: { id: "med_vitamind_1000" },
      update: {},
      create: {
        id: "med_vitamind_1000",
        name: "Vitamin D3 1000IU",
        genericName: "Cholecalciferol",
        category: "Vitamins",
        dosageForm: "Capsule",
        strength: "1000IU",
        manufacturer: "Various",
      },
    }),
    // Diabetes
    prisma.medicine.upsert({
      where: { id: "med_metformin_500" },
      update: {},
      create: {
        id: "med_metformin_500",
        name: "Metformin 500mg",
        genericName: "Metformin",
        category: "Diabetes",
        dosageForm: "Tablet",
        strength: "500mg",
        manufacturer: "Various",
      },
    }),
    // Allergy
    prisma.medicine.upsert({
      where: { id: "med_loratadine_10" },
      update: {},
      create: {
        id: "med_loratadine_10",
        name: "Loratadine 10mg",
        genericName: "Loratadine",
        category: "Allergy",
        dosageForm: "Tablet",
        strength: "10mg",
        manufacturer: "Various",
      },
    }),
    prisma.medicine.upsert({
      where: { id: "med_cetirizine_10" },
      update: {},
      create: {
        id: "med_cetirizine_10",
        name: "Cetirizine 10mg",
        genericName: "Cetirizine",
        category: "Allergy",
        dosageForm: "Tablet",
        strength: "10mg",
        manufacturer: "Various",
      },
    }),
    // Stomach
    prisma.medicine.upsert({
      where: { id: "med_omeprazole_20" },
      update: {},
      create: {
        id: "med_omeprazole_20",
        name: "Omeprazole 20mg",
        genericName: "Omeprazole",
        category: "Stomach",
        dosageForm: "Capsule",
        strength: "20mg",
        manufacturer: "Various",
      },
    }),
  ]);
  console.log("✅ Medicines created:", medicines.length);

  // Create similar medicine relationships
  await prisma.similarMedicine.upsert({
    where: {
      mainMedicineId_similarMedicineId: {
        mainMedicineId: "med_paracetamol_500",
        similarMedicineId: "med_ibuprofen_400",
      },
    },
    update: {},
    create: {
      mainMedicineId: "med_paracetamol_500",
      similarMedicineId: "med_ibuprofen_400",
    },
  });

  await prisma.similarMedicine.upsert({
    where: {
      mainMedicineId_similarMedicineId: {
        mainMedicineId: "med_amoxicillin_250",
        similarMedicineId: "med_amoxicillin_500",
      },
    },
    update: {},
    create: {
      mainMedicineId: "med_amoxicillin_250",
      similarMedicineId: "med_amoxicillin_500",
    },
  });
  console.log("✅ Similar medicines linked");

  // Create pharmacies
  const pharmacies = await Promise.all([
    prisma.pharmacy.upsert({
      where: { ownerId: pharmacyOwners[0].id },
      update: {},
      create: {
        name: "PharmaCare Plus",
        address: "KG 7 Ave, Kigali",
        phone: "+250 788 123 456",
        email: "pharmacare@example.com",
        hours: "8:00 AM - 9:00 PM",
        latitude: -1.9403,
        longitude: 30.0588,
        isVerified: true,
        ownerId: pharmacyOwners[0].id,
      },
    }),
    prisma.pharmacy.upsert({
      where: { ownerId: pharmacyOwners[1].id },
      update: {},
      create: {
        name: "HealthFirst Pharmacy",
        address: "KN 3 St, Nyarugenge",
        phone: "+250 788 234 567",
        email: "healthfirst@example.com",
        hours: "7:00 AM - 10:00 PM",
        latitude: -1.9536,
        longitude: 30.0606,
        isVerified: true,
        ownerId: pharmacyOwners[1].id,
      },
    }),
    prisma.pharmacy.upsert({
      where: { ownerId: pharmacyOwners[2].id },
      update: {},
      create: {
        name: "MediPlus Drugstore",
        address: "KK 15 Ave, Kicukiro",
        phone: "+250 788 345 678",
        email: "mediplus@example.com",
        hours: "24 Hours",
        latitude: -1.9706,
        longitude: 30.1044,
        isVerified: true,
        ownerId: pharmacyOwners[2].id,
      },
    }),
    prisma.pharmacy.upsert({
      where: { ownerId: pharmacyOwners[3].id },
      update: {},
      create: {
        name: "City Pharmacy",
        address: "KG 11 Ave, Gasabo",
        phone: "+250 788 456 789",
        email: "citypharmacy@example.com",
        hours: "8:00 AM - 8:00 PM",
        latitude: -1.9297,
        longitude: 30.0819,
        isVerified: true,
        ownerId: pharmacyOwners[3].id,
      },
    }),
  ]);
  console.log("✅ Pharmacies created:", pharmacies.length);

  // Add medicines to pharmacy inventories
  const inventoryData = [
    // PharmaCare Plus
    { pharmacyId: pharmacies[0].id, medicineId: "med_paracetamol_500", quantity: 500, price: 2500 },
    { pharmacyId: pharmacies[0].id, medicineId: "med_amoxicillin_250", quantity: 200, price: 3500 },
    { pharmacyId: pharmacies[0].id, medicineId: "med_vitaminc_1000", quantity: 350, price: 1500 },
    { pharmacyId: pharmacies[0].id, medicineId: "med_ibuprofen_400", quantity: 150, price: 2000 },
    { pharmacyId: pharmacies[0].id, medicineId: "med_metformin_500", quantity: 100, price: 4500 },

    // HealthFirst Pharmacy
    { pharmacyId: pharmacies[1].id, medicineId: "med_paracetamol_500", quantity: 300, price: 2300 },
    { pharmacyId: pharmacies[1].id, medicineId: "med_amoxicillin_500", quantity: 180, price: 4500 },
    { pharmacyId: pharmacies[1].id, medicineId: "med_loratadine_10", quantity: 250, price: 2800 },
    { pharmacyId: pharmacies[1].id, medicineId: "med_omeprazole_20", quantity: 200, price: 3200 },

    // MediPlus Drugstore
    { pharmacyId: pharmacies[2].id, medicineId: "med_paracetamol_500", quantity: 600, price: 2400 },
    { pharmacyId: pharmacies[2].id, medicineId: "med_azithromycin_500", quantity: 100, price: 8500 },
    { pharmacyId: pharmacies[2].id, medicineId: "med_vitamind_1000", quantity: 400, price: 2200 },
    { pharmacyId: pharmacies[2].id, medicineId: "med_cetirizine_10", quantity: 300, price: 2600 },
    { pharmacyId: pharmacies[2].id, medicineId: "med_aspirin_300", quantity: 250, price: 1800 },

    // City Pharmacy
    { pharmacyId: pharmacies[3].id, medicineId: "med_ibuprofen_400", quantity: 0, price: 2100 }, // Out of stock
    { pharmacyId: pharmacies[3].id, medicineId: "med_metformin_500", quantity: 15, price: 4200 }, // Low stock
    { pharmacyId: pharmacies[3].id, medicineId: "med_vitaminc_1000", quantity: 220, price: 1600 },
  ];

  for (const inv of inventoryData) {
    await prisma.pharmacyMedicine.upsert({
      where: {
        pharmacyId_medicineId: {
          pharmacyId: inv.pharmacyId,
          medicineId: inv.medicineId,
        },
      },
      update: { quantity: inv.quantity, price: inv.price, inStock: inv.quantity > 0 },
      create: {
        pharmacyId: inv.pharmacyId,
        medicineId: inv.medicineId,
        quantity: inv.quantity,
        price: inv.price,
        inStock: inv.quantity > 0,
      },
    });
  }
  console.log("✅ Pharmacy inventories populated:", inventoryData.length);

  console.log("\n🎉 Database seeding completed!");
  console.log("\n📋 Demo credentials:");
  console.log("   Admin: admin@umuti.com / admin123");
  console.log("   Pharmacy: pharmacare@example.com / pharmacy123");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
