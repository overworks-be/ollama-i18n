import { Command } from 'commander';

export interface CliOptions {
  dir: string;
  source: string;
  target?: string;
  model: string;
  cache: boolean;
}

export function parseArgs(): CliOptions {
  const program = new Command();

  program
    .name('ollama-i18n')
    .description('CLI tool for automated translation of i18n locale files using Ollamna models')
    .version('1.0.0')
    .requiredOption('-d, --dir <path>', 'Directory containing the locale files')
    .requiredOption('-s, --source <locale>', 'Source language file name without extension')
    .option(
      '-t, --target <locale>',
      'Target language file name without extension (optional - if not provided, translates to all detected locales)'
    )
    .option('-m, --model <name>', 'Ollama model to use', 'llama3.2:3b')
    .option('--no-cache', 'Translate all keys and ignore existing translations')
    .parse(process.argv);

  const { dir, source, target, model, cache } = program.opts();

  return {
    dir,
    source,
    target,
    model,
    cache,
  };
}
