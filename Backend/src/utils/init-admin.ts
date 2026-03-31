import bcrypt from "bcryptjs";
import prisma from "../lib/prisma.js";

export const initAdmin = async () => {
  try {
    const adminEmail = "admin@umuti.com";
    const adminPassword = "admin123";
    const adminName = "UMUTI Admin";

    // Check if any admin exists (or specifically this one)
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (!existingAdmin) {
      console.log("Creating default admin user...");
      
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          name: adminName,
          role: "ADMIN",
          isEmailVerified: true,
        },
      });
      
      console.log(`✅ Default admin created: ${adminEmail}`);
    } else {
      console.log("ℹ️ Default admin already exists.");
    }
  } catch (error) {
    console.error("❌ Error initializing admin:", error);
  }
};
