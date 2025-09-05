const HOSTNAME = "socialiser-4.fly.dev";

export const API_BASE_URL = `https://${HOSTNAME}`;
export const WS_BASE_URL = `wss://${HOSTNAME}`;

export const SUPABASE_URL = "https://pjociaiucneerhcsqduy.supabase.co";
export const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY_HERE";

export const isIOS =
  typeof navigator !== "undefined" &&
  /iPad|iPhone|iPod/.test(navigator.userAgent);

export const isMobile =
  typeof navigator !== "undefined" &&
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

export const isCapacitor =
  typeof window !== "undefined" && (window as any).Capacitor;

export const iosConfig = {
  api: { baseUrl: API_BASE_URL, timeout: 30000, retries: 3 },
  websocket: { url: `${WS_BASE_URL}/ws`, reconnectDelay: 3000, maxReconnectAttempts: 10, pingInterval: 30000, forceNew: true },
  location: { enableHighAccuracy: true, timeout: 15000, maximumAge: 300000 },
  ui: { preventZoom: true, useSafeArea: true, enableHaptics: true },
};

export const testServerConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`, { method: "GET", credentials: "include" });
    return response.ok;
  } catch {
    return false;
  }
};

