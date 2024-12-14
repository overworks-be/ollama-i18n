export function validateContent(obj: unknown, path = ''): void {
  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      validateContent(item, `${path}[${index}]`);
    });
    return;
  }

  if (obj && typeof obj === 'object') {
    Object.entries(obj).forEach(([key, value]) => {
      const currentPath = path ? `${path}.${key}` : key;

      if (typeof value !== 'string' && !Array.isArray(value) && typeof value !== 'object') {
        throw new Error(
          `Invalid value type at ${currentPath}. Only strings, arrays, and objects are allowed. Found: ${typeof value}`
        );
      }

      if (value && typeof value === 'object') {
        validateContent(value, currentPath);
      }
    });
    return;
  }

  if (typeof obj !== 'string' && obj !== undefined) {
    throw new Error(
      `Invalid value type at ${path}. Only strings are allowed for translation. Found: ${typeof obj}`
    );
  }
}
