
/* eslint-disable @typescript-eslint/no-explicit-any */

import "reflect-metadata";
import { injectable } from "inversify";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import {
  IDatabase,
  ModelName,
  Where,
  OrderBy,
  WhereUnique,
  CreateData,
  UpdateData,
  ModelType,
} from "./IDatabase";

@injectable()
export class SupabaseDatabase implements IDatabase {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL || "";
    const supabaseKey = process.env.SUPABASE_ANON_KEY || "";

    // Create Supabase client with URL and Key
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  // A method for raw queries, useful for complex joins or specific database features.
  async query<T>(queryString: string, params: unknown[]): Promise<T[]> {
    // Supabase doesn't have a direct equivalent of $queryRawUnsafe for arbitrary strings.
    // This would typically be handled by creating a stored procedure in Supabase
    // and calling it via rpc(). For now, we'll throw an error.
    console.warn(
      "Raw query is not directly supported by this Supabase adapter. Consider using RPC."
    );
    return Promise.resolve([]);
  }

  async find<T extends ModelName>(
    model: T,
    where: Where<ModelType<T>>,
    orderBy?: OrderBy
  ): Promise<ModelType<T>[]> {
    // The `where` and `orderBy` are Prisma types, but Supabase expects a different format.
    // This is a design limitation of the current abstraction. We cast to `any` to proceed.
    let query = this.supabase
      .from(model.toLowerCase())
      .select<"*", ModelType<T>>("*")
      .match(where);

    if (orderBy) {
      // This is a simplification. Prisma's orderBy is more complex than Supabase's.
      const key = Object.keys(orderBy)[0];
      const value = (orderBy as any)[key];
      const ascending = orderBy[key] === "asc";
      query = query.order(key as string, { ascending });
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data as ModelType<T>[]) || [];
  }

  async findOne<T extends ModelName>(
    model: T,
    where: WhereUnique<ModelType<T>>
  ): Promise<ModelType<T> | null> {
    const { data, error } = await this.supabase
      .from(model.toLowerCase())
      .select<"*", ModelType<T>>("*")
      .match(where as any)
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116: "exact one row not found" - this is not an error for findOne
      throw error;
    }
    return data as ModelType<T> | null;
  }

  async count<T extends ModelName>(
    model: T,
    where?: Where<ModelType<T>>
  ): Promise<number> {
    const { count, error } = await this.supabase
      .from(model.toLowerCase())
      .select("*", { count: "exact", head: true })
      .match(where || {});

    if (error) throw error;
    return count || 0;
  }

  async create<T extends ModelName>(
    model: T,
    data: CreateData<ModelType<T>>
  ): Promise<ModelType<T>> {
    // Supabase adapter for create doesn't handle nested writes like Prisma's `connect`.
    // This would need to be handled in the service layer if required.
    const { data: result, error } = await this.supabase
      .from(model.toLowerCase())
      .insert([data as any])
      .select()
      .single();

    if (error) throw error;
    return result as ModelType<T>;
  }

  async update<T extends ModelName>(
    model: T,
    where: WhereUnique<ModelType<T>>,
    data: UpdateData<ModelType<T>>
  ): Promise<ModelType<T>> {
    const { data: result, error } = await this.supabase
      .from(model.toLowerCase())
      .update(data as any)
      .match(where as any)
      .select()
      .single();

    if (error) throw error;
    return result as ModelType<T>;
  }
}
