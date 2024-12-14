export interface LocaleData {
  [key: string]: string | LocaleData;
}

export interface TranslationOptions {
  model: string;
  sourceLang: string;
}

export interface TranslationResult {
  success: boolean;
  translatedText?: string;
  error?: Error;
}
