import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create the real Supabase client if keys are available
const realSupabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false, // Clerk manages the session
        },
        global: {
          fetch: async (url, options = {}) => {
            let token = null;
            if (typeof window !== "undefined") {
              // Client Side: get token from Clerk
              if ((window as any).Clerk?.session) {
                try {
                  token = await (window as any).Clerk.session.getToken({ template: "supabase" });
                } catch (e) {
                  console.error("[Supabase Client Fetch] Failed to retrieve Clerk token:", e);
                }
              }
            } else {
              // Server Side: get token from Clerk server session
              try {
                const { auth } = await import("@clerk/nextjs/server");
                const authSession = await auth();
                token = await authSession.getToken({ template: "supabase" });
              } catch (e) {
                // In non-auth context (e.g. static rendering) token remains null
              }
            }

            const headers = new Headers(options.headers);
            if (token) {
              headers.set("Authorization", `Bearer ${token}`);
            }
            options.headers = headers;

            return fetch(url, options);
          },
        },
      })
    : null;

// Mock mode flag and local storage keys
let mockMode = !realSupabase;
const MOCK_SESSION_KEY = "dripego-mock-session";
const MOCK_PRODUCTS_KEY = "dripego-mock-products";
const MOCK_WAITLIST_KEY = "dripego-mock-waitlist";
const MOCK_ORDERS_KEY = "dripego-mock-orders";

// Helper functions for mock storage
function getLocalStorage(key: string, fallback: any) {
  if (typeof window === "undefined") return fallback;
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}

function setLocalStorage(key: string, val: any) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error("[Mock Supabase] LocalStorage save error:", e);
  }
}

// Default mock products matching the catalog schema
const DEFAULT_PRODUCTS = [
  {
    id: "1",
    name: "DRIPEGO GRAPHIC OVERSIZED TEE",
    slug: "statement-tee",
    thumbnail: "/products/tee_front.webp",
    images: ["/products/tee_back.webp"],
    collection: "Drop 001",
    price: 9600.00,
    gender: "unisex",
    stock_quantity: 12,
    status: "published",
    created_at: new Date().toISOString()
  },
  {
    id: "2",
    name: "OVERSIZED TOP BROWN",
    slug: "oversized-top-brown",
    thumbnail: "/products/tee_back.webp",
    images: ["/products/tee_front.webp"],
    collection: "Drop 002",
    price: 8400.00,
    gender: "women",
    stock_quantity: 5,
    status: "published",
    created_at: new Date().toISOString()
  },
  {
    id: "3",
    name: "STUDIO FOLD MINIMAL TEE",
    slug: "studio-fold-minimal-tee",
    thumbnail: "/products/tee_folded.webp",
    images: ["/products/tee_hanging.webp"],
    collection: "Drop 001",
    price: 11200.00,
    gender: "men",
    stock_quantity: 8,
    status: "published",
    created_at: new Date().toISOString()
  },
  {
    id: "4",
    name: "CAMPAIGN EXCLUSIVE HANG TEE",
    slug: "campaign-exclusive-hang-tee",
    thumbnail: "/products/tee_hanging.webp",
    images: ["/products/tee_folded.webp"],
    collection: "Drop 001",
    price: 9600.00,
    gender: "unisex",
    stock_quantity: 0,
    status: "published",
    created_at: new Date().toISOString()
  },
  {
    id: "5",
    name: "SIGNATURE CAPSULE HOODIE",
    slug: "signature-capsule-hoodie",
    thumbnail: "/products/tee_front.webp",
    images: ["/products/tee_back.webp"],
    collection: "Drop 002",
    price: 14500.00,
    gender: "unisex",
    stock_quantity: 15,
    status: "published",
    created_at: new Date().toISOString()
  },
  {
    id: "6",
    name: "ARCHIVE CARGO PIECE",
    slug: "archive-cargo-piece",
    thumbnail: "/products/tee_back.webp",
    images: ["/products/tee_folded.webp"],
    collection: "Drop 001",
    price: 16000.00,
    gender: "men",
    stock_quantity: 7,
    status: "published",
    created_at: new Date().toISOString()
  }
];

// Auth Listeners
const authListeners = new Set<(event: string, session: any) => void>();

function getMockSession() {
  return getLocalStorage(MOCK_SESSION_KEY, null);
}

function notifyAuthListeners(event: string, session: any) {
  authListeners.forEach((cb) => {
    try {
      cb(event, session);
    } catch (e) {
      console.error("[Mock Auth] Listener error:", e);
    }
  });
}

function switchToMockMode() {
  if (mockMode) return;
  console.warn("[Supabase] Unreachable (Failed to fetch). Switching to local Mock Mode.");
  mockMode = true;
  // Trigger existing auth listeners with mock session
  const session = getMockSession();
  notifyAuthListeners(session ? "SIGNED_IN" : "INITIAL_SESSION", session);
}

// Helper to wrap real/mock calls
async function runSafe<T>(realFn: () => Promise<T>, mockFn: () => Promise<T>): Promise<T> {
  if (mockMode || !realSupabase) {
    return mockFn();
  }
  try {
    return await realFn();
  } catch (err: any) {
    const isNetworkError =
      err instanceof TypeError &&
      (err.message.includes("Failed to fetch") ||
        err.message.includes("fetch failed") ||
        err.message.includes("getaddrinfo") ||
        err.message.includes("network error") ||
        err.message.includes("Load failed"));

    if (isNetworkError) {
      switchToMockMode();
      return mockFn();
    }
    throw err;
  }
}

// Mock auth client implementation
const mockAuth = {
  async getSession() {
    const session = getMockSession();
    return { data: { session }, error: null };
  },
  onAuthStateChange(callback: (event: string, session: any) => void) {
    authListeners.add(callback);
    
    // Trigger immediately with current mock session
    const session = getMockSession();
    setTimeout(() => {
      callback(session ? "SIGNED_IN" : "INITIAL_SESSION", session);
    }, 0);

    return {
      data: {
        subscription: {
          unsubscribe() {
            authListeners.delete(callback);
          },
        },
      },
    };
  },
  async signInWithOtp({ email }: { email: string }) {
    console.log("[Mock Auth] OTP request sent for:", email);
    return { data: {}, error: null };
  },
  async verifyOtp({ email, token }: { email: string; token: string }) {
    console.log("[Mock Auth] Verifying OTP code:", token, "for", email);
    const mockUser = {
      id: "mock-user-uuid-12345",
      email: email,
      user_metadata: {
        full_name: "Mock Member",
        phone: "+919876543210",
        gender: "men",
        dob: "1998-05-15",
      },
    };
    const mockSession = {
      access_token: "mock-access-token-jwt",
      user: mockUser,
    };
    setLocalStorage(MOCK_SESSION_KEY, mockSession);
    notifyAuthListeners("SIGNED_IN", mockSession);
    return { data: { user: mockUser, session: mockSession }, error: null };
  },
  async signInWithPassword({ email }: { email: string }) {
    console.log("[Mock Auth] Password Sign-in for:", email);
    const mockUser = {
      id: "mock-user-uuid-12345",
      email: email,
      user_metadata: {
        full_name: "Mock Member",
        phone: "+919876543210",
        gender: "men",
        dob: "1998-05-15",
      },
    };
    const mockSession = {
      access_token: "mock-access-token-jwt",
      user: mockUser,
    };
    setLocalStorage(MOCK_SESSION_KEY, mockSession);
    notifyAuthListeners("SIGNED_IN", mockSession);
    return { data: { user: mockUser, session: mockSession }, error: null };
  },
  async signInWithOAuth({ provider, options }: any) {
    console.log("[Mock Auth] Google OAuth redirect simulated for provider:", provider);
    const mockUser = {
      id: "mock-user-uuid-12345",
      email: "mock-oauth-user@example.com",
      user_metadata: {
        full_name: "Mock Member",
        phone: "+919876543210",
        gender: "men",
        dob: "1998-05-15",
      },
    };
    const mockSession = {
      access_token: "mock-access-token-jwt",
      user: mockUser,
    };
    setLocalStorage(MOCK_SESSION_KEY, mockSession);
    notifyAuthListeners("SIGNED_IN", mockSession);
    if (typeof window !== "undefined") {
      window.location.href = options?.redirectTo || "/dashboard";
    }
    return { data: { user: mockUser, session: mockSession }, error: null };
  },
  async signOut() {
    console.log("[Mock Auth] Signing out");
    setLocalStorage(MOCK_SESSION_KEY, null);
    notifyAuthListeners("SIGNED_OUT", null);
    return { error: null };
  },
};

// Helper to evaluate mock OR filters
function evaluateOrFilter(item: any, orString: string): boolean {
  const parts = orString.split(",");
  for (const part of parts) {
    const subParts = part.split(".");
    if (subParts.length >= 3) {
      const col = subParts[0];
      const op = subParts[1];
      const valStr = subParts.slice(2).join(".");
      
      const itemVal = item[col];
      let compareVal: any = valStr;
      
      if (typeof itemVal === "number") {
        compareVal = Number(valStr);
      } else if (typeof itemVal === "boolean") {
        compareVal = valStr === "true";
      }
      
      if (op === "eq" && itemVal == compareVal) {
        return true;
      }
      if (op === "neq" && itemVal != compareVal) {
        return true;
      }
    }
  }
  return false;
}

// Mock Database query processor
function executeMockQuery(table: string, chain: any[]): any {
  let items: any[] = [];
  if (table === "products") {
    items = getLocalStorage(MOCK_PRODUCTS_KEY, DEFAULT_PRODUCTS);
  } else if (table === "waitlist") {
    items = getLocalStorage(MOCK_WAITLIST_KEY, []);
  } else if (table === "orders") {
    items = getLocalStorage(MOCK_ORDERS_KEY, []);
  } else if (table === "categories") {
    items = [
      { id: "1", name: "T-Shirts", sort_order: 1 },
      { id: "2", name: "Hoodies", sort_order: 2 },
    ];
  } else if (table === "user_roles") {
    items = [{ user_id: "mock-user-uuid-12345", role: "admin" }];
  } else {
    items = getLocalStorage(`dripego-mock-table-${table}`, []);
  }

  let countValue: number | null = null;
  let isInsert = false;
  let isUpdate = false;
  let isDelete = false;
  let insertData: any = null;
  let updateData: any = null;
  let limitCount: number | null = null;
  let singleRow = false;

  const eqFilters: { col: string; val: any }[] = [];
  const neqFilters: { col: string; val: any }[] = [];
  const orFilters: string[] = [];
  const inFilters: { col: string; vals: any[] }[] = [];
  const orderSteps: { col: string; ascending: boolean }[] = [];

  for (const step of chain) {
    if (step.method === "select") {
      if (step.args[1]?.count) {
        countValue = items.length;
      }
    } else if (step.method === "insert") {
      isInsert = true;
      insertData = step.args[0];
    } else if (step.method === "update") {
      isUpdate = true;
      updateData = step.args[0];
    } else if (step.method === "delete") {
      isDelete = true;
    } else if (step.method === "eq") {
      eqFilters.push({ col: step.args[0], val: step.args[1] });
    } else if (step.method === "neq") {
      neqFilters.push({ col: step.args[0], val: step.args[1] });
    } else if (step.method === "or") {
      orFilters.push(step.args[0]);
    } else if (step.method === "in") {
      inFilters.push({ col: step.args[0], vals: step.args[1] });
    } else if (step.method === "limit") {
      limitCount = step.args[0];
    } else if (step.method === "order") {
      orderSteps.push({ col: step.args[0], ascending: step.args[1]?.ascending ?? true });
    } else if (step.method === "single") {
      singleRow = true;
    }
  }

  if (isInsert) {
    const records = Array.isArray(insertData) ? insertData : [insertData];
    const newRecords = records.map((record) => ({
      id: Math.random().toString(36).substring(2, 11),
      created_at: new Date().toISOString(),
      ...record,
    }));
    items = [...items, ...newRecords];

    if (table === "products") setLocalStorage(MOCK_PRODUCTS_KEY, items);
    else if (table === "waitlist") setLocalStorage(MOCK_WAITLIST_KEY, items);
    else if (table === "orders") setLocalStorage(MOCK_ORDERS_KEY, items);
    else setLocalStorage(`dripego-mock-table-${table}`, items);

    return { data: Array.isArray(insertData) ? newRecords : newRecords[0], count: null, error: null };
  }

  if (isUpdate) {
    items = items.map((item) => {
      let match = true;
      for (const filter of eqFilters) {
        if (item[filter.col] !== filter.val) match = false;
      }
      for (const filter of neqFilters) {
        if (item[filter.col] === filter.val) match = false;
      }
      for (const orStr of orFilters) {
        if (!evaluateOrFilter(item, orStr)) match = false;
      }
      return match ? { ...item, ...updateData } : item;
    });

    if (table === "products") setLocalStorage(MOCK_PRODUCTS_KEY, items);
    else if (table === "waitlist") setLocalStorage(MOCK_WAITLIST_KEY, items);
    else if (table === "orders") setLocalStorage(MOCK_ORDERS_KEY, items);
    else setLocalStorage(`dripego-mock-table-${table}`, items);

    return { data: null, count: null, error: null };
  }

  if (isDelete) {
    items = items.filter((item) => {
      let match = true;
      for (const filter of eqFilters) {
        if (item[filter.col] !== filter.val) match = false;
      }
      for (const filter of neqFilters) {
        if (item[filter.col] === filter.val) match = false;
      }
      for (const orStr of orFilters) {
        if (!evaluateOrFilter(item, orStr)) match = false;
      }
      return !match;
    });

    if (table === "products") setLocalStorage(MOCK_PRODUCTS_KEY, items);
    else if (table === "waitlist") setLocalStorage(MOCK_WAITLIST_KEY, items);
    else if (table === "orders") setLocalStorage(MOCK_ORDERS_KEY, items);
    else setLocalStorage(`dripego-mock-table-${table}`, items);

    return { data: null, count: null, error: null };
  }

  // Filter
  let result = [...items];
  for (const filter of eqFilters) {
    result = result.filter((item) => item[filter.col] === filter.val);
  }
  for (const filter of neqFilters) {
    result = result.filter((item) => item[filter.col] !== filter.val);
  }
  for (const filter of inFilters) {
    result = result.filter((item) => filter.vals.includes(item[filter.col]));
  }
  for (const orStr of orFilters) {
    result = result.filter((item) => evaluateOrFilter(item, orStr));
  }

  // Sort
  for (const order of orderSteps) {
    result.sort((a, b) => {
      const aVal = a[order.col];
      const bVal = b[order.col];
      if (aVal < bVal) return order.ascending ? -1 : 1;
      if (aVal > bVal) return order.ascending ? 1 : -1;
      return 0;
    });
  }

  // Limit
  if (limitCount !== null) {
    result = result.slice(0, limitCount);
  }

  if (countValue !== null) {
    countValue = result.length;
  }

  if (singleRow) {
    return { data: result[0] || null, count: countValue, error: null };
  }

  return { data: result, count: countValue, error: null };
}

// Chainable query builder wrapper
function createWrappedQueryBuilder(table: string, chain: any[] = []) {
  const builder: any = {
    select(...args: any[]) {
      chain.push({ method: "select", args });
      return builder;
    },
    eq(...args: any[]) {
      chain.push({ method: "eq", args });
      return builder;
    },
    neq(...args: any[]) {
      chain.push({ method: "neq", args });
      return builder;
    },
    or(...args: any[]) {
      chain.push({ method: "or", args });
      return builder;
    },
    in(...args: any[]) {
      chain.push({ method: "in", args });
      return builder;
    },
    order(...args: any[]) {
      chain.push({ method: "order", args });
      return builder;
    },
    limit(...args: any[]) {
      chain.push({ method: "limit", args });
      return builder;
    },
    single(...args: any[]) {
      chain.push({ method: "single", args });
      return builder;
    },
    insert(...args: any[]) {
      chain.push({ method: "insert", args });
      return builder;
    },
    update(...args: any[]) {
      chain.push({ method: "update", args });
      return builder;
    },
    delete(...args: any[]) {
      chain.push({ method: "delete", args });
      return builder;
    },
    then(onfulfilled?: any, onrejected?: any) {
      const promise = (async () => {
        if (mockMode || !realSupabase) {
          return executeMockQuery(table, chain);
        }
        try {
          let query = realSupabase.from(table);
          for (const step of chain) {
            query = (query as any)[step.method](...step.args);
          }
          return await query;
        } catch (err: any) {
          const isNetworkError =
            err instanceof TypeError &&
            (err.message.includes("Failed to fetch") ||
              err.message.includes("fetch failed") ||
              err.message.includes("getaddrinfo") ||
              err.message.includes("network error") ||
              err.message.includes("Load failed"));

          if (isNetworkError) {
            switchToMockMode();
            return executeMockQuery(table, chain);
          }
          throw err;
        }
      })();
      return promise.then(onfulfilled, onrejected);
    },
  };
  return builder;
}

// Storage API Mock
const mockStorage = {
  from(bucketName: string) {
    return {
      getPublicUrl(path: string) {
        return { data: { publicUrl: `/products/${path.split("/").pop() || "tee_front.webp"}` } };
      },
      async upload(filePath: string, file: any) {
        console.log(`[Mock Storage] Upload to bucket ${bucketName} at path ${filePath} successfully simulated.`, file);
        return { data: { path: filePath }, error: null };
      },
    };
  },
};

// Exported proxy client
export const supabase = {
  // Flag to check if we are in mock mode
  get isMock() {
    return mockMode;
  },

  // Stub Auth API (all real authentication is handled by Clerk)
  auth: {
    async getSession() {
      return { data: { session: null }, error: null };
    },
    onAuthStateChange(callback: (event: string, session: any) => void) {
      return {
        data: {
          subscription: {
            unsubscribe() {}
          },
        },
      };
    },
  },

  // Database API
  from(table: string) {
    return createWrappedQueryBuilder(table);
  },

  // Storage API
  get storage() {
    if (mockMode || !realSupabase) {
      return mockStorage;
    }
    return realSupabase.storage;
  },
} as any;
