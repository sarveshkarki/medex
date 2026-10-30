# MedEx – Healthcare Service Explorer

A responsive healthcare service discovery experience built with Next.js, React, TypeScript, and Tailwind CSS.

The application allows users to explore healthcare services from multiple providers, search the catalogue, apply faceted filters, compare pricing, and navigate results efficiently.

## Getting Started

### Requirements

- Node.js (LTS recommended)
- npm

### Installation

Clone the repository and install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The Service Explorer is available on the homepage at `/`.

### Environment Variables

The application supports an optional mock API failure simulation for testing error handling.

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_MOCK_API_FAILURE=false
```

Set the value to `true` to simulate API failures. Restart the development server after changing the variable.

When enabled, the mock API requests fail and the application displays an error state with a retry action.

## Technology Stack

- **Next.js 16** – Application framework.
- **React 19** – UI development.
- **TypeScript** – Type safety.
- **Tailwind CSS** – Styling and responsive layouts.
- **TanStack Query** – Independent data fetching, caching, and query state management.
- **Lucide React** – Icons.

## Application Architecture

The implementation separates data fetching, filtering logic, URL state management, and presentation components.

### Data layer

The mock dataset is stored in:

`data/task1-service-explorer.json`

The API layer exposes three independent mock operations:

- `getCategories()`
- `getProviders()`
- `getServices()`

Each operation simulates network latency. TanStack Query manages the requests independently, and the results are combined into the existing service explorer data structure.

A combined `getServiceExplorerData()` helper is also retained for validation scripts.

### Filtering and search

Filtering logic is centralized in:

`lib/service-filters.ts`

The implementation supports:

- Multiple service types.
- Category and subcategory selection.
- Searchable provider selection.
- City and country filters.
- Currency-specific price filtering.
- Home-test availability.
- Free-text search across service titles, provider names, and categories.
- Sorting by relevance, price, and provider rating.

Facet counts are calculated dynamically based on the other active filters. Inactive categories and providers are excluded from eligible results.

Nested categories are handled recursively to support the dataset's category hierarchy and duplicate slugs across different service types.

### URL state management

Filter selections, search, sorting, and pagination are synchronized with URL query parameters.

This supports:

- Sharing filtered result URLs.
- Restoring selections after refreshing.
- Browser Back and Forward navigation.
- Direct access to a particular filtered result state.

### Component structure

The Service Explorer is divided into smaller components for maintainability:

- Search and toolbar.
- Desktop filter panel.
- Mobile filter drawer.
- Provider result groups.
- Service cards.
- Pagination.

Provider groups display up to three matching services initially, with an option to expand the remaining results.

## Key Implementation Decisions

### Currency-aware pricing

Prices from different currencies are not treated as directly comparable.

Price filtering is scoped to the selected currency rather than applying an incorrect cross-currency comparison.

Discounted prices are calculated using the service pricing rules. Invalid pricing records that produce negative final prices are excluded from price-based calculations rather than causing the entire explorer to fail.

Wellness services use their available pricing options where applicable.

### Faceted filtering

Facet counts are recalculated using the active filters other than the facet currently being evaluated.

This allows users to understand how many results are available before selecting an option.

### Pagination

Results are paginated at the service level, with pagination state reflected in the URL. Filter and sorting changes reset pagination to the first page.

### Mobile experience

The mobile filter drawer supports pending filter selections and displays the expected result count before applying them.

### Error handling

The application provides loading skeletons, an error state, and a retry action.

Mock API failures can be enabled through the `NEXT_PUBLIC_MOCK_API_FAILURE` environment variable.

## Performance

The filtering and facet
