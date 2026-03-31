import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import prisma from "../lib/prisma.js";
import { generateToken } from "../lib/jwt.js";
import { validate } from "../middleware/validate.middleware.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { AppError } from "../middleware/error.middleware.js";
import { sendEmail, generateOTP, getOTPExpiry } from "../lib/email.js";

const router = Router();

// Validation schemas
const registerSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    name: z.string().min(2, "Name must be at least 2 characters"),
    phone: z.string().optional(),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
  }),
});

const verifyOTPSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    otp: z.string().length(6, "OTP must be 6 digits"),
  }),
});

const resendOTPSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
  }),
});

const pharmacyRegisterSchema = z.object({
  body: z.object({
    // User details
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    name: z.string().min(2, "Name must be at least 2 characters"),
    phone: z.string().min(10, "Valid phone number is required"),
    // Pharmacy details
    pharmacyName: z.string().min(2, "Pharmacy name is required"),
    pharmacyAddress: z.string().min(5, "Pharmacy address is required"),
    pharmacyPhone: z.string().min(10, "Valid pharmacy phone is required"),
    licenseNumber: z.string().optional(),
    hours: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }),
});

// Register new user (regular user)
router.post("/register", validate(registerSchema), async (req, res, next) => {
  try {
    const { email, password, name, phone } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError("User with this email already exists", 400);
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        role: "USER",
        isEmailVerified: false,
        emailOtp: otp,
        emailOtpExpiry: otpExpiry,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        isEmailVerified: true,
        createdAt: true,
      },
    });

    // Send verification email
    await sendEmail(email, "verificationOTP", name, otp);

    res.status(201).json({
      success: true,
      message: "Registration successful. Please verify your email with the OTP sent.",
      data: {
        user,
        requiresVerification: true,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Register pharmacy owner with pharmacy application
router.post("/register/pharmacy", validate(pharmacyRegisterSchema), async (req, res, next) => {
  console.log("=== Pharmacy registration request ===");
  console.log("Email:", req.body.email);
  console.log("Pharmacy Name:", req.body.pharmacyName);
  try {
    const {
      email,
      password,
      name,
      phone,
      pharmacyName,
      pharmacyAddress,
      pharmacyPhone,
      licenseNumber,
      hours,
      latitude,
      longitude,
    } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError("User with this email already exists", 400);
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user and pharmacy application in a transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // Create user with PHARMACY role
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          phone,
          role: "PHARMACY",
          isEmailVerified: false,
          emailOtp: otp,
          emailOtpExpiry: otpExpiry,
        },
      });

      // Create pharmacy (unverified)
      const pharmacy = await tx.pharmacy.create({
        data: {
          name: pharmacyName,
          address: pharmacyAddress,
          phone: pharmacyPhone,
          email: email,
          hours: hours || "8:00 AM - 8:00 PM",
          latitude,
          longitude,
          licenseNumber,
          isVerified: false,
          ownerId: user.id,
        },
      });

      // Create application
      const application = await tx.pharmacyApplication.create({
        data: {
          pharmacyName,
          ownerName: name,
          email,
          phone: pharmacyPhone,
          address: pharmacyAddress,
          licenseNumber,
          status: "PENDING",
          pharmacyId: pharmacy.id,
        },
      });

      return { user, pharmacy, application };
    });

    console.log("Pharmacy registered successfully:", result.pharmacy.id);
    console.log("Application created:", result.application.id);

    // Send verification OTP email
    const otpSent = await sendEmail(email, "verificationOTP", name, otp);
    console.log("OTP email sent:", otpSent);

    // Send welcome email about application
    const welcomeSent = await sendEmail(email, "welcomePharmacy", name, pharmacyName);
    console.log("Welcome email sent:", welcomeSent);

    res.status(201).json({
      success: true,
      message: "Pharmacy registration successful. Please verify your email and wait for admin approval.",
      data: {
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          phone: result.user.phone,
          role: result.user.role,
          isEmailVerified: result.user.isEmailVerified,
        },
        pharmacy: {
          id: result.pharmacy.id,
          name: result.pharmacy.name,
          isVerified: result.pharmacy.isVerified,
        },
        application: {
          id: result.application.id,
          status: result.application.status,
        },
        requiresVerification: true,
        requiresApproval: true,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Verify email OTP
router.post("/verify-email", validate(verifyOTPSchema), async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (user.isEmailVerified) {
      throw new AppError("Email is already verified", 400);
    }

    if (!user.emailOtp || !user.emailOtpExpiry) {
      throw new AppError("No OTP found. Please request a new one.", 400);
    }

    if (new Date() > user.emailOtpExpiry) {
      throw new AppError("OTP has expired. Please request a new one.", 400);
    }

    if (user.emailOtp !== otp) {
      throw new AppError("Invalid OTP", 400);
    }

    // Update user as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailOtp: null,
        emailOtpExpiry: null,
      },
    });

    res.json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    next(error);
  }
});

// Resend OTP
router.post("/resend-otp", validate(resendOTPSchema), async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (user.isEmailVerified) {
      throw new AppError("Email is already verified", 400);
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();

    // Update user with new OTP
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailOtp: otp,
        emailOtpExpiry: otpExpiry,
      },
    });

    // Send verification email
    await sendEmail(email, "verificationOTP", user.name, otp);

    res.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    next(error);
  }
});

// Login
router.post("/login", validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        pharmacy: {
          select: {
            id: true,
            name: true,
            isVerified: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      throw new AppError("Invalid email or password", 401);
    }

    // Check email verification for pharmacy users
    if (user.role === "PHARMACY" && !user.isEmailVerified) {
      throw new AppError("Please verify your email before logging in", 403, {
        requiresVerification: true,
        email: user.email,
      });
    }

    // Check pharmacy approval for pharmacy users
    if (user.role === "PHARMACY" && user.pharmacy && !user.pharmacy.isVerified) {
      throw new AppError("Your pharmacy application is pending approval", 403, {
        requiresApproval: true,
        pharmacyName: user.pharmacy.name,
      });
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          pharmacy: user.pharmacy,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get current user
router.get("/me", authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
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
            address: true,
            phone: true,
            isVerified: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
