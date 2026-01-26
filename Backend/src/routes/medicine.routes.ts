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

// Get all medicines (public)
router.get("/", async (req, res, next) => {
  try {
    const { search, category, limit = "50", offset = "0" } = req.query;

    const medicines = await prisma.medicine.findMany({
      where: {
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
      },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
      orderBy: { name: "asc" },
    });

    const total = await prisma.medicine.count({
      where: {
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
      },
    });

    res.json({
      success: true,
      data: medicines,
      meta: {
        total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get medicine by ID (public)
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

// Create medicine (admin only)
router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  validate(addMedicineSchema),
  async (req, res, next) => {
    try {
      const medicine = await prisma.medicine.create({
        data: req.body,
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

// Add medicine to pharmacy inventory (pharmacy owner)
router.post(
  "/inventory",
  authenticate,
  authorize("PHARMACY"),
  validate(addToInventorySchema),
  async (req, res, next) => {
    try {
      const { medicineId, quantity, price, expiryDate } = req.body;

      // Get pharmacy
      const pharmacy = await prisma.pharmacy.findUnique({
        where: { ownerId: req.user!.id },
      });

      if (!pharmacy) {
        throw new AppError("Pharmacy not found", 404);
      }

      // Check if medicine exists
      const medicine = await prisma.medicine.findUnique({
        where: { id: medicineId },
      });

      if (!medicine) {
        throw new AppError("Medicine not found", 404);
      }

      // Check if already in inventory
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
          price,
          expiryDate: expiryDate ? new Date(expiryDate) : undefined,
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

// Update pharmacy inventory (pharmacy owner)
router.put(
  "/inventory/:id",
  authenticate,
  authorize("PHARMACY"),
  validate(updateInventorySchema),
  async (req, res, next) => {
    try {
      const { quantity, price, expiryDate, inStock } = req.body;

      // Get pharmacy
      const pharmacy = await prisma.pharmacy.findUnique({
        where: { ownerId: req.user!.id },
      });

      if (!pharmacy) {
        throw new AppError("Pharmacy not found", 404);
      }

      // Check if entry exists and belongs to this pharmacy
      const entry = await prisma.pharmacyMedicine.findFirst({
        where: {
          id: req.params.id,
          pharmacyId: pharmacy.id,
        },
      });

      if (!entry) {
        throw new AppError("Inventory entry not found", 404);
      }

      const updatedEntry = await prisma.pharmacyMedicine.update({
        where: { id: req.params.id },
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
      // Get pharmacy
      const pharmacy = await prisma.pharmacy.findUnique({
        where: { ownerId: req.user!.id },
      });

      if (!pharmacy) {
        throw new AppError("Pharmacy not found", 404);
      }

      // Check if entry exists and belongs to this pharmacy
      const entry = await prisma.pharmacyMedicine.findFirst({
        where: {
          id: req.params.id,
          pharmacyId: pharmacy.id,
        },
      });

      if (!entry) {
        throw new AppError("Inventory entry not found", 404);
      }

      await prisma.pharmacyMedicine.delete({
        where: { id: req.params.id },
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

// Get pharmacy inventory (pharmacy owner)
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

export default router;
