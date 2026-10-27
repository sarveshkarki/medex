import dataset from "@/data/task1-service-explorer.json";
import type { ServiceExplorerData } from "@/types/service";

const DEFAULT_LATENCY_MS = 350;

/**
 * Simulates a network request for the service explorer dataset.
 * The delay can be overridden in tests to avoid unnecessary waiting.
 */
export async function getServiceExplorerData(
  latencyMs = DEFAULT_LATENCY_MS,
): Promise<ServiceExplorerData> {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, latencyMs);
  });

  return dataset as ServiceExplorerData;
}
