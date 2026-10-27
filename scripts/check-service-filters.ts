import assert from "node:assert/strict";
import dataset from "@/data/task1-service-explorer.json";
import { filterServices, DEFAULT_SERVICE_FILTERS } from "@/lib/service-filters";
import type { ServiceExplorerData } from "@/types/service";

const data = dataset as ServiceExplorerData;

const all = filterServices(data, DEFAULT_SERVICE_FILTERS);

assert.ok(all.total > 0, "Expected active services in the dataset");
assert.ok(all.services.length <= DEFAULT_SERVICE_FILTERS.pageSize);
assert.ok(all.facets.serviceTypes.length > 0);
assert.ok(all.facets.categories.length > 0);

const search = filterServices(data, {
  ...DEFAULT_SERVICE_FILTERS,
  search: "Riverside",
});

assert.ok(search.total > 0, "Provider-name search should find services");

const homeTests = filterServices(data, {
  ...DEFAULT_SERVICE_FILTERS,
  homeTestOnly: true,
});

assert.ok(
  homeTests.services.every((service) => service.testAtHome),
  "Home-test filtering must return only home-test services",
);

const noResults = filterServices(data, {
  ...DEFAULT_SERVICE_FILTERS,
  search: "this-service-should-not-exist-12345",
});

const bangkok = filterServices(data, {
  ...DEFAULT_SERVICE_FILTERS,
  cityNames: ["Bangkok"],
});

assert.ok(
  bangkok.services.every((service) => {
    const provider = data.providers.find((item) => item.id === service.userId);
    return provider?.providerInformation.city.name === "Bangkok";
  }),
  "City filter must return only Bangkok providers",
);

const multiType = filterServices(data, {
  ...DEFAULT_SERVICE_FILTERS,
  serviceTypes: ["lab_test", "package"],
});

assert.ok(
  multiType.services.every((service) =>
    ["lab_test", "package"].includes(service.type),
  ),
  "Multi-select service types should include only selected types",
);

const selectedProviderIds = data.providers
  .filter((provider) => provider.status === "active")
  .slice(0, 2)
  .map((provider) => provider.id);

const multiProvider = filterServices(data, {
  ...DEFAULT_SERVICE_FILTERS,
  providerIds: selectedProviderIds,
});

assert.ok(
  multiProvider.services.every((service) =>
    selectedProviderIds.includes(service.userId),
  ),
  "Multi-select provider filter should include only selected providers",
);

const typeFacet = bangkok.facets.serviceTypes.find(
  (facet) => facet.value === "lab_test",
);

assert.ok(typeFacet, "Expected a lab-test facet option");
assert.ok(typeFacet.count >= 0, "Facet counts must never be negative");

const bangkokLabTests = data.services.filter((service) => {
  const provider = data.providers.find((item) => item.id === service.userId);

  return (
    service.status &&
    provider?.status === "active" &&
    provider.providerInformation.city.name === "Bangkok" &&
    service.type === "lab_test"
  );
});

const bangkokLabTestFacet = bangkok.facets.serviceTypes.find(
  (facet) => facet.value === "lab_test",
);

assert.ok(bangkokLabTestFacet, "Expected lab-test facet");
assert.equal(
  bangkokLabTestFacet.count,
  bangkokLabTests.length,
  "Bangkok lab-test facet count should equal the actual matching service count",
);

assert.equal(noResults.total, 0);

console.log("Service filter verification passed.");
