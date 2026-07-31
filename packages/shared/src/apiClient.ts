import type {
  AnalyticsSummary,
  AuthUser,
  MenuCategory,
  MenuItem,
  Order,
  OrderStatus,
  Restaurant,
  RestaurantAdminSummary,
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
    signup: (name: string, email: string, password: string) =>
      request<{ token: string; user: AuthUser }>("/auth/signup", {
        method: "POST",
        body: { name, email, password, role: "CUSTOMER" satisfies UserRole },
      }),
    me: () => request<AuthUser>("/auth/me"),

    // restaurants (public marketplace + app admin)
    listRestaurants: () => request<Restaurant[]>("/restaurants"),
    getRestaurant: (id: string) => request<Restaurant>(`/restaurants/${id}`),
    listRestaurantsAdmin: () => request<RestaurantAdminSummary[]>("/restaurants/admin"),
    createRestaurant: (payload: {
      name: string;
      address?: string | null;
      adminName: string;
      adminEmail: string;
      adminPassword: string;
    }) =>
      request<{ restaurant: Restaurant; admin: { id: string; name: string; email: string } }>(
        "/restaurants",
        { method: "POST", body: payload }
      ),
    updateRestaurant: (id: string, patch: { name?: string; address?: string | null }) =>
      request<Restaurant>(`/restaurants/${id}`, { method: "PATCH", body: patch }),
    getMyRestaurant: () => request<Restaurant>("/restaurants/mine"),
    updateMyRestaurantSettings: (isOpen: boolean) =>
      request<Restaurant>("/restaurants/mine", { method: "PATCH", body: { isOpen } }),

    // menu
    getMenu: (restaurantId: string) =>
      request<{ categories: MenuCategory[]; items: MenuItem[] }>(
        `/menu?restaurantId=${restaurantId}`
      ),
    getMyMenu: () =>
      request<{ categories: MenuCategory[]; items: MenuItem[] }>("/menu/mine"),
    createMenuItem: (item: Omit<MenuItem, "id">) =>
      request<MenuItem>("/menu/items", { method: "POST", body: item }),
    updateMenuItem: (id: string, item: Partial<MenuItem>) =>
      request<MenuItem>(`/menu/items/${id}`, { method: "PATCH", body: item }),
    createCategory: (name: string, sortOrder: number) =>
      request<MenuCategory>("/menu/categories", {
        method: "POST",
        body: { name, sortOrder },
      }),
    updateCategory: (id: string, patch: Partial<Omit<MenuCategory, "id">>) =>
      request<MenuCategory>(`/menu/categories/${id}`, { method: "PATCH", body: patch }),
    deleteCategory: (id: string) =>
      request<void>(`/menu/categories/${id}`, { method: "DELETE" }),

    // orders
    createOrder: (payload: {
      items: { menuItemId: string; quantity: number; notes?: string | null }[];
      addressId: string;
      restaurantId: string;
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
    updateAddress: (id: string, patch: Partial<Omit<Order["deliveryAddress"], "id">>) =>
      request<Order["deliveryAddress"]>(`/addresses/${id}`, {
        method: "PATCH",
        body: patch,
      }),
    deleteAddress: (id: string) => request<void>(`/addresses/${id}`, { method: "DELETE" }),

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

    // analytics (restaurant admin)
    getAnalytics: (days?: number) =>
      request<AnalyticsSummary>(`/analytics/summary${days ? `?days=${days}` : ""}`),

    // push notifications
    registerPushToken: (pushToken: string | null) =>
      request<void>("/auth/push-token", { method: "POST", body: { pushToken } }),
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
