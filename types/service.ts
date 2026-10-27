export type ServiceType =
  | "package"
  | "lab_test"
  | "wellness"
  | "service"
  | "insurance";

export type Currency = "THB" | "NPR" | "INR";

export type PriceAdjustmentType = "percent" | "amount" | null;

export interface Category {
  id: string;
  title: string;
  slug: string;
  type: ServiceType;
  position: number;
  status: boolean;
  parentId: string | null;
  children?: Category[];
}

export interface ProviderCountry {
  id: number;
  name: string;
  alphaCode: string;
}

export interface ProviderCity {
  id: string;
  name: string;
  slug: string;
}

export interface ProviderInformation {
  companyName: string;
  slug: string;
  types: ServiceType[];
  currency: Currency;
  city: ProviderCity;
  country: ProviderCountry;
  rating: number;
  reviewCount: number;
}

export interface Provider {
  id: number;
  name: string;
  username: string;
  status: string;
  providerInformation: ProviderInformation;
}

export interface WellnessPricing {
  id: string;
  durationInMinutes: number;
  price: string;
  discount: string | null;
  discountType: PriceAdjustmentType;
  serviceCharge: string | null;
  serviceChargeType: PriceAdjustmentType;
}

export interface Service {
  id: string;
  title: string;
  slug: string;
  type: ServiceType;
  userId: number;
  categoryId: string;
  subCategoryId: string | null;
  price: string | null;
  discount: string | null;
  discountType: PriceAdjustmentType;
  serviceCharge: string | null;
  serviceChargeType: PriceAdjustmentType;
  status: boolean;
  testAtHome: boolean;
  homeTestCharge: string | null;
  wellnessPricing: WellnessPricing[];
  createdAt: string;
}

export interface ServiceExplorerData {
  _readme?: string;
  categories: Category[];
  providers: Provider[];
  services: Service[];
}
