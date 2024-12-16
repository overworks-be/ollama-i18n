#!/usr/bin/env node

import path from 'path';
import { parseArgs } from '@/cli/args';
import { Translator } from '@/core/translator';
import { findLocaleFiles, readJSONFile, writeJSONFile } from '@/utils/file';
import { countStrings, createProgressBar } from '@/utils/progress';
import { validateContent } from '@/utils/validation';
import { pullModel } from '@/utils/ollama';
import { logger } from '@/utils/logger';
import { RootLocaleData } from '@/core/types';

async function main() {
  try {
    const args = parseArgs();
    const sourceFile = path.join(args.dir, `${args.source}.json`);

    logger.info('Detecting locale files...');
    const allLocales = await findLocaleFiles(args.dir, args.source, !!args.target);
    const targetLocales = args.target ? [args.target] : allLocales;

    logger.info(`Will translate to: ${targetLocales.join(', ')}\n`);
    logger.info(`Reading source file: ${sourceFile}`);
    const sourceData = (await readJSONFile(sourceFile)) as RootLocaleData;
    validateContent(sourceData);

    // Make sure the model exists
    await pullModel(args.model);

    const stringsPerLocale = countStrings(sourceData);
    const totalStrings = stringsPerLocale * targetLocales.length;

    const progressBar = createProgressBar(targetLocales);
    progressBar.start(totalStrings, 0);

    const translator = new Translator({
      model: args.model,
      sourceLang: args.source,
    });
    translator.setProgressBar(progressBar);

    await Promise.all(
      targetLocales.map(async (locale) => {
        try {
          const targetFile = path.join(args.dir, `${locale}.json`);
          let dataToTranslate: RootLocaleData = sourceData;

          if (args.cache) {
            const existingData = await readJSONFile(targetFile, true);
            if (existingData) {
              dataToTranslate = Object.fromEntries(
                Object.entries(sourceData).filter(([key]) => !(key in existingData))
              );

              if (Object.keys(dataToTranslate).length === 0) {
                logger.info(`No new keys to translate for ${locale}`);
                return;
              }
              logger.info(
                `Found ${Object.keys(dataToTranslate).length} new keys to translate for ${locale}`
              );
              const translatedData = await translator.translateObject(dataToTranslate, locale);
              await writeJSONFile(targetFile, { ...existingData, ...translatedData });
            } else {
              logger.info(`No existing translations found for ${locale}, will translate all keys`);
              const translatedData = await translator.translateObject(sourceData, locale);
              await writeJSONFile(targetFile, translatedData);
            }
          } else {
            // No caching, just translate
            const translatedData = await translator.translateObject(sourceData, locale);
            await writeJSONFile(targetFile, translatedData);
          }

          logger.success(`Completed ${locale}`);
        } catch (error) {
          logger.error(
            `Failed ${locale}: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      })
    );

    progressBar.stop();
    logger.success('\nAll translations completed successfully! 🎉');
  } catch (error) {
    logger.error(error instanceof Error ? error.message : 'An unknown error occurred');
    process.exit(1);
  }
}

main();

export { Translator } from '@/core/translator';
export * from '@/core/types';
