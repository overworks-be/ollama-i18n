import colors from 'yoctocolors';

export const logger = {
  info: (message: string) => console.log(`${colors.blue('ℹ')} ${message}`),
  warning: (message: string) => console.log(`${colors.yellow('⚠')} ${message}`),
  error: (message: string) => console.log(`${colors.red('✖')} ${message}`),
  success: (message: string) => console.log(`${colors.green('✓')} ${message}`),
};
