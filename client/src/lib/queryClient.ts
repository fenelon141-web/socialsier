import { QueryClient, QueryFunction } from "@tanstack/react-query";

const HOSTNAME = "socialiser-4.fly.dev";
const API_BASE_URL = `https://${HOSTNAME}`;  // ✅ always use Fly.io
const WS_BASE_URL = `wss://${HOSTNAME}`;

// iOS fallback helper
async function getEmbeddedSpots() {
  const { embeddedValleyGirlSpots } = await import('../data/embedded-spots');
  return embeddedValleyGirlSpots;
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown
): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}${url}`, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    await throwIfResNotOk(res);
    return await res.json();
  } catch (error) {
    // fallback for spots if network fails
    if (url.includes('/api/spots')) {
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
    const url = queryKey[0] as string;
    try {
      const res = await fetch(`${API_BASE_URL}${url}`, {
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    } catch (error) {
      if (url.includes('/api/spots')) {
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
      staleTime: 5 * 60 * 1000,
      retry: (failureCount, error: Error) => {
        if (error.message.includes('Load failed')) {
          return false;
        }
        return failureCount < 1;
      },
    },
    mutations: {
      retry: false,
    },
  },
});
