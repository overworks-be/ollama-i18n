import { cyan } from 'yoctocolors';
import { SingleBar, Presets } from 'cli-progress';
import { RootLocaleData } from '@/core/types';

export function countStrings(data: RootLocaleData | RootLocaleData[]): number {
  let count = 0;

  if (Array.isArray(data)) {
    // Parcourt un tableau de RootLocaleData
    for (const obj of data) {
      count += countStrings(obj);
    }
  } else if (typeof data === 'object' && data !== null) {
    // Parcourt un objet
    for (const value of Object.values(data)) {
      if (typeof value === 'string') {
        count++;
      } else if (Array.isArray(value)) {
        for (const item of value) {
          count += typeof item === 'string' ? 1 : countStrings(item);
        }
      } else if (typeof value === 'object' && value !== null) {
        count += countStrings(value);
      }
    }
  }

  return count;
}
export function createProgressBar(locales: string[], totalStrings: number): SingleBar {
  return new SingleBar(
    {
      format: `Translating ${locales.length} locale files |${cyan('{bar}')}| {percentage}% | {value}/{total} strings`,
      barCompleteChar: '█',
      barIncompleteChar: '░',
      hideCursor: true,
    },
    Presets.shades_classic
  );
}

export function initializeProgressBar(locales: string[], totalStrings: number): SingleBar {
  return createProgressBar(locales, totalStrings);
}
