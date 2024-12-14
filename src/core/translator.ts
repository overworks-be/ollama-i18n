import { Ollama } from 'ollama';
import { LocaleData, TranslationOptions, TranslationResult } from './types';
import { logger } from '@/utils/logger';

export class Translator {
  private options: TranslationOptions;
  private ollama: Ollama;

  constructor(options: TranslationOptions) {
    this.options = options;
    this.ollama = new Ollama();
  }

  async translateText(text: string, targetLang: string): Promise<TranslationResult> {
    try {
      const prompt = `Translate the following text from ${this.options.sourceLang} to ${targetLang}.
        Only respond with the translation, no additional text:
        "${text}"`;

      const response = await this.ollama.chat({
        model: this.options.model,
        messages: [{ role: 'user', content: prompt }],
      });

      return { success: true, translatedText: response.message.content.trim() };
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Translation failed: ${msg}`);
      return {
        success: false,
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }

  async translateObject(obj: LocaleData, targetLang: string, parentKey = ''): Promise<LocaleData> {
    const translatedObj: LocaleData = {};

    for (const [key, value] of Object.entries(obj)) {
      const currentKey = parentKey ? `${parentKey}.${key}` : key;

      if (typeof value === 'string') {
        logger.info(`Translating: ${currentKey}`);
        const result = await this.translateText(value, targetLang);
        if (result.success && result.translatedText) {
          translatedObj[key] = result.translatedText;
        } else {
          throw new Error(`Failed to translate key: ${currentKey}`);
        }
      } else {
        translatedObj[key] = await this.translateObject(value, targetLang, currentKey);
      }
    }

    return translatedObj;
  }
}
