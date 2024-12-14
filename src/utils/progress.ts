import { cyan } from 'yoctocolors';
import { SingleBar, Presets } from 'cli-progress';
import { RootLocaleData } from '@/core/types';

export function countStrings(obj: RootLocaleData): number {
  let count = 0;
  for (const value of Object.values(obj)) {
    if (typeof value === 'string') {
      count++;
    } else {
      count += countStrings(value);
    }
  }
  return count;
}

export function createProgressBar(locales: string[]): SingleBar {
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
