import { Router } from "express";
import prisma from "../lib/prisma.js";

const router = Router();

// Search medicines across pharmacies
router.get("/", async (req, res, next) => {
  try {
    const { q, location, lat, lng, radius = "10" } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const searchQuery = q as string;

    // Find medicines matching the query
    const medicines = await prisma.medicine.findMany({
      where: {
        OR: [
          { name: { contains: searchQuery, mode: "insensitive" } },
          { genericName: { contains: searchQuery, mode: "insensitive" } },
          { category: { contains: searchQuery, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        genericName: true,
        category: true,
        strength: true,
      },
    });

    if (medicines.length === 0) {
      // Log search even if no results
      await prisma.searchHistory.create({
        data: {
          query: searchQuery,
          location: location as string,
          resultsCount: 0,
        },
      });

      return res.json({
        success: true,
        data: {
          query: searchQuery,
          results: [],
          totalPharmacies: 0,
        },
      });
    }

    const medicineIds = medicines.map((m) => m.id);

    // Find pharmacies with these medicines in stock
    const pharmacyMedicines = await prisma.pharmacyMedicine.findMany({
      where: {
        medicineId: { in: medicineIds },
        inStock: true,
        pharmacy: {
          isVerified: true,
        },
      },
      include: {
        pharmacy: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
            hours: true,
            latitude: true,
            longitude: true,
          },
        },
        medicine: {
          select: {
            id: true,
            name: true,
            genericName: true,
            strength: true,
            similarTo: {
              include: {
                similarMedicine: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Group by pharmacy
    const pharmacyMap = new Map<string, any>();

    for (const pm of pharmacyMedicines) {
      const pharmacyId = pm.pharmacy.id;

      if (!pharmacyMap.has(pharmacyId)) {
        pharmacyMap.set(pharmacyId, {
          ...pm.pharmacy,
          inStock: true,
          medicines: [],
        });
      }

      // Calculate similar medicines with prices at this pharmacy
      const similarMedicines = [];
      for (const similar of pm.medicine.similarTo) {
        const similarPm = await prisma.pharmacyMedicine.findFirst({
          where: {
            pharmacyId,
            medicineId: similar.similarMedicine.id,
            inStock: true,
          },
        });

        if (similarPm) {
          similarMedicines.push({
            name: similar.similarMedicine.name,
            price: `${similarPm.price.toLocaleString()} RWF`,
          });
        }
      }

      pharmacyMap.get(pharmacyId).medicines.push({
        id: pm.id,
        name: pm.medicine.name,
        genericName: pm.medicine.genericName,
        strength: pm.medicine.strength,
        quantity: pm.quantity,
        price: `${pm.price.toLocaleString()} RWF`,
        priceValue: pm.price,
        similarMedicines,
      });
    }

    // Convert to array and calculate distances if coordinates provided
    let results = Array.from(pharmacyMap.values());

    if (lat && lng) {
      const userLat = parseFloat(lat as string);
      const userLng = parseFloat(lng as string);
      const maxRadius = parseFloat(radius as string);

      results = results
        .map((pharmacy) => {
          if (pharmacy.latitude && pharmacy.longitude) {
            const distance = calculateDistance(
              userLat,
              userLng,
              pharmacy.latitude,
              pharmacy.longitude
            );
            return {
              ...pharmacy,
              distance: `${distance.toFixed(1)} km`,
              distanceValue: distance,
            };
          }
          return {
            ...pharmacy,
            distance: "N/A",
            distanceValue: 999,
          };
        })
        .filter((p) => p.distanceValue <= maxRadius)
        .sort((a, b) => a.distanceValue - b.distanceValue);
    } else {
      // Sort by name if no coordinates
      results = results.map((p) => ({
        ...p,
        distance: "N/A",
        distanceValue: 0,
      }));
    }

    // Log search
    await prisma.searchHistory.create({
      data: {
        query: searchQuery,
        location: location as string,
        resultsCount: results.length,
      },
    });

    res.json({
      success: true,
      data: {
        query: searchQuery,
        medicines: medicines.slice(0, 5),
        results,
        totalPharmacies: results.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Helper function to calculate distance between two coordinates
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Get search suggestions (autocomplete)
router.get("/suggestions", async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || (q as string).length < 2) {
      return res.json({
        success: true,
        data: [],
      });
    }

    const medicines = await prisma.medicine.findMany({
      where: {
        OR: [
          { name: { contains: q as string, mode: "insensitive" } },
          { genericName: { contains: q as string, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        genericName: true,
        category: true,
      },
      take: 10,
    });

    res.json({
      success: true,
      data: medicines,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
