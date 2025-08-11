import { QueryClient, QueryFunction } from "@tanstack/react-query";

// iOS Production Server URL
const API_BASE_URL = 'https://hot-girl-hunt-fenelon141.replit.app';

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
): Promise<Response> {
  const res = await fetch(`${API_BASE_URL}${url}`, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(`${API_BASE_URL}${queryKey[0] as string}`, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
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
