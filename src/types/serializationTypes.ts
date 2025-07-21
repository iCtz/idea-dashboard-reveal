import type { Decimal } from "@prisma/client/runtime/library";

/**
 * A generic type that recursively converts specific types within an object
 * to their serializable counterparts.
 * - `Decimal` becomes `number`
 * - `Date` becomes `string`
 * This is essential for passing data from Next.js Server Components to Client Components.
 */
export type Serializable<T> = {
  [P in keyof T]: T[P] extends Decimal
    ? number
    : T[P] extends Decimal | null
    ? number | null
    : T[P] extends Date
    ? Date
    : T extends (infer U)[]
    ? Serializable<U>[]
    : T extends object
    ? { [P in keyof T]: Serializable<T[P]> }
    : T;
};
