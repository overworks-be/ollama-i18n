import { Command } from 'commander';

export interface CliOptions {
  dir: string;
  source: string;
  model: string;
}

export function parseArgs(): CliOptions {
  const program = new Command();

  program
    .name('ollama-i18n')
    .description('CLI tool for automated translation of i18n locale files using Ollamna models')
    .version('1.0.0')
    .requiredOption('-d, --dir <path>', 'Directory containing the locale files')
    .requiredOption('-s, --source <locale>', 'Source language file name without extension')
    .option('-m, --model <name>', 'Ollama model to use', 'llama3.2:3b')
    .parse(process.argv);

  const { dir, source, model } = program.opts();

  return {
    dir,
    source,
    model,
  };
}
