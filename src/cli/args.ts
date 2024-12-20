import { Command } from 'commander';
import { getPackageVersion } from '@/utils/version';

export interface CliOptions {
  dir: string;
  source: string;
  target?: string;
  model: string;
  cache: boolean;
  namespace: boolean;
  inputLocale?: string;
  outputLocale?: string;
  variableMode?: 'curly' | 'dollar';
}

export function parseArgs(): CliOptions {
  const program = new Command();

  program
    .name('ollama-i18n')
    .description('CLI tool for automated translation of i18n locale files using Ollama models')
    .version(getPackageVersion())
    .requiredOption('-d, --dir <path>', 'Directory containing the locale files')
    .option('-s, --source <locale>', 'Source language file name without extension')
    .option(
      '-t, --target <locale>',
      'Target language file name without extension (optional - if not provided, translates to all detected locales)'
    )
    .option('-m, --model <name>', 'Ollama model to use', 'llama3.2:3b')
    .option('--no-cache', 'Translate all keys and ignore existing translations')
    .option('--namespace', 'Enable namespace processing', false)
    .option('--input-locale <locale>', 'Specify the input locale for translation')
    .option('--output-locale <locale>', 'Specify the output locale for translation')
    .option('--variable-mode <mode>', 'Specify the variable mode (curly or dollar)', 'curly')
    .parse(process.argv);

  const { dir, source, target, model, cache, namespace, inputLocale, outputLocale, variableMode } =
    program.opts();

  return {
    dir,
    source,
    target,
    model,
    cache,
    namespace,
    inputLocale,
    outputLocale,
    variableMode: variableMode as 'curly' | 'dollar',
  };
}
