import { supabase, isSupabaseConfigured } from "./supabase";

// Demo mode — only enabled when VITE_ENABLE_DEMO=true in .env
const DEMO_ENABLED = import.meta.env.VITE_ENABLE_DEMO === "true";

// Simple hash for fallback password verification (not crypto-grade, but prevents plain-text storage)
async function simpleHash(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export interface RegisterData {
  email: string;
  password: string;
  restaurantName: string;
  ownerName: string;
  phone: string;
  plan: "trial" | "basic" | "pro" | "enterprise";
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  error?: string;
  restaurantId?: string;
  restaurant?: { id: string; name: string; owner_name: string; phone: string; email: string | null; plan: string; trial_ends: string | null; created_at: string };
}

export async function registerRestaurant(data: RegisterData): Promise<AuthResult> {
  if (!isSupabaseConfigured()) {
    return fallbackRegister(data);
  }

  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { owner_name: data.ownerName, phone: data.phone },
      },
    });

    if (authError) {
      // If Supabase auth fails, fall back to local so user can still try the app
      console.warn("Supabase auth signup failed, using fallback:", authError.message);
      return fallbackRegister(data);
    }

    if (!authData.user) {
      return fallbackRegister(data);
    }

    // Try to insert restaurant record
    const { data: restaurant, error: restError } = await supabase
      .from("restaurants")
      .insert({
        name: data.restaurantName,
        owner_name: data.ownerName,
        phone: data.phone,
        email: data.email,
        plan: data.plan,
        user_id: authData.user.id,
        trial_ends: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select("id")
      .single();

    if (restError) {
      // Restaurant insert failed (possibly RLS or schema issue)
      // Still save locally so user experience is not broken
      console.warn("Restaurant insert failed, saving locally:", restError.message);
      return fallbackRegister(data);
    }

    // Also save to localStorage for immediate access
    fallbackRegister(data);
    return { success: true, restaurantId: restaurant.id };
  } catch (err) {
    console.warn("Registration error, using fallback:", err);
    return fallbackRegister(data);
  }
}

const DEMO_EMAIL = "demo@battoclub.com";
const DEMO_PASSWORD = "demo123";  // Only used when DEMO_ENABLED is true

export async function loginUser(data: LoginData): Promise<AuthResult> {
  if (!isSupabaseConfigured()) {
    return fallbackLogin(data);
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  // If demo mode is enabled and demo credentials match, use local demo so app works out of the box
  if (error && DEMO_ENABLED && data.email === DEMO_EMAIL && data.password === DEMO_PASSWORD) {
    return fallbackLogin(data);
  }

  if (error) return { success: false, error: error.message };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: true };

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, name, owner_name, phone, email, plan, trial_ends, created_at")
    .eq("user_id", user.id)
    .maybeSingle();

  return { success: true, restaurantId: restaurant?.id, restaurant: restaurant ?? undefined };
}

export async function logoutUser() {
  if (isSupabaseConfigured()) {
    await supabase.auth.signOut();
  }
  localStorage.removeItem("battoclub_user");
}

export async function getCurrentUser() {
  if (!isSupabaseConfigured()) {
    const saved = localStorage.getItem("battoclub_user");
    return saved ? JSON.parse(saved) : null;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!restaurant) return null;
  return { ...(restaurant as Record<string, unknown>), userId: user.id, email: user.email };
}

export function onAuthStateChange(callback: (user: unknown) => void) {
  if (!isSupabaseConfigured()) return { unsubscribe: () => { } };

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (_event, session) => {
      if (session?.user) {
        const user = await getCurrentUser();
        callback(user);
      } else {
        callback(null);
      }
    }
  );

  return { unsubscribe: () => subscription.unsubscribe() };
}

async function fallbackRegister(data: RegisterData): Promise<AuthResult> {
  const passwordHash = await simpleHash(data.password);
  const user = {
    restaurantName: data.restaurantName,
    ownerName: data.ownerName,
    phone: data.phone,
    email: data.email,
    plan: data.plan,
    passwordHash,
    registeredAt: new Date().toISOString(),
    trialEnds: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  };
  localStorage.setItem("battoclub_user", JSON.stringify(user));
  return { success: true };
}

async function fallbackLogin(data: LoginData): Promise<AuthResult> {
  // Demo account — only when demo mode is enabled
  if (DEMO_ENABLED && data.email === DEMO_EMAIL && data.password === DEMO_PASSWORD) {
    const user = {
      restaurantName: "Demo Restaurant",
      ownerName: "Demo User",
      phone: "012345678",
      email: DEMO_EMAIL,
      plan: "pro",
      registeredAt: new Date().toISOString(),
      trialEnds: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    };
    localStorage.setItem("battoclub_user", JSON.stringify(user));
    return { success: true };
  }

  // Check locally-registered users — verify both email AND password
  const saved = localStorage.getItem("battoclub_user");
  if (saved) {
    const user = JSON.parse(saved);
    const passwordHash = await simpleHash(data.password);
    if (user.email === data.email && user.passwordHash === passwordHash) {
      return { success: true };
    }
  }

  return { success: false, error: "Invalid email or password" };
}
