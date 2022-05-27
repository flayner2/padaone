export function filterYears(
    date: Date, minYear: number, maxYear: number): boolean {
  const year = date.getFullYear();

  return year >= minYear || year <= maxYear;
}
