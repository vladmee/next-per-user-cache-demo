import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { requireSession } from "../../lib/auth";
import { queryClient } from "../../lib/query";
import WidgetsGrid from "@/components/widgets-grid";
import BackHomeButton from "@/components/back-button";
import { getBaseUrl } from "@/lib/base-url";
import { cookies } from "next/headers";
import { qk } from "@/lib/keys";

async function prefetchFastWidgets(userId: string) {
  const base = await getBaseUrl();
  const cookie = (await cookies()).toString();
  // Prefetch the fastest endpoint (W1) so we have something to show immediately.
  queryClient.prefetchQuery({
    queryKey: qk.widget(1, userId),
    queryFn: () =>
      fetch(`${base}/api/widget/1`, {
        headers: { cookie },
      }).then((r) => r.json()),
  });
}

export default async function Page() {
  const { userId } = await requireSession();

  await prefetchFastWidgets(userId);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BackHomeButton />
      <WidgetsGrid userId={userId} />
    </HydrationBoundary>
  );
}
