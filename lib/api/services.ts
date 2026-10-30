import dataset from "@/data/task1-service-explorer.json";
import type {
  Category,
  Provider,
  Service,
  ServiceExplorerData,
} from "@/types/service";

const DEFAULT_LATENCY_MS = 350;

async function simulateLatency(latencyMs = DEFAULT_LATENCY_MS) {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, latencyMs);
  });

  if (process.env.NEXT_PUBLIC_MOCK_API_FAILURE === "true") {
    throw new Error("Simulated API failure");
  }
}

export async function getCategories(
  latencyMs = DEFAULT_LATENCY_MS,
): Promise<Category[]> {
  await simulateLatency(latencyMs);
  return (dataset as ServiceExplorerData).categories;
}

export async function getProviders(
  latencyMs = DEFAULT_LATENCY_MS,
): Promise<Provider[]> {
  await simulateLatency(latencyMs);
  return (dataset as ServiceExplorerData).providers;
}

export async function getServices(
  latencyMs = DEFAULT_LATENCY_MS,
): Promise<Service[]> {
  await simulateLatency(latencyMs);
  return (dataset as ServiceExplorerData).services;
}

export async function getServiceExplorerData(
  latencyMs = DEFAULT_LATENCY_MS,
): Promise<ServiceExplorerData> {
  const [categories, providers, services] = await Promise.all([
    getCategories(latencyMs),
    getProviders(latencyMs),
    getServices(latencyMs),
  ]);

  return {
    categories,
    providers,
    services,
  };
}
