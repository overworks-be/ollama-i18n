import { z } from 'zod';
import { Ollama } from 'ollama';
import { SingleBar } from 'cli-progress';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { LocaleData, RootLocaleData, TranslationOptions } from './types';

const TranslationSchema = z.object({
  translation: z
    .string()
    .describe('The translated text without any escape characters or extra quotes'),
});

export class Translator {
  private options: TranslationOptions;
  private ollama: Ollama;
  private progressBar: SingleBar | null = null;
  private translationSchema: any;

  constructor(options: TranslationOptions) {
    this.options = options;
    this.ollama = new Ollama();
    this.translationSchema = zodToJsonSchema(TranslationSchema);
  }

  setProgressBar(bar: SingleBar) {
    this.progressBar = bar;
  }

  async translateText(
    text: string,
    targetLang: string,
    mode: 'curly' | 'dollar' = 'curly'
  ): Promise<string> {
    try {
      const prompt = this.generatePrompt(text, this.options.sourceLang, targetLang, mode);

      const response = await this.ollama.chat({
        model: this.options.model,
        messages: [{ role: 'user', content: prompt }],
        format: this.translationSchema,
        options: {
          temperature: 0, // make the result more deterministic
        },
      });

      this.progressBar?.increment();
      const result = TranslationSchema.parse(JSON.parse(response.message.content));
      return result.translation;
    } catch (error) {
      throw new Error(
        `Translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async translateObject(
    obj: RootLocaleData,
    targetLang: string,
    mode: 'curly' | 'dollar' = 'curly'
  ): Promise<RootLocaleData> {
    if (Array.isArray(obj)) {
      const translatedArray = await Promise.all(
        obj.map((item) => this.translateObject(item, targetLang, mode))
      );
      return translatedArray as LocaleData[];
    }

    const result: LocaleData = {};

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        const translatedText = await this.translateText(value, targetLang, mode);
        result[key] = translatedText;
      } else if (Array.isArray(value)) {
        if (value.every((item) => typeof item === 'string')) {
          // Cas d'un tableau de chaînes
          result[key] = await Promise.all(
            value.map((item) => this.translateText(item, targetLang, mode))
          );
        } else {
          // Cas d'un tableau d'objets
          result[key] = await Promise.all(
            value.map((item) =>
              typeof item === 'object' ? this.translateObject(item, targetLang, mode) : item
            )
          );
        }
      } else if (value && typeof value === 'object') {
        result[key] = await this.translateObject(value, targetLang, mode);
      } else {
        result[key] = value;
      }
    }

    return result;
  }

  generatePrompt(
    text: string,
    sourceLang: string,
    targetLang: string,
    mode: 'curly' | 'dollar'
  ): string {
    if (mode === 'curly') {
      return `-Goal-
  Translate the following text from ${sourceLang} to ${targetLang}.
  
  -Steps-
  1. Determine the target language given by its language code.
  2. Translate the given text using the rules below.
  
  -Rules-
  CRITICAL: Code variables in curly braces like {field}, {min}, {max} must:
  1. Stay in the input language - never translate the text inside braces
  2. Remain exactly as they are with the same name
  3. Keep the curly braces intact
  4. Be placed in a grammatically correct position
  
  Here's the text to translate:
  "${text}"`;
    } else {
      return `-Goal-
  Translate the following text from ${sourceLang} to ${targetLang}.
  
  -Steps-
  1. Determine the target language given by its language code.
  2. Translate the given text using the rules below.
  
  -Rules-
  CRITICAL: Code variables that always begin with $ such as $field, $min, $max must:
  1. Stay in the input language - never translate text beginning with $
  2. Remain exactly as they are with the same name
  3. Keep the $ tag intact
  4. Be placed in a grammatically correct position
  
  Here's the text to translate:
  "${text}"`;
    }
  }
}
