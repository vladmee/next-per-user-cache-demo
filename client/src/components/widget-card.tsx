// widget-card.tsx
"use client";
import type { ReactNode } from "react";

// --- Wrapper card for the data so we know which module is in what state
export default function WidgetCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="w-full h-full rounded-2xl shadow p-4 bg-neutral-900/40 border border-neutral-800 flex flex-col">
      <div className="text-sm text-neutral-400 mb-2">{title}</div>
      <div className="text-neutral-100 flex-1 overflow-hidden">{children}</div>
    </div>
  );
}

// --- Common skeleton component for everything ---
// eslint-disable-next-line react/display-name
WidgetCard.Skeleton = function () {
  return (
    <>
      <div className="h-6 w-2/3 bg-neutral-800 mb-2" />
      <div className="h-4 w-1/2 bg-neutral-800 mb-2" />
      <div className="h-4 w-1/3 bg-neutral-800" />
    </>
  );
};
