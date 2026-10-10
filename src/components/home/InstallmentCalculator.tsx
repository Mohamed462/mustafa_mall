import React from 'react';

export interface InstallmentCalculatorProps {
  initialPrice?: number;
  productName?: string;
  isCompact?: boolean;
}

/**
 * @deprecated Installments have been removed from the mall.
 */
export const InstallmentCalculator: React.FC<InstallmentCalculatorProps> = () => {
  return null;
};
