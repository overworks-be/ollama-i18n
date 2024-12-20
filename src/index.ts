#!/usr/bin/env node

import path from 'path';
import fs from 'fs/promises';
import { parseArgs } from '@/cli/args';
import { Translator } from '@/core/translator';
import { readJSONFile, writeJSONFile } from '@/utils/file';
import { countStrings, initializeProgressBar } from '@/utils/progress';
import { validateContent } from '@/utils/validation';
import { pullModel } from '@/utils/ollama';
import { logger } from '@/utils/logger';
import { RootLocaleData } from '@/core/types';

async function ensureDirectoryExists(directory: string) {
  try {
    await fs.mkdir(directory, { recursive: true });
  } catch (error) {
    throw error;
  }
}

async function main() {
  try {
    const args = parseArgs();

    // Validate namespace arguments
    if (args.namespace && (!args.inputLocale || !args.outputLocale)) {
      throw new Error(
        'Both --input-locale and --output-locale must be specified in namespace mode.'
      );
    }

    logger.info('Detecting locale files...');

    // Fetch all JSON files in the directory
    const files = await fs.readdir(args.dir);
    const jsonFiles = files.filter((file) => file.endsWith('.json'));

    if (jsonFiles.length === 0) {
      throw new Error('No JSON files found in the specified directory.');
    }

    // Determine target directory
    const targetDir = path.resolve(args.dir, '..', args.outputLocale!);
    await ensureDirectoryExists(targetDir);

    // Load all source data to calculate progress
    const rootData: RootLocaleData[] = await Promise.all(
      jsonFiles.map(async (file) => {
        const filePath = path.join(args.dir, file);
        const sourceData = (await readJSONFile(filePath)) as RootLocaleData;
        validateContent(sourceData);
        return sourceData;
      })
    );

    const totalStrings = countStrings(rootData);
    const progressBar = initializeProgressBar(jsonFiles, totalStrings);
    progressBar.start(totalStrings, 0);

    // Make sure the model exists
    await pullModel(args.model);

    const translator = new Translator({
      model: args.model,
      sourceLang: args.inputLocale!,
    });
    translator.setProgressBar(progressBar);

    // Process each file
    for (const [index, file] of jsonFiles.entries()) {
      try {
        const sourceData = rootData[index];

        const translatedData = await translator.translateObject(sourceData, args.outputLocale!, args.variableMode!);

        const targetFilePath = path.join(targetDir, file);
        await writeJSONFile(targetFilePath, translatedData);

        logger.success(`Translated ${file} to ${args.outputLocale}`);

      } catch (error) {
        logger.error(
          `Failed to process ${file}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    progressBar.stop();
    logger.success('\n All translations completed successfully! 🎉');
  } catch (error) {
    logger.error(error instanceof Error ? error.message : 'An unknown error occurred');
    process.exit(1);
  }
}

main();

export { Translator } from '@/core/translator';
export * from '@/core/types';
