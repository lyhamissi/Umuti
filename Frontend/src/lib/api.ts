const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Types - defined first so they can be used throughout the file
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: "USER" | "PHARMACY" | "ADMIN";
  isEmailVerified?: boolean;
  createdAt: string;
  pharmacy?: {
    id: string;
    name: string;
    isVerified: boolean;
  };
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface PharmacyRegisterData {
  email: string;
  password: string;
  name: string;
  phone: string;
  pharmacyName: string;
  pharmacyAddress: string;
  pharmacyPhone: string;
  licenseNumber?: string;
  hours?: string;
  latitude?: number;
  longitude?: number;
}

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  hours?: string;
  latitude?: number;
  longitude?: number;
  isVerified: boolean;
  licenseNumber?: string;
  ownerId: string;
  owner?: User;
  medicines?: PharmacyMedicine[];
  createdAt: string;
}

export interface CreatePharmacyData {
  name: string;
  address: string;
  phone: string;
  email?: string;
  hours?: string;
  latitude?: number;
  longitude?: number;
}

export interface Medicine {
  id: string;
  name: string;
  genericName?: string;
  category: string;
  dosageForm?: string;
  strength?: string;
  manufacturer?: string;
  description?: string;
}

export interface CreateMedicineData {
  name: string;
  genericName?: string;
  category: string;
  dosageForm?: string;
  strength?: string;
  manufacturer?: string;
  description?: string;
}

export interface PharmacyMedicine {
  id: string;
  pharmacyId: string;
  medicineId: string;
  quantity: number;
  price: number;
  inStock: boolean;
  pharmacy?: Pharmacy;
  medicine?: Medicine;
}

export interface InventoryUpdateData {
  quantity?: number;
  price?: number;
  inStock?: boolean;
}

export interface AddInventoryData {
  medicineId: string;
  quantity: number;
  price: number;
}

export interface SearchParams {
  q: string;
  lat?: number;
  lon?: number;
  radius?: number;
  inStockOnly?: boolean;
}

export interface SearchResult {
  pharmacy: Pharmacy;
  medicine: Medicine;
  price: number;
  quantity: number;
  inStock: boolean;
  distance?: number;
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  location?: string;
  resultsCount?: number;
  createdAt: string;
}

export interface PharmacyApplication {
  id: string;
  pharmacyName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  licenseNumber?: string;
  licenseDocument?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  pharmacyId?: string;
  pharmacy?: Pharmacy & {
    owner?: User;
  };
}

// API Response and Error types
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export class ApiError extends Error {
  status: number;
  data?: any;
  constructor(message: string, status: number, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = "ApiError";
  }
}

// Token management
export const getAuthToken = (): string | null => {
  return localStorage.getItem("umuti_token");
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem("umuti_token", token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem("umuti_token");
};

// Base request function
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getAuthToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(data.message || "An error occurred", response.status, data.data);
  }

  return data;
}

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await request<{ user: User; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (response.data?.token) {
      setAuthToken(response.data.token);
    }
    return response;
  },

  register: async (data: RegisterData) => {
    const response = await request<{ user: User; requiresVerification: boolean }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response;
  },

  registerPharmacy: async (data: PharmacyRegisterData) => {
    const response = await request<{
      user: User;
      pharmacy: { id: string; name: string; isVerified: boolean };
      application: { id: string; status: string };
      requiresVerification: boolean;
      requiresApproval: boolean;
    }>("/auth/register/pharmacy", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response;
  },

  verifyEmail: async (email: string, otp: string) => {
    return request<{ message: string }>("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ email, otp }),
    });
  },

  resendOtp: async (email: string) => {
    return request<{ message: string }>("/auth/resend-otp", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  getCurrentUser: async () => {
    return request<{ user: User }>("/auth/me");
  },

  logout: () => {
    removeAuthToken();
  },
};

// User API
export const userApi = {
  getProfile: async () => {
    return request<{ user: User }>("/users/profile");
  },

  updateProfile: async (data: Partial<User>) => {
    return request<{ user: User }>("/users/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    return request<{ message: string }>("/users/password", {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
};

// Pharmacy API
export const pharmacyApi = {
  getAll: async (params?: { page?: number; limit?: number; verified?: boolean }) => {
    const queryString = params
      ? "?" + new URLSearchParams(params as Record<string, string>).toString()
      : "";
    return request<{ pharmacies: Pharmacy[]; total: number; page: number; limit: number }>(
      `/pharmacies${queryString}`
    );
  },

  getById: async (id: string) => {
    return request<{ pharmacy: Pharmacy }>(`/pharmacies/${id}`);
  },

  getMine: async () => {
    return request<Pharmacy>("/pharmacies/me/pharmacy");
  },

  create: async (data: CreatePharmacyData) => {
    return request<{ pharmacy: Pharmacy }>("/pharmacies", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<CreatePharmacyData>) => {
    return request<{ pharmacy: Pharmacy }>(`/pharmacies/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return request<{ message: string }>(`/pharmacies/${id}`, {
      method: "DELETE",
    });
  },

  getInventory: async (pharmacyId: string) => {
    return request<{ inventory: PharmacyMedicine[] }>(`/pharmacies/${pharmacyId}/inventory`);
  },

  updateInventory: async (pharmacyId: string, medicineId: string, data: InventoryUpdateData) => {
    return request<{ item: PharmacyMedicine }>(`/pharmacies/${pharmacyId}/inventory/${medicineId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  addToInventory: async (pharmacyId: string, data: AddInventoryData) => {
    return request<{ item: PharmacyMedicine }>(`/pharmacies/${pharmacyId}/inventory`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  removeFromInventory: async (pharmacyId: string, medicineId: string) => {
    return request<{ message: string }>(`/pharmacies/${pharmacyId}/inventory/${medicineId}`, {
      method: "DELETE",
    });
  },
};

// Medicine API
export const medicineApi = {
  getAll: async (params?: { page?: number; limit?: number; category?: string; search?: string }) => {
    const queryString = params
      ? "?" + new URLSearchParams(params as Record<string, string>).toString()
      : "";
    return request<{ medicines: Medicine[]; total: number; page: number; limit: number }>(
      `/medicines${queryString}`
    );
  },

  getById: async (id: string) => {
    return request<{ medicine: Medicine }>(`/medicines/${id}`);
  },

  getCategories: async () => {
    return request<{ categories: string[] }>("/medicines/categories");
  },

  getSimilar: async (id: string) => {
    return request<{ similar: Medicine[] }>(`/medicines/${id}/similar`);
  },

  create: async (data: CreateMedicineData) => {
    return request<{ medicine: Medicine }>("/medicines", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<CreateMedicineData>) => {
    return request<{ medicine: Medicine }>(`/medicines/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return request<{ message: string }>(`/medicines/${id}`, {
      method: "DELETE",
    });
  },

  // Inventory management for pharmacy owners
  getMyInventory: async () => {
    return request<PharmacyMedicine[]>("/medicines/inventory/my");
  },

  addToInventory: async (data: { medicineId: string; quantity: number; price: number; expiryDate?: string }) => {
    return request<{ item: PharmacyMedicine }>("/medicines/inventory", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateInventoryItem: async (id: string, data: { quantity?: number; price?: number; expiryDate?: string; inStock?: boolean }) => {
    return request<{ item: PharmacyMedicine }>(`/medicines/inventory/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deleteInventoryItem: async (id: string) => {
    return request<{ message: string }>(`/medicines/inventory/${id}`, {
      method: "DELETE",
    });
  },
};

// Search API
export const searchApi = {
  searchMedicine: async (params: SearchParams) => {
    const queryParams: Record<string, string> = {
      q: params.q,
    };
    if (params.lat) queryParams.lat = params.lat.toString();
    if (params.lon) queryParams.lon = params.lon.toString();
    if (params.radius) queryParams.radius = params.radius.toString();
    if (params.inStockOnly) queryParams.inStockOnly = params.inStockOnly.toString();

    const queryString = "?" + new URLSearchParams(queryParams).toString();
    return request<{ results: SearchResult[]; total: number }>(`/search${queryString}`);
  },

  getHistory: async () => {
    return request<{ history: SearchHistoryItem[] }>("/search/history");
  },

  clearHistory: async () => {
    return request<{ message: string }>("/search/history", {
      method: "DELETE",
    });
  },
};

// Admin API
export const adminApi = {
  getDashboard: async () => {
    const response = await request<{
      stats: {
        totalPharmacies: number;
        verifiedPharmacies: number;
        pendingApplications: number;
        totalUsers: number;
        totalMedicines: number;
        totalSearches: number;
      };
      growth: {
        newPharmaciesThisMonth: number;
        newUsersThisMonth: number;
        searchesThisMonth: number;
      };
      recentSearches: SearchHistoryItem[];
    }>("/admin/dashboard");
    return response.data!;
  },

  getApplications: async (status?: string) => {
    const queryString = status ? `?status=${status}` : "";
    const response = await request<{ applications: PharmacyApplication[] }>(`/admin/applications${queryString}`);
    return response.data!;
  },

  getApplication: async (id: string) => {
    const response = await request<{ application: PharmacyApplication }>(`/admin/applications/${id}`);
    return response.data!;
  },

  approveApplication: async (id: string) => {
    const response = await request<{ message: string }>(`/admin/applications/${id}/approve`, {
      method: "POST",
    });
    return response.data!;
  },

  rejectApplication: async (id: string, reason: string) => {
    const response = await request<{ message: string }>(`/admin/applications/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
    return response.data!;
  },

  getPharmacies: async (verified?: boolean) => {
    const queryString = verified !== undefined ? `?verified=${verified}` : "";
    return request<{ pharmacies: Pharmacy[] }>(`/admin/pharmacies${queryString}`);
  },

  togglePharmacyVerification: async (id: string) => {
    return request<{ pharmacy: Pharmacy; message: string }>(`/admin/pharmacies/${id}/toggle-verification`, {
      method: "POST",
    });
  },

  getUsers: async (params?: { page?: number; limit?: number; role?: string }) => {
    const queryString = params
      ? "?" + new URLSearchParams(params as Record<string, string>).toString()
      : "";
    return request<{ users: User[]; total: number }>(`/admin/users${queryString}`);
  },

  deleteUser: async (userId: string) => {
    return request<{ message: string }>(`/admin/users/${userId}`, {
      method: "DELETE",
    });
  },

  createAdmin: async (data: { email: string; password: string; name: string }) => {
    return request<{ user: User }>("/admin/users/create-admin", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  addMedicine: async (data: CreateMedicineData) => {
    return request<{ medicine: Medicine }>("/admin/medicines", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
