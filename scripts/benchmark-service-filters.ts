import { performance } from "node:perf_hooks";
import dataset from "../data/task1-service-explorer.json";
import {
  filterServices,
  DEFAULT_SERVICE_FILTERS,
} from "../lib/service-filters";
import type { ServiceExplorerData } from "../types/service";

const data = dataset as ServiceExplorerData;

const filters = {
  ...DEFAULT_SERVICE_FILTERS,
  search: "health",
  serviceTypes: ["package", "lab_test"] as const,
  cityNames: ["Bangkok"],
};

const runs = 10;
const timings: number[] = [];

for (let i = 0; i < runs; i++) {
  const start = performance.now();

  const result = filterServices(data, {
    ...filters,
    serviceTypes: [...filters.serviceTypes],
  });

  timings.push(performance.now() - start);

  if (i === 0) {
    console.log(`Matching services: ${result.total}`);
    console.log(
      `Service-type facet options: ${result.facets.serviceTypes.length}`,
    );
  }
}

timings.sort((a, b) => a - b);

console.log(`Dataset services: ${data.services.length}`);
console.log(`Runs: ${runs}`);
console.log(`Median duration: ${timings[Math.floor(runs / 2)].toFixed(2)} ms`);
console.log(`Maximum duration: ${Math.max(...timings).toFixed(2)} ms`);
