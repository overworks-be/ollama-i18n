# ollama-i18n

A tiny CLI tool for automated translation of i18n locale files using Ollama models.

![](./media/preview.png)

## Why?

Translating i18n files locally with "small" LLMs has a few benefits:

- No API usage costs and API keys required - translate as much as you want
- Local inference is quick, especially for short strings (typical in i18n files)
- Small LLMs (3-7B parameters) are surprisingly capable at translating simple UI texts correctly
- Switching between different models using Ollama is very easy

## Prerequisites

- Node.js >= 18
- [Ollama](https://ollama.ai/) installed and running locally
- A `locale` directory containing JSON translation files

## Installation

To install the CLI tool globally using npm:

```bash
npm install -g ollama-i18n
```

## Usage

To translate all available locales:

```bash
ollama-i18n --source en --dir ./locales
```

This will:
1. Use `en.json` as the source reference file
2. Find all other JSON files in the `./locales` directory
3. Translate any missing translations to the target language
4. Keep any existing translations (default)

**Note**: All locale files must exist in the provided directory (they can be empty) when running without `--target` (`-t`), while using `--target` will create the locale file if it doesn't exist yet.

## Options

```bash
Options:
  -d, --dir <path>        Directory containing the locale files (required)
  -s, --source <locale>   Source language file name without extension (required)
  -t, --target <locale>   Target language file name without extension (optional)
  -m, --model <name>      Ollama model to use (default: "llama3.2:3b")
  --no-cache              Translate all keys and ignore existing translations
  --namespace             Enable namespace processing (optional)
  --input-locale <locale> Specify the input locale for translation (optional)
  --output-locale <locale> Specify the output locale for translation (optional)
  --variable-mode <mode>  Specify the variable mode (curly or dollar) (default: "curly")
  -h, --help              Show help information
  -v, --version           Show version number
```

## Examples

Translate to a specific language:

```bash
ollama-i18n -s en -t fr -d ./locales
```

Use a different Ollama model and re-translate all files in the `./locales` directory:

```bash
ollama-i18n -s en -d ./locales -m mistral --no-cache
```

Retranslate all keys using the default model:

```bash
ollama-i18n -s en -d ./locales --no-cache
```

Translate using the `dollar` variable mode:

```bash
ollama-i18n -s en -d ./locales --variable-mode dollar
```

Enable namespace processing with input and output locales:

```bash
ollama-i18n --namespace --input-locale en --output-locale fr -d ./locales
```

This will:
1. Treat each JSON file as a namespace (e.g., `common.json`, `validation.json`).
2. Translate each file individually from the specified input locale to the output locale.
3. Create a directory for the output locale if it does not already exist.

## Using as a Pre-commit Hook

You can use ollama-i18n to check for missing translations before each commit.

### Setup

1. Install required dependencies:
```bash
npm install --save-dev husky lint-staged ollama-i18n
```

2. Initialize husky:
```bash
npx husky install
npm pkg set scripts.prepare="husky install"
```

3. Add to your `package.json`:
```json
{
  "lint-staged": {
    "locales/*.json": "ollama-i18n -s en -d ./locales"
  }
}
```

3. Then, add the pre-commit hook:
```bash
npx husky add .husky/pre-commit "npx lint-staged"
```

Now, whenever you commit changes to your locale files, `ollama-i18n` will automatically check for and translate any missing translations.

## Locale File Structure

The CLI tool expects your JSON files with the language code to have a certain structure.

E.g. using the command `ollama-i18n -s en -d ./locales`:

```
locales/
  ├── en.json     # Source file
  ├── fr.json     # French translations
  ├── de.json     # German translations
  └── es.json     # Spanish translations
```

Example file content:

```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel"
  },
  "validation": {
    "required": "{field} is required",
    "minLength": "{field} must be at least {min} characters"
  }
}
```

## Development

To run the CLI locally using a `./locales` directory with two locales, `en.json` and `de.json`, run the following command:

```bash
npm run dev -- --dir ./locales -s en -t de
```

Translate with a specific variable mode:

```bash
npm run dev -- --dir ./locales -s en -t de --variable-mode dollar
```

Translate with namespace processing:

```bash
npm run dev -- --dir ./locales/en --namespace --input-locale en --output-locale fr
```
