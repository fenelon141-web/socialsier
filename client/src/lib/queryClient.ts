import { QueryClient, QueryFunction } from "@tanstack/react-query";

// iOS detection and API URL configuration
const isCapacitorIOS = (window as any).Capacitor?.isNativePlatform() && 
                       ((window as any).Capacitor?.platform === 'ios' || 
                        (window as any).Device?.info?.platform === 'ios');

const API_BASE_URL = isCapacitorIOS 
  ? 'https://hot-girl-hunt-fenelon141.replit.app'
  : import.meta.env.DEV 
    ? 'http://localhost:5000'
    : 'https://hot-girl-hunt-fenelon141.replit.app';

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// iOS fallback helper
async function getEmbeddedSpots() {
  const { embeddedValleyGirlSpots } = await import('../data/embedded-spots');
  return embeddedValleyGirlSpots;
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}${url}`, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });
    
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`${res.status}: ${text || res.statusText}`);
    }
    
    return await res.json();
  } catch (error) {
    // iOS fallback for spots endpoint
    if (isCapacitorIOS && url.includes('/api/spots')) {
      return await getEmbeddedSpots();
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
      // iOS fallback for spots endpoint
      if (isCapacitorIOS && (queryKey[0] as string).includes('/api/spots')) {
        return await getEmbeddedSpots() as any;
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
        // Don't retry iOS network errors
        if (error.message.includes('Load failed')) {
          return false;
        }
        return failureCount < 1;
      }
    },
    mutations: {
      retry: false,
    },
  },
});
