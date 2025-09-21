"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import WidgetCard from "./widget-card";
import ErrorBoundary from "./error-boundary";

// This structure is a bit repetitive
// The point is, each component should be treated as an individual entity
// with its own loading state, suspense fallback, error fallback

// 1. Display the loading state of dynamic while we load the component (the .js chunk)
// 2. Once the component is loaded, we trigger a fetch in useSuspenseQuery, this displays the fallback state in Suspense
// 3. When the data is ready -> display the component
// 3.1. If it throws, we have the ErrorBoundary to catch it and display a fallback

// All these are independent! Whichever module is ready or errors etc doesn't concern the others

const W1 = dynamic<{ userId: string }>(
  () => import("./widgets").then((m) => m.default),
  {
    ssr: false,
    loading: () => <WidgetCard.Skeleton />,
  }
);
const W2 = dynamic<{ userId: string }>(
  () => import("./widgets").then((m) => m.W2),
  {
    ssr: false,
    loading: () => <WidgetCard.Skeleton />,
  }
);
const W3 = dynamic<{ userId: string }>(
  () => import("./widgets").then((m) => m.W3),
  {
    ssr: false,
    loading: () => <WidgetCard.Skeleton />,
  }
);
const W4 = dynamic<{ userId: string }>(
  () => import("./widgets").then((m) => m.W4),
  {
    ssr: false,
    loading: () => <WidgetCard.Skeleton />,
  }
);
const W5 = dynamic<{ userId: string }>(
  () => import("./widgets").then((m) => m.W5),
  {
    ssr: false,
    loading: () => <WidgetCard.Skeleton />,
  }
);

export default function WidgetsGrid({ userId }: { userId: string }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 max-w-7xl w-full">
      <div className="md:col-span-4 w-full aspect-video">
        <ErrorBoundary fallback={<WidgetCard.Skeleton />}>
          <Suspense fallback={<WidgetCard.Skeleton />}>
            <WidgetCard title="Widget 1">
              <W1 userId={userId} />
            </WidgetCard>
          </Suspense>
        </ErrorBoundary>
      </div>

      <div className="md:col-span-4 w-full aspect-video">
        <ErrorBoundary fallback={<WidgetCard.Skeleton />}>
          <Suspense fallback={<WidgetCard.Skeleton />}>
            <WidgetCard title="Widget 2">
              <W2 userId={userId} />
            </WidgetCard>
          </Suspense>
        </ErrorBoundary>
      </div>

      <div className="md:col-span-4 w-full aspect-video">
        <ErrorBoundary fallback={<WidgetCard.Skeleton />}>
          <Suspense fallback={<WidgetCard.Skeleton />}>
            <WidgetCard title="Widget 3">
              <W3 userId={userId} />
            </WidgetCard>
          </Suspense>
        </ErrorBoundary>
      </div>

      <div className="md:col-span-6 w-full aspect-video">
        <ErrorBoundary fallback={<WidgetCard.Skeleton />}>
          <Suspense fallback={<WidgetCard.Skeleton />}>
            <WidgetCard title="Widget 4">
              <W4 userId={userId} />
            </WidgetCard>
          </Suspense>
        </ErrorBoundary>
      </div>

      <div className="md:col-span-6 w-full aspect-video">
        <ErrorBoundary fallback={<WidgetCard.Skeleton />}>
          <Suspense fallback={<WidgetCard.Skeleton />}>
            <WidgetCard title="Widget 5">
              <W5 userId={userId} />
            </WidgetCard>
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
}
