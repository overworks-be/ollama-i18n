import { describe, it, expect } from 'vitest';
import { parseArgs } from '@/cli/args';

const mockProcessArgv = (args: string[]) => {
  const originalArgv = process.argv;
  process.argv = ['node', 'script.js', ...args];
  return () => {
    process.argv = originalArgv;
  };
};

describe('CLI Arguments', () => {
  it('parses required options correctly', () => {
    const restore = mockProcessArgv(['-d', './locales', '-s', 'en']);

    const options = parseArgs();
    expect(options).toMatchObject({
      dir: './locales',
      source: 'en',
      model: 'llama3.2:3b',
      cache: true,
    });

    restore();
  });

  it('handles the ptional target language', () => {
    const restore = mockProcessArgv(['-d', './locales', '-s', 'en', '-t', 'fr']);

    const options = parseArgs();
    expect(options).toMatchObject({
      dir: './locales',
      source: 'en',
      target: 'fr',
      model: 'llama3.2:3b',
      cache: true,
    });

    restore();
  });

  it('allows using custom Ollama models', () => {
    const restore = mockProcessArgv(['-d', './locales', '-s', 'en', '-m', 'mistral']);

    const options = parseArgs();
    expect(options).toMatchObject({
      dir: './locales',
      source: 'en',
      model: 'mistral',
      cache: true,
    });

    restore();
  });

  it('should handle --no-cache correctly', () => {
    const restore = mockProcessArgv(['-d', './locales', '-s', 'en', '--no-cache']);

    const options = parseArgs();
    expect(options).toMatchObject({
      dir: './locales',
      source: 'en',
      model: 'llama3.2:3b',
      cache: false,
    });

    restore();
  });

  it('should throw when source is not provided', () => {
    const restore = mockProcessArgv(['-d', './locales']);

    expect(() => parseArgs()).toThrow();

    restore();
  });
});
