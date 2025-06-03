import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { TCGPlayerPrice, ApiCard } from "../types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | null | undefined, currency: string = 'USD'): string {
  if (amount === null || amount === undefined) {
    return 'N/A';
  }
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (e) {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

export function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const getMarketPrice = (prices?: { [key: string]: TCGPlayerPrice | undefined }): number | null => {
  if (!prices) return null;
  
  const priceKeysInOrder: string[] = [
    'holofoil', 
    'reverseHolofoil', 
    'normal', 
    '1stEditionHolofoil',
    'unlimitedHolofoil',
    '1stEditionNormal',
    'unlimitedNormal'
  ];

  for (const key of priceKeysInOrder) {
    if (prices[key]?.market) return prices[key]!.market;
  }
  for (const key of priceKeysInOrder) {
    if (prices[key]?.mid) return prices[key]!.mid;
  }
  for (const key of priceKeysInOrder) {
    if (prices[key]?.low) return prices[key]!.low;
  }
  for (const key in prices) {
    if (prices[key]?.market) return prices[key]!.market;
    if (prices[key]?.mid) return prices[key]!.mid;
    if (prices[key]?.low) return prices[key]!.low;
  }
  return null;
};

export interface PriceDetail {
  type: string;
  low: number | null;
  mid: number | null;
  high: number | null;
  market: number | null;
  directLow: number | null;
  quantity: number; // Added quantity property
  condition: string; // Added condition property
}

export const getTcgPlayerPriceDetails = (card?: ApiCard): PriceDetail[] => {
  if (!card?.tcgplayer?.prices) return [];
  const prices = card.tcgplayer.prices;
  const details: PriceDetail[] = [];

  for (const key in prices) {
    if (Object.prototype.hasOwnProperty.call(prices, key) && prices[key]) {
      const priceData = prices[key]!;
      const typeName = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      details.push({
        type: typeName,
        low: priceData.low,
        mid: priceData.mid,
        high: priceData.high,
        market: priceData.market,
        directLow: priceData.directLow,
        quantity: priceData.quantity, // Assuming quantity is available in priceData
        condition: priceData.condition, // Assuming condition is available in priceData
      });
    }
  }
  return details.filter(d => d.low || d.mid || d.high || d.market || d.directLow);
};
