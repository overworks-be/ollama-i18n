#!/usr/bin/env node

import { parseArgs } from '@/cli/args';
import { Translator } from '@/core/translator';
import { LocaleData } from '@/core/types';
import { findLocaleFiles, readJSONFile, writeJSONFile } from '@/utils/file';
import { logger } from '@/utils/logger';
import path from 'path';

async function translateLocale(
  translator: Translator,
  sourceData: LocaleData,
  targetLang: string,
  dir: string
): Promise<void> {
  try {
    logger.info(`Starting translation for ${targetLang}...`);
    const translatedData = await translator.translateObject(sourceData, targetLang);

    const targetFile = path.join(dir, `${targetLang}.json`);
    await writeJSONFile(targetFile, translatedData);
    logger.success(`Successfully translated to ${targetLang}`);
  } catch (error) {
    logger.error(
      `Failed to translate ${targetLang}: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

async function main() {
  try {
    const args = parseArgs();
    const sourceFile = path.join(args.dir, `${args.source}.json`);

    const targetLocales = await findLocaleFiles(args.dir, args.source);
    logger.info(`Found ${targetLocales.length} locale files to translate.`);

    logger.info(`Reading source file: ${sourceFile}`);
    const sourceData = await readJSONFile(sourceFile);

    const translator = new Translator({
      model: args.model,
      sourceLang: args.source,
    });

    const promises = targetLocales.map((locale) =>
      translateLocale(translator, sourceData, locale, args.dir)
    );
    await Promise.all(promises);

    logger.success('Translation completed successfully!');
  } catch (error) {
    logger.error(error instanceof Error ? error.message : 'An unknown error occurred');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { Translator } from '@/core/translator';
export * from '@/core/types';
