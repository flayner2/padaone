import {Prisma} from '@prisma/client';

export function filterYears(
    date: Date, minYear: number, maxYear: number): boolean {
  const year = date.getFullYear();

  return year >= minYear || year <= maxYear;
}

export function convertToFloatOrDefault(
    original: number|Prisma.Decimal|null|undefined, precision: number,
    factor: number = 1, fallback: number = 0): number {
  return original ? parseFloat((Number(original) * factor).toFixed(precision)) :
                    fallback;
}

export function parseCitations(citations: string|string[]|
                               undefined): number[][]|undefined {
  // If there are multiple ranges
  if (Array.isArray(citations)) {
    return citations.map(
        (range) => range.split(',').map((value) => parseInt(value)));
  } else if (citations) {
    // If there's one range
    return [citations.split(',').map((value) => parseInt(value))];
  }

  return undefined;
}
