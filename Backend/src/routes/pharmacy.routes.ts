import { Router } from "express";
import { z } from "zod";
import prisma from "../lib/prisma.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { AppError } from "../middleware/error.middleware.js";

const router = Router();

// Validation schemas
const createPharmacySchema = z.object({
  body: z.object({
    name: z.string().min(2, "Pharmacy name must be at least 2 characters"),
    address: z.string().min(5, "Address must be at least 5 characters"),
    phone: z.string().min(10, "Phone must be at least 10 characters"),
    email: z.string().email("Invalid email address"),
    hours: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    licenseNumber: z.string().optional(),
  }),
});

const updatePharmacySchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    address: z.string().min(5).optional(),
    phone: z.string().min(10).optional(),
    email: z.string().email().optional(),
    hours: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }),
});

// Get all pharmacies (public)
router.get("/", async (req, res, next) => {
  try {
    const { verified, limit = "50", offset = "0" } = req.query;

    const pharmacies = await prisma.pharmacy.findMany({
      where: {
        ...(verified === "true" && { isVerified: true }),
      },
      select: {
        id: true,
        name: true,
        address: true,
        phone: true,
        email: true,
        hours: true,
        latitude: true,
        longitude: true,
        isVerified: true,
      },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
      orderBy: { name: "asc" },
    });

    const total = await prisma.pharmacy.count({
      where: {
        ...(verified === "true" && { isVerified: true }),
      },
    });

    res.json({
      success: true,
      data: pharmacies,
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

// Get pharmacy by ID (public)
router.get("/:id", async (req, res, next) => {
  try {
    const pharmacy = await prisma.pharmacy.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        address: true,
        phone: true,
        email: true,
        hours: true,
        latitude: true,
        longitude: true,
        isVerified: true,
        medicines: {
          where: { inStock: true },
          select: {
            id: true,
            quantity: true,
            price: true,
            medicine: {
              select: {
                id: true,
                name: true,
                genericName: true,
                category: true,
                strength: true,
              },
            },
          },
        },
      },
    });

    if (!pharmacy) {
      throw new AppError("Pharmacy not found", 404);
    }

    res.json({
      success: true,
      data: pharmacy,
    });
  } catch (error) {
    next(error);
  }
});

// Create pharmacy (pharmacy owner only)
router.post(
  "/",
  authenticate,
  authorize("PHARMACY"),
  validate(createPharmacySchema),
  async (req, res, next) => {
    try {
      const { name, address, phone, email, hours, latitude, longitude, licenseNumber } = req.body;

      // Check if user already has a pharmacy
      const existingPharmacy = await prisma.pharmacy.findUnique({
        where: { ownerId: req.user!.id },
      });

      if (existingPharmacy) {
        throw new AppError("You already have a registered pharmacy", 400);
      }

      const pharmacy = await prisma.pharmacy.create({
        data: {
          name,
          address,
          phone,
          email,
          hours: hours || "8:00 AM - 8:00 PM",
          latitude,
          longitude,
          licenseNumber,
          ownerId: req.user!.id,
        },
        select: {
          id: true,
          name: true,
          address: true,
          phone: true,
          email: true,
          hours: true,
          latitude: true,
          longitude: true,
          isVerified: true,
          createdAt: true,
        },
      });

      // Create application for verification
      await prisma.pharmacyApplication.create({
        data: {
          pharmacyName: name,
          ownerName: req.user!.email,
          email,
          phone,
          address,
          pharmacyId: pharmacy.id,
        },
      });

      res.status(201).json({
        success: true,
        message: "Pharmacy created successfully. Pending verification.",
        data: pharmacy,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Update pharmacy (pharmacy owner only)
router.put(
  "/",
  authenticate,
  authorize("PHARMACY"),
  validate(updatePharmacySchema),
  async (req, res, next) => {
    try {
      const pharmacy = await prisma.pharmacy.findUnique({
        where: { ownerId: req.user!.id },
      });

      if (!pharmacy) {
        throw new AppError("Pharmacy not found", 404);
      }

      const updatedPharmacy = await prisma.pharmacy.update({
        where: { id: pharmacy.id },
        data: req.body,
        select: {
          id: true,
          name: true,
          address: true,
          phone: true,
          email: true,
          hours: true,
          latitude: true,
          longitude: true,
          isVerified: true,
          updatedAt: true,
        },
      });

      res.json({
        success: true,
        message: "Pharmacy updated successfully",
        data: updatedPharmacy,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get my pharmacy (pharmacy owner only)
router.get(
  "/me/pharmacy",
  authenticate,
  authorize("PHARMACY"),
  async (req, res, next) => {
    try {
      const pharmacy = await prisma.pharmacy.findUnique({
        where: { ownerId: req.user!.id },
        include: {
          medicines: {
            include: {
              medicine: true,
            },
          },
          application: true,
        },
      });

      if (!pharmacy) {
        throw new AppError("You don't have a registered pharmacy yet", 404);
      }

      res.json({
        success: true,
        data: pharmacy,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
