import type {
  TaxCalculationInput,
  TaxCalculationResult,
} from "./tax-types";

function assertValidInput(input: TaxCalculationInput) {
  if (!Number.isInteger(input.unitPrice) || input.unitPrice < 0) {
    throw new Error("INVALID_UNIT_PRICE");
  }

  if (!Number.isInteger(input.quantity) || input.quantity <= 0) {
    throw new Error("INVALID_QUANTITY");
  }

  if (!Number.isInteger(input.taxRate) || input.taxRate < 0) {
    throw new Error("INVALID_TAX_RATE");
  }
}

export function calculateTax(
  input: TaxCalculationInput
): TaxCalculationResult {
  assertValidInput(input);

  const subtotal =
    input.unitPrice * input.quantity;

  if (input.pricingMode === "TAX_EXCLUSIVE") {
    const tax = Math.round(
      (subtotal * input.taxRate) / 10000
    );

    return {
      subtotal,
      tax,
      netAmount: subtotal,
      grossAmount: subtotal + tax,
      taxRate: input.taxRate,
    };
  }

  // TAX_INCLUSIVE
  //
  // subtotal is already the customer-facing
  // gross amount. Extract the tax portion.
  const grossAmount = subtotal;

  const netAmount = Math.round(
    (grossAmount * 10000) /
      (10000 + input.taxRate)
  );

  const tax = grossAmount - netAmount;

  return {
    subtotal,
    tax,
    netAmount,
    grossAmount,
    taxRate: input.taxRate,
  };
}
