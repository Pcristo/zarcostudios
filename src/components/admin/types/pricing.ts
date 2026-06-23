export interface PricingPlan {
  id: string;
  nameEn: string;
  namePt: string;
  price: number;
  priceSuffixEn: string;
  priceSuffixPt: string;
  descriptionEn: string;
  descriptionPt: string;
  buttonTextEn: string;
  buttonTextPt: string;
  servicesEn: string[];
  servicesPt: string[];
  show: boolean;
  isHighlighted: boolean;
  discountPercentage: number;
  periodicity: string;
  order: number;
}

export interface PricingSettings {
  showSection: boolean;
}

export interface NewsletterSettings {
  showSection: boolean;
}

export interface Review {
  id: string;
  name: string;
  companyName: string;
  avatar: string;
  reviewTextEn: string;
  reviewTextPt: string;
  lang: "en" | "pt" | "both";
  show: boolean;
  order: number;
  rating: number;
  linkedInUsername?: string;
}

export interface TestimonialsSettings {
  showSection: boolean;
  displayMode: "grid" | "carousel";
}
