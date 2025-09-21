"use client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { qk } from "../../lib/keys";
import { apiUrl } from "@/lib/api-url";
import { timeAgo } from "@/lib/time-ago";

type Props = { userId: string };
type WidgetData = { value: string; ts: number };

// the module itself
function Fetching({ id, userId }: { id: number; userId: string }) {
  // Suspense query that handles the client cache
  const { data } = useSuspenseQuery<WidgetData>({
    queryKey: qk.widget(id, userId),
    queryFn: async () => {
      const r = await fetch(apiUrl(`/api/widget/${id}`), {
        credentials: "include",
      });
      if (!r.ok) {
        throw new Error(`Widget ${id} fetch failed: ${r.status}`);
      }
      return r.json();
    },
    // the configs are set in lib/query.ts but you can override those here for each module
  });

  return (
    <div>
      <div className="text-xl font-medium">{data.value}</div>
      <div className="text-xs text-neutral-500">
        updated: {new Date(data.ts).toLocaleTimeString()}{" "}
        <span className="opacity-70">({timeAgo(data.ts)})</span>
      </div>
    </div>
  );
}

// reuse the component
export default function W1(p: Props) {
  return <Fetching id={1} {...p} />;
}
export function W2(p: Props) {
  return <Fetching id={2} {...p} />;
}
export function W3(p: Props) {
  return <Fetching id={3} {...p} />;
}
export function W4(p: Props) {
  return <Fetching id={4} {...p} />;
}
export function W5(p: Props) {
  return <Fetching id={5} {...p} />;
}
