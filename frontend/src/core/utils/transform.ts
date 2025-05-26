export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

export function transformKeys(
  obj: any,
  transformer: (key: string) => string
): any {
  if (Array.isArray(obj)) {
    return obj.map(item => transformKeys(item, transformer));
  }
  
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const transformedKey = transformer(key);
      acc[transformedKey] = transformKeys(obj[key], transformer);
      return acc;
    }, {} as any);
  }
  
  return obj;
}

export function toSnakeCase(obj: any): any {
  return transformKeys(obj, camelToSnake);
}

export function toCamelCase(obj: any): any {
  return transformKeys(obj, snakeToCamel);
}

export function parseDate(dateString: string): Date {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date string: ${dateString}`);
  }
  return date;
}

export function formatDate(date: Date): string {
  return date.toISOString();
}

export function isNullOrUndefined(value: any): value is null | undefined {
  return value === null || value === undefined;
}

export function removeNullish<T extends object>(obj: T): Partial<T> {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (!isNullOrUndefined(value)) {
      acc[key as keyof T] = value;
    }
    return acc;
  }, {} as Partial<T>);
}
