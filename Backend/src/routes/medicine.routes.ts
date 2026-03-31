import { Router } from "express";
import { z } from "zod";
import prisma from "../lib/prisma.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { AppError } from "../middleware/error.middleware.js";

const router = Router();

// Validation schemas
const addMedicineSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Medicine name must be at least 2 characters"),
    genericName: z.string().optional(),
    category: z.string().min(2, "Category is required"),
    description: z.string().optional(),
    dosageForm: z.string().optional(),
    strength: z.string().optional(),
    manufacturer: z.string().optional(),
  }),
});

const addToInventorySchema = z.object({
  body: z.object({
    medicineId: z.string().min(1, "Medicine ID is required"),
    quantity: z.number().min(0, "Quantity must be at least 0"),
    price: z.number().min(0, "Price must be at least 0"),
    expiryDate: z.string().optional(),
  }),
});

const updateInventorySchema = z.object({
  body: z.object({
    quantity: z.number().min(0).optional(),
    price: z.number().min(0).optional(),
    expiryDate: z.string().optional(),
    inStock: z.boolean().optional(),
  }),
});

const bulkAddSchema = z.object({
  body: z.object({
    items: z.array(z.object({
      medicineId: z.string().optional(),
      name: z.string().optional(),
      category: z.string().optional(),
      quantity: z.number().min(0),
      price: z.number().min(0),
      expiryDate: z.string().optional(),
    })).min(1).refine(items => items.every(item => item.medicineId || (item.name?.trim() && item.category?.trim())), {
      message: "Each item must have a medicineId OR (name and category)"
    }),
  }),
});

const similaritySchema = z.object({
  body: z.object({
    mainMedicineId: z.string().min(1),
    similarMedicineIds: z.array(z.string().min(1)).min(1),
  }),
});

// Get all medicines (public)
router.get("/", async (req, res, next) => {
  try {
    const { search, category, limit, offset } = req.query;

    const pageSize = parseInt(limit as string) || 50;
    const skipValue = parseInt(offset as string) || 0;

    const where: any = {
      AND: [
        search
          ? {
              OR: [
                { name: { contains: search as string, mode: "insensitive" } },
                { genericName: { contains: search as string, mode: "insensitive" } },
              ],
            }
          : {},
        category ? { category: { equals: category as string, mode: "insensitive" } } : {},
      ],
    };

    const medicines = await prisma.medicine.findMany({
      where,
      take: pageSize,
      skip: skipValue,
      orderBy: { name: "asc" },
    });

    const total = await prisma.medicine.count({
      where,
    });

    res.json({
      success: true,
      data: medicines,
      meta: {
        total,
        limit: pageSize,
        offset: skipValue,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Create medicine (admin and pharmacy)
router.post(
  "/",
  authenticate,
  authorize("ADMIN", "PHARMACY"),
  validate(addMedicineSchema),
  async (req, res, next) => {
    try {
      const { name, genericName, category, description, dosageForm, strength, manufacturer } = req.body;
      const medicine = await prisma.medicine.create({
        data: { name, genericName, category, description, dosageForm, strength, manufacturer },
      });

      res.status(201).json({
        success: true,
        message: "Medicine created successfully",
        data: medicine,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get unique categories (public)
router.get("/categories", async (req, res, next) => {
  try {
    const categories = await prisma.medicine.findMany({
      select: { category: true },
      distinct: ["category"],
    });
    res.json({
      success: true,
      data: categories.map((c) => c.category),
    });
  } catch (error) {
    next(error);
  }
});

// Get pharmacy inventory (pharmacy owner) - MUST be before /:id routes
router.get(
  "/inventory/my",
  authenticate,
  authorize("PHARMACY"),
  async (req, res, next) => {
    try {
      const pharmacy = await prisma.pharmacy.findUnique({
        where: { ownerId: req.user!.id },
      });

      if (!pharmacy) {
        throw new AppError("Pharmacy not found", 404);
      }

      const inventory = await prisma.pharmacyMedicine.findMany({
        where: { pharmacyId: pharmacy.id },
        include: {
          medicine: true,
        },
        orderBy: { medicine: { name: "asc" } },
      });

      const stats = {
        total: inventory.length,
        inStock: inventory.filter((i) => i.inStock).length,
        lowStock: inventory.filter((i) => i.quantity > 0 && i.quantity < 20).length,
        outOfStock: inventory.filter((i) => !i.inStock || i.quantity === 0).length,
        totalValue: inventory.reduce((sum, i) => sum + i.price * i.quantity, 0),
      };

      res.json({
        success: true,
        data: inventory,
        stats,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Add medicine to pharmacy inventory (pharmacy owner)
router.post(
  "/inventory",
  authenticate,
  authorize("PHARMACY"),
  validate(addToInventorySchema),
  async (req, res, next) => {
    try {
      const { medicineId, quantity, price, expiryDate } = req.body;

      const pharmacy = await prisma.pharmacy.findUnique({
        where: { ownerId: req.user!.id },
      });

      if (!pharmacy) {
        throw new AppError("Pharmacy not found", 404);
      }

      const medicine = await prisma.medicine.findUnique({
        where: { id: medicineId },
      });

      if (!medicine) {
        throw new AppError("Medicine not found", 404);
      }

      const existingEntry = await prisma.pharmacyMedicine.findUnique({
        where: {
          pharmacyId_medicineId: {
            pharmacyId: pharmacy.id,
            medicineId,
          },
        },
      });

      if (existingEntry) {
        throw new AppError("Medicine already in inventory. Use update instead.", 400);
      }

      const inventoryEntry = await prisma.pharmacyMedicine.create({
        data: {
          pharmacyId: pharmacy.id,
          medicineId,
          quantity,
          price: parseFloat(price.toString()),
          expiryDate: expiryDate && !isNaN(Date.parse(expiryDate)) ? new Date(expiryDate) : undefined,
          inStock: quantity > 0,
        },
        include: {
          medicine: true,
        },
      });

      res.status(201).json({
        success: true,
        message: "Medicine added to inventory",
        data: inventoryEntry,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Bulk add medicines to inventory
router.post(
  "/inventory/bulk",
  authenticate,
  authorize("PHARMACY"),
  validate(bulkAddSchema),
  async (req, res, next) => {
    try {
      const { items } = req.body;
      const pharmacy = await prisma.pharmacy.findUnique({
        where: { ownerId: req.user!.id },
      });

      if (!pharmacy) {
        throw new AppError("Pharmacy not found", 404);
      }

      const results = await prisma.$transaction(async (tx) => {
        const entries = [];
        for (const item of items) {
          let medicineId = item.medicineId;

          // If medicineId is missing, try to find or create the master record
          if (!medicineId && item.name?.trim() && item.category?.trim()) {
            let masterMed = await tx.medicine.findFirst({
              where: { name: { equals: item.name.trim(), mode: "insensitive" } }
            });

            if (!masterMed) {
              masterMed = await tx.medicine.create({
                data: {
                  name: item.name.trim(),
                  category: item.category.trim(),
                }
              });
            }
            medicineId = masterMed.id;
          }

          if (!medicineId) continue; // Should not happen due to validation

          const existing = await tx.pharmacyMedicine.findUnique({
            where: {
              pharmacyId_medicineId: {
                pharmacyId: pharmacy.id,
                medicineId: medicineId,
              },
            },
          });

          if (existing) {
            const updated = await tx.pharmacyMedicine.update({
              where: { id: existing.id },
              data: {
                quantity: item.quantity,
                price: item.price,
                expiryDate: item.expiryDate && !isNaN(Date.parse(item.expiryDate)) ? new Date(item.expiryDate) : undefined,
                inStock: item.quantity > 0,
              },
            });
            entries.push(updated);
          } else {
            const created = await tx.pharmacyMedicine.create({
              data: {
                pharmacyId: pharmacy.id,
                medicineId: medicineId,
                quantity: item.quantity,
                price: item.price,
                expiryDate: item.expiryDate && !isNaN(Date.parse(item.expiryDate)) ? new Date(item.expiryDate) : undefined,
                inStock: item.quantity > 0,
              },
            });
            entries.push(created);
          }
        }
        return entries;
      });

      res.status(201).json({
        success: true,
        data: results,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Create similarity between medicines
router.post(
  "/similar",
  authenticate,
  validate(similaritySchema),
  async (req, res, next) => {
    try {
      const { mainMedicineId, similarMedicineIds } = req.body;

      await prisma.$transaction(
        similarMedicineIds.map((sid: string) =>
          prisma.similarMedicine.upsert({
            where: {
              mainMedicineId_similarMedicineId: {
                mainMedicineId,
                similarMedicineId: sid,
              },
            },
            update: {},
            create: {
              mainMedicineId,
              similarMedicineId: sid,
            },
          })
        )
      );

      res.json({
        success: true,
        message: "Similarities updated",
      });
    } catch (error) {
      next(error);
    }
  }
);

// UPDATE / DELETE must be after literal paths like /bulk but before /:id for generic medicines
// Update pharmacy inventory (pharmacy owner)
router.put(
  "/inventory/:id",
  authenticate,
  authorize("PHARMACY"),
  validate(updateInventorySchema),
  async (req, res, next) => {
    try {
      const { quantity, price, expiryDate, inStock } = req.body;
      const pharmacy = await prisma.pharmacy.findUnique({
        where: { ownerId: req.user!.id },
      });

      if (!pharmacy) {
        throw new AppError("Pharmacy not found", 404);
      }

      const entry = await prisma.pharmacyMedicine.findFirst({
        where: {
          id: req.params.id as string,
          pharmacyId: pharmacy.id,
        },
      });

      if (!entry) {
        throw new AppError("Inventory entry not found", 404);
      }

      const updatedEntry = await prisma.pharmacyMedicine.update({
        where: { id: req.params.id as string },
        data: {
          ...(quantity !== undefined && { quantity, inStock: quantity > 0 }),
          ...(price !== undefined && { price }),
          ...(expiryDate && { expiryDate: new Date(expiryDate) }),
          ...(inStock !== undefined && { inStock }),
        },
        include: {
          medicine: true,
        },
      });

      res.json({
        success: true,
        message: "Inventory updated",
        data: updatedEntry,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Delete from inventory (pharmacy owner)
router.delete(
  "/inventory/:id",
  authenticate,
  authorize("PHARMACY"),
  async (req, res, next) => {
    try {
      const pharmacy = await prisma.pharmacy.findUnique({
        where: { ownerId: req.user!.id },
      });

      if (!pharmacy) {
        throw new AppError("Pharmacy not found", 404);
      }

      const entry = await prisma.pharmacyMedicine.findFirst({
        where: {
          id: req.params.id as string,
          pharmacyId: pharmacy.id,
        },
      });

      if (!entry) {
        throw new AppError("Inventory entry not found", 404);
      }

      await prisma.pharmacyMedicine.delete({
        where: { id: req.params.id as string },
      });

      res.json({
        success: true,
        message: "Medicine removed from inventory",
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get medicine by ID (public) - Generic param routes go LAST
router.get("/:id", async (req, res, next) => {
  try {
    const medicine = await prisma.medicine.findUnique({
      where: { id: req.params.id },
      include: {
        similarTo: {
          include: {
            similarMedicine: true,
          },
        },
      },
    });

    if (!medicine) {
      throw new AppError("Medicine not found", 404);
    }

    res.json({
      success: true,
      data: medicine,
    });
  } catch (error) {
    next(error);
  }
});


export default router;
