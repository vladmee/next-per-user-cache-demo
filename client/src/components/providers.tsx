"use client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../lib/query";
import type { ReactNode } from "react";

// just setting up Tanstack Query. nothing to see here
export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
