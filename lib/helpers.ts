import {Prisma} from '@prisma/client';

export function filterYears(
    date: Date, minYear: number, maxYear: number): boolean {
  const year = date.getFullYear();

  return year >= minYear || year <= maxYear;
}

export function convertToFloatOrDefault(
    original: number|Prisma.Decimal|null, precision: number, factor: number = 1,
    fallback: number = 0): number {
  return original ? parseFloat((Number(original) * factor).toFixed(precision)) :
                    fallback;
}
