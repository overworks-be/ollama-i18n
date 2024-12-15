import path from 'path';
import { promises as fs } from 'fs';
import { RootLocaleData } from '@/core/types';
import { logger } from './logger';

export async function readJSONFile(
  filepath: string,
  allowNotFound = false
): Promise<RootLocaleData | null> {
  try {
    const data = await fs.readFile(filepath, 'utf-8');
    if (!data.trim()) {
      // empty json file
      return {} as RootLocaleData;
    }
    return JSON.parse(data);
  } catch (error) {
    if (error instanceof Error && error.message.includes('ENOENT')) {
      if (allowNotFound) {
        // Do nothing
        return null;
      }
    }

    const msg = error instanceof Error ? error.message : 'Unknown error';
    const errorMsg = `Error reading file ${filepath}: ${msg}`;
    logger.error(errorMsg);
    throw new Error(errorMsg);
  }
}

export async function writeJSONFile(filepath: string, localeData: RootLocaleData) {
  try {
    await fs.mkdir(path.dirname(filepath), { recursive: true });
    await fs.writeFile(filepath, JSON.stringify(localeData, null, 2));
  } catch (error) {
    logger.error(`Error reading file ${filepath}`);
    throw error;
  }
}

export async function findLocaleFiles(
  dir: string,
  sourceLocale: string,
  allowEmpty = false
): Promise<string[]> {
  try {
    // Make sure the directory exists
    await fs.access(dir);

    const files = await fs.readdir(dir);

    const localeFiles = files
      .filter((file) => {
        const isJSON = file.endsWith('json');
        const name = path.parse(file).name;
        return isJSON && name !== sourceLocale;
      })
      .map((file) => path.parse(file).name);

    if (localeFiles.length === 0 && !allowEmpty) {
      throw new Error(
        `No locale files found in ${dir}. Make sure the locale files exist in the specified directory.`
      );
    }

    return localeFiles;
  } catch (error) {
    if (error instanceof Error && error.message.includes('ENOENT')) {
      throw new Error(`Directory ${dir} does not exist`);
    }
    throw error;
  }
}
