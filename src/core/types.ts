export type LocaleValue = string | LocaleData | string[] | RootLocaleData[];

export interface LocaleData {
  [key: string]: LocaleValue;
}

export type RootLocaleData = LocaleData | LocaleData[];

export interface TranslationOptions {
  model: string;
  sourceLang: string;
}

export interface TranslationResult {
  success: boolean;
  translatedText?: string;
  error?: Error;
}
