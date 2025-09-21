import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000, // 1 min fresh window (tune per widget)
      gcTime: 10 * 60_000,
      refetchOnWindowFocus: false,
      retry: 0,
    },
  },
});
