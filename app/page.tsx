import { ServiceExplorerPage } from "@/components/service-explorer";
import { Suspense } from "react";

export default function TaskOnePage() {
  return (
    <Suspense fallback={<div>Loading service explorer...</div>}>
      <ServiceExplorerPage />
    </Suspense>
  );
}
