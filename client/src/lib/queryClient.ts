import { QueryClient, QueryFunction } from "@tanstack/react-query";

// iOS native apps can't connect to localhost, so we need special handling
const isCapacitorIOS = (window as any).Capacitor?.isNativePlatform() && 
                       ((window as any).Capacitor?.platform === 'ios' || 
                        (window as any).Device?.info?.platform === 'ios');

// Development and production URL detection with iOS fallback
const API_BASE_URL = isCapacitorIOS 
  ? 'https://hot-girl-hunt-fenelon141.replit.app'  // Always use production for iOS native
  : import.meta.env.DEV 
    ? 'http://localhost:5000'
    : 'https://hot-girl-hunt-fenelon141.replit.app';

console.log(`[QueryClient] API URL: ${API_BASE_URL}, isCapacitorIOS: ${isCapacitorIOS}`);

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<any> {
  console.log(`API Request: ${method} ${API_BASE_URL}${url}`);
  
  try {
    const res = await fetch(`${API_BASE_URL}${url}`, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    console.log(`API Response: ${res.status} ${res.statusText}`);
    
    if (!res.ok) {
      const text = await res.text();
      console.error(`API Error Response:`, text);
      throw new Error(`${res.status}: ${text || res.statusText}`);
    }
    
    const result = await res.json();
    console.log(`API Success:`, result);
    return result;
  } catch (error) {
    console.error(`API Request Failed:`, error);
    
    // iOS fallback for spots endpoint
    if (isCapacitorIOS && url.includes('/api/spots')) {
      console.log('[iOS Fallback] Using embedded spots data');
      const { embeddedValleyGirlSpots } = await import('../data/embedded-spots');
      return embeddedValleyGirlSpots;
    }
    
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      const res = await fetch(`${API_BASE_URL}${queryKey[0] as string}`, {
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    } catch (error) {
      console.error('Query fetch failed:', error);
      
      // iOS fallback for spots endpoint
      if (isCapacitorIOS && (queryKey[0] as string).includes('/api/spots')) {
        console.log('[iOS Fallback] Using embedded spots data for query');
        const { embeddedValleyGirlSpots } = await import('../data/embedded-spots');
        return embeddedValleyGirlSpots as any;
      }
      
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes cache
      retry: (failureCount, error: Error) => {
        // Reduce retry spam on iOS
        if (error.message.includes('Load failed')) {
          console.warn(`iOS network error, skipping retry:`, error.message);
          return false; // Don't retry iOS "Load failed" errors
        }
        console.error(`Query retry ${failureCount}:`, error.message);
        return failureCount < 1; // Reduce retries from 2 to 1
      }
    },
    mutations: {
      retry: false,
    },
  },
});
