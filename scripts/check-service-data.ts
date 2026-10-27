import { getServiceExplorerData } from "../lib/api/services";

async function main() {
  const data = await getServiceExplorerData(0);

  console.log("Categories:", data.categories.length);
  console.log("Providers:", data.providers.length);
  console.log("Services:", data.services.length);

  if (
    data.categories.length !== 13 ||
    data.providers.length !== 67 ||
    data.services.length !== 3200
  ) {
    throw new Error("Dataset counts do not match expectations.");
  }

  console.log("Service data verification passed.");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
