export type TaxPricingMode =
  | "TAX_INCLUSIVE"
  | "TAX_EXCLUSIVE";

export type TaxCalculationInput = {
  unitPrice: number;
  quantity: number;
  taxRate: number;
  pricingMode: TaxPricingMode;
};

export type TaxCalculationResult = {
  subtotal: number;
  tax: number;
  netAmount: number;
  grossAmount: number;
  taxRate: number;
};
