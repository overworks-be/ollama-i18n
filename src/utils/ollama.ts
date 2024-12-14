import ollama from 'ollama';
import { logger } from './logger';

// Pull the model from the Ollama library
export async function pullModel(modelConfig: string) {
  // check if model was pulled
  const modelExists = await ollama
    .list()
    .then((response) => response.models.some((model) => model.name.startsWith(modelConfig)));

  try {
    // download the model
    if (!modelExists) {
      logger.info(`Pulling model ${modelConfig} from Ollama library...`);
      await ollama.pull({ model: modelConfig });
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Failed to pull model from Ollama library: ${modelConfig}: ${msg}`);
  }
}
