import type {
  AuthUser,
  MenuCategory,
  MenuItem,
  Order,
  OrderStatus,
  Review,
  Rider,
  UserRole,
} from "./types";

export interface ApiClientConfig {
  baseUrl: string;
  getToken: () => string | null;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

function extractErrorMessage(rawBody: string): string | null {
  if (!rawBody) return null;
  try {
    const parsed = JSON.parse(rawBody);
    const err = parsed?.error;
    if (typeof err === "string") return err;
    if (err && typeof err === "object") {
      const fieldErrors = err.fieldErrors as Record<string, string[]> | undefined;
      const firstFieldError = fieldErrors && Object.values(fieldErrors).flat()[0];
      if (firstFieldError) return firstFieldError;
      const firstFormError = (err.formErrors as string[] | undefined)?.[0];
      if (firstFormError) return firstFormError;
      return "Invalid request";
    }
    return null;
  } catch {
    return rawBody;
  }
}

export function createApiClient(config: ApiClientConfig) {
  async function request<T>(
    path: string,
    options: { method?: string; body?: unknown } = {}
  ): Promise<T> {
    const token = config.getToken();
    const res = await fetch(`${config.baseUrl}${path}`, {
      method: options.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText);
      throw new ApiError(res.status, extractErrorMessage(text) || res.statusText);
    }
    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  }

  return {
    // auth
    login: (email: string, password: string) =>
      request<{ token: string; user: AuthUser }>("/auth/login", {
        method: "POST",
        body: { email, password },
      }),
    signup: (name: string, email: string, password: string, role: UserRole) =>
      request<{ token: string; user: AuthUser }>("/auth/signup", {
        method: "POST",
        body: { name, email, password, role },
      }),
    me: () => request<AuthUser>("/auth/me"),

    // menu
    getMenu: () =>
      request<{ categories: MenuCategory[]; items: MenuItem[] }>("/menu"),
    createMenuItem: (item: Omit<MenuItem, "id">) =>
      request<MenuItem>("/menu/items", { method: "POST", body: item }),
    updateMenuItem: (id: string, item: Partial<MenuItem>) =>
      request<MenuItem>(`/menu/items/${id}`, { method: "PATCH", body: item }),
    createCategory: (name: string, sortOrder: number) =>
      request<MenuCategory>("/menu/categories", {
        method: "POST",
        body: { name, sortOrder },
      }),

    // orders
    createOrder: (payload: {
      items: { menuItemId: string; quantity: number }[];
      addressId: string;
    }) => request<Order>("/orders", { method: "POST", body: payload }),
    getOrder: (id: string) => request<Order>(`/orders/${id}`),
    listOrders: (params?: { status?: OrderStatus }) =>
      request<Order[]>(
        `/orders${params?.status ? `?status=${params.status}` : ""}`
      ),
    updateOrderStatus: (id: string, status: OrderStatus) =>
      request<Order>(`/orders/${id}/status`, {
        method: "POST",
        body: { status },
      }),

    // delivery
    listAvailableDeliveries: () =>
      request<Order[]>("/deliveries/available"),
    acceptDelivery: (orderId: string) =>
      request<Order>(`/deliveries/${orderId}/accept`, { method: "POST" }),
    updateRiderLocation: (orderId: string, lat: number, lng: number) =>
      request<void>(`/deliveries/${orderId}/location`, {
        method: "POST",
        body: { lat, lng },
      }),

    // addresses
    listAddresses: () => request<Order["deliveryAddress"][]>("/addresses"),
    createAddress: (address: Omit<Order["deliveryAddress"], "id">) =>
      request<Order["deliveryAddress"]>("/addresses", {
        method: "POST",
        body: address,
      }),

    // reviews
    createReview: (orderId: string, rating: number, comment?: string) =>
      request<Review>(`/orders/${orderId}/review`, {
        method: "POST",
        body: { rating, comment },
      }),

    // riders (restaurant admin)
    listRiders: () => request<Rider[]>("/riders"),
    createRider: (name: string, email: string, password: string) =>
      request<Rider>("/riders", { method: "POST", body: { name, email, password } }),
    deleteRider: (id: string) => request<void>(`/riders/${id}`, { method: "DELETE" }),
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
