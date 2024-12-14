#!/usr/bin/env node

import path from 'path';
import { parseArgs } from '@/cli/args';
import { Translator } from '@/core/translator';
import { findLocaleFiles, readJSONFile, writeJSONFile } from '@/utils/file';
import { countStrings, createProgressBar } from '@/utils/progress';
import { validateContent } from '@/utils/validation';
import { pullModel } from '@/utils/ollama';
import { logger } from '@/utils/logger';

async function main() {
  try {
    const args = parseArgs();
    const sourceFile = path.join(args.dir, `${args.source}.json`);

    logger.info('Detecting locale files...');
    const allLocales = await findLocaleFiles(args.dir, args.source);
    const targetLocales = args.target ? [args.target] : allLocales;

    if (args.target && !allLocales.includes(args.target)) {
      throw new Error(`Target locale file '${args.target}.json' not found in ${args.dir}`);
    }
    logger.info(`Will translate to: ${targetLocales.join(', ')}\n`);

    logger.info(`Reading source file: ${sourceFile}`);
    const sourceData = await readJSONFile(sourceFile);
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
          let dataToTranslate = sourceData;
          const targetFile = path.join(args.dir, `${locale}.json`);

          if (args.cache) {
            try {
              const existingData = await readJSONFile(targetFile);
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
            } catch (error) {
              logger.info(`No existing translations found for ${locale}, will translate all keys`);
            }
          }

          const translatedData = await translator.translateObject(dataToTranslate, locale);

          if (args.cache) {
            try {
              const existingData = await readJSONFile(targetFile);
              Object.assign(existingData, translatedData);
              await writeJSONFile(targetFile, existingData);
            } catch {
              // write the new translations
              await writeJSONFile(targetFile, translatedData);
            }
          } else {
            // No caching
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

if (require.main === module) {
  main();
}

export { Translator } from '@/core/translator';
export * from '@/core/types';
