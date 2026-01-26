import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import prisma from "../lib/prisma.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { AppError } from "../middleware/error.middleware.js";
import { sendEmail } from "../lib/email.js";

const router = Router();

// All admin routes require authentication and ADMIN role
router.use(authenticate, authorize("ADMIN"));

// Dashboard stats
router.get("/dashboard", async (req, res, next) => {
  try {
    const [
      totalPharmacies,
      verifiedPharmacies,
      pendingApplications,
      totalUsers,
      totalMedicines,
      totalSearches,
      recentSearches,
    ] = await Promise.all([
      prisma.pharmacy.count(),
      prisma.pharmacy.count({ where: { isVerified: true } }),
      prisma.pharmacyApplication.count({ where: { status: "PENDING" } }),
      prisma.user.count(),
      prisma.medicine.count(),
      prisma.searchHistory.count(),
      prisma.searchHistory.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    // Get stats for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newPharmaciesThisMonth = await prisma.pharmacy.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    });

    const newUsersThisMonth = await prisma.user.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    });

    const searchesThisMonth = await prisma.searchHistory.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    });

    res.json({
      success: true,
      data: {
        stats: {
          totalPharmacies,
          verifiedPharmacies,
          pendingApplications,
          totalUsers,
          totalMedicines,
          totalSearches,
        },
        growth: {
          newPharmaciesThisMonth,
          newUsersThisMonth,
          searchesThisMonth,
        },
        recentSearches,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get all applications
router.get("/applications", async (req, res, next) => {
  try {
    const { status } = req.query;

    const applications = await prisma.pharmacyApplication.findMany({
      where: status
        ? { status: status as "PENDING" | "APPROVED" | "REJECTED" }
        : undefined,
      include: {
        pharmacy: {
          select: {
            id: true,
            name: true,
            isVerified: true,
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
                isEmailVerified: true,
              },
            },
          },
        },
      },
      orderBy: { submittedAt: "desc" },
    });

    res.json({
      success: true,
      data: { applications },
    });
  } catch (error) {
    next(error);
  }
});

// Get single application
router.get("/applications/:id", async (req, res, next) => {
  try {
    const application = await prisma.pharmacyApplication.findUnique({
      where: { id: req.params.id },
      include: {
        pharmacy: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
            email: true,
            hours: true,
            licenseNumber: true,
            isVerified: true,
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                isEmailVerified: true,
              },
            },
          },
        },
      },
    });

    if (!application) {
      throw new AppError("Application not found", 404);
    }

    res.json({
      success: true,
      data: { application },
    });
  } catch (error) {
    next(error);
  }
});

// Approve application
router.post("/applications/:id/approve", async (req, res, next) => {
  try {
    const application = await prisma.pharmacyApplication.findUnique({
      where: { id: req.params.id },
      include: {
        pharmacy: {
          include: {
            owner: true,
          },
        },
      },
    });

    if (!application) {
      throw new AppError("Application not found", 404);
    }

    if (application.status !== "PENDING") {
      throw new AppError("Application has already been processed", 400);
    }

    // Update application and pharmacy in transaction
    await prisma.$transaction(async (tx) => {
      // Update application
      await tx.pharmacyApplication.update({
        where: { id: req.params.id },
        data: {
          status: "APPROVED",
          reviewedAt: new Date(),
          reviewedBy: req.user!.id,
        },
      });

      // Verify pharmacy
      if (application.pharmacyId) {
        await tx.pharmacy.update({
          where: { id: application.pharmacyId },
          data: { isVerified: true },
        });
      }
    });

    // Send approval email
    if (application.pharmacy?.owner) {
      await sendEmail(
        application.email,
        "applicationApproved",
        application.pharmacy.owner.name,
        application.pharmacyName
      );
    }

    res.json({
      success: true,
      message: "Application approved successfully. Pharmacy owner has been notified via email.",
    });
  } catch (error) {
    next(error);
  }
});

// Reject application
const rejectSchema = z.object({
  body: z.object({
    reason: z.string().min(10, "Rejection reason must be at least 10 characters"),
  }),
});

router.post(
  "/applications/:id/reject",
  validate(rejectSchema),
  async (req, res, next) => {
    try {
      const { reason } = req.body;

      const application = await prisma.pharmacyApplication.findUnique({
        where: { id: req.params.id },
        include: {
          pharmacy: {
            include: {
              owner: true,
            },
          },
        },
      });

      if (!application) {
        throw new AppError("Application not found", 404);
      }

      if (application.status !== "PENDING") {
        throw new AppError("Application has already been processed", 400);
      }

      await prisma.pharmacyApplication.update({
        where: { id: req.params.id },
        data: {
          status: "REJECTED",
          rejectionReason: reason,
          reviewedAt: new Date(),
          reviewedBy: req.user!.id,
        },
      });

      // Send rejection email with reason
      if (application.pharmacy?.owner) {
        await sendEmail(
          application.email,
          "applicationRejected",
          application.pharmacy.owner.name,
          application.pharmacyName,
          reason
        );
      }

      res.json({
        success: true,
        message: "Application rejected. Pharmacy owner has been notified via email with the reason.",
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get all pharmacies (admin view)
router.get("/pharmacies", async (req, res, next) => {
  try {
    const { verified } = req.query;

    const pharmacies = await prisma.pharmacy.findMany({
      where: verified !== undefined ? { isVerified: verified === "true" } : undefined,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            isEmailVerified: true,
          },
        },
        _count: {
          select: {
            medicines: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: { pharmacies },
    });
  } catch (error) {
    next(error);
  }
});

// Toggle pharmacy verification
router.post("/pharmacies/:id/toggle-verification", async (req, res, next) => {
  try {
    const pharmacy = await prisma.pharmacy.findUnique({
      where: { id: req.params.id },
      include: { owner: true },
    });

    if (!pharmacy) {
      throw new AppError("Pharmacy not found", 404);
    }

    const updated = await prisma.pharmacy.update({
      where: { id: req.params.id },
      data: { isVerified: !pharmacy.isVerified },
    });

    // Send email notification
    if (updated.isVerified) {
      await sendEmail(
        pharmacy.owner.email,
        "applicationApproved",
        pharmacy.owner.name,
        pharmacy.name
      );
    }

    res.json({
      success: true,
      message: `Pharmacy ${updated.isVerified ? "verified" : "unverified"} successfully`,
      data: { pharmacy: updated },
    });
  } catch (error) {
    next(error);
  }
});

// Get all users (admin view)
router.get("/users", async (req, res, next) => {
  try {
    const { role } = req.query;

    const users = await prisma.user.findMany({
      where: role ? { role: role as "USER" | "PHARMACY" | "ADMIN" } : undefined,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        isEmailVerified: true,
        createdAt: true,
        pharmacy: {
          select: {
            id: true,
            name: true,
            isVerified: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: { users },
    });
  } catch (error) {
    next(error);
  }
});

// Delete user
router.delete("/users/:id", async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (user.id === req.user!.id) {
      throw new AppError("You cannot delete yourself", 400);
    }

    await prisma.user.delete({
      where: { id: req.params.id },
    });

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});

// Create admin user
const createAdminSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    name: z.string().min(2, "Name must be at least 2 characters"),
  }),
});

router.post("/users/create-admin", validate(createAdminSchema), async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError("User with this email already exists", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: "ADMIN",
        isEmailVerified: true, // Admin users are auto-verified
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    res.status(201).json({
      success: true,
      message: "Admin user created successfully",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
});

// Add medicine (admin can add to master list)
const addMedicineSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    genericName: z.string().optional(),
    category: z.string().min(2),
    description: z.string().optional(),
    dosageForm: z.string().optional(),
    strength: z.string().optional(),
    manufacturer: z.string().optional(),
  }),
});

router.post("/medicines", validate(addMedicineSchema), async (req, res, next) => {
  try {
    const medicine = await prisma.medicine.create({
      data: req.body,
    });

    res.status(201).json({
      success: true,
      message: "Medicine added successfully",
      data: { medicine },
    });
  } catch (error) {
    next(error);
  }
});

// Bulk add medicines
router.post("/medicines/bulk", async (req, res, next) => {
  try {
    const { medicines } = req.body;

    if (!Array.isArray(medicines) || medicines.length === 0) {
      throw new AppError("Invalid medicines data", 400);
    }

    const result = await prisma.medicine.createMany({
      data: medicines,
      skipDuplicates: true,
    });

    res.status(201).json({
      success: true,
      message: `${result.count} medicines added successfully`,
      data: { count: result.count },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
