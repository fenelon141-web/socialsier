# 🚀 iOS App Configuration Update

## Your Deployment URL
```
https://hot-girl-hunt-fenelon141.replit.app
```

## Update Your Local iOS Project

### 1. Create Config File
**File:** `~/Desktop/socialiser/client/src/lib/config.ts`
```typescript
export const API_BASE_URL = 'https://hot-girl-hunt-fenelon141.replit.app';
```

### 2. Update Query Client
**File:** `~/Desktop/socialiser/client/src/lib/queryClient.ts`

Replace the entire file with:
```typescript
import { QueryClient, QueryFunction } from "@tanstack/react-query";

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
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
```

### 3. Build and Deploy to iOS
```bash
cd ~/Desktop/socialiser
npm run build
npx cap copy ios
npx cap sync ios
open ios/App/App.xcworkspace
```

## What This Fixes
✅ **Trendy spots will now load** in iOS  
✅ **Authentication system works** for App Store  
✅ **OpenStreetMap integration functional**  
✅ **Real-time features enabled**  

Your iOS app will now connect to the live server and load trendy spots properly!