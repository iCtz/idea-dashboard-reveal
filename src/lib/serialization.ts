import { Decimal } from "@prisma/client/runtime/library";
import type { Serializable } from "@/types/serializationTypes";

/**
 * Recursively converts Decimal objects in a data structure to numbers.
 * This is necessary because Next.js cannot serialize Decimal objects
 * when passing data from Server Components to Client Components.
 * @param data The data to be processed.
 * @returns The processed data with `Decimal` types converted to `number`.
 */
export function convertDecimalsToNumbers<T>(data: T): Serializable<T> {
  if (data === null || data === undefined) {
    // `null` and `undefined` are serializable as they are.
    return data as Serializable<T>;
  }

  if (data instanceof Decimal) {
    // Convert Decimal to number.
    return data.toNumber() as Serializable<T>;
  }

  if (Array.isArray(data)) {
    // Recursively process each item in the array.
    return data.map(item => convertDecimalsToNumbers(item)) as Serializable<T>;
  }

  // Check for plain objects, excluding special objects like Date.
  if (typeof data === 'object' && !(data instanceof Date)) {
    // To handle generic objects safely, we treat them as a record of keys to unknown values.
    const newObj: { [key: string]: unknown } = {};
    for (const key in data) {
      if (Object.hasOwn(data, key)) {
        // Recursively process each value in the object.
        newObj[key] = convertDecimalsToNumbers((data as Record<string, unknown>)[key]);
      }
    }
    return newObj as Serializable<T>;
  }

  // Primitives (string, number, boolean, Date, etc.) are returned as is.
  return data as Serializable<T>;
}
