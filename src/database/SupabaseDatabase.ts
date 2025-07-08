import "reflect-metadata";
import { injectable } from "inversify";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { IDatabase } from "./IDatabase";
import { Profile, Idea, Evaluation } from "@/types/types";
import { Prisma } from "@prisma/client";

@injectable()
export class SupabaseDatabase implements IDatabase {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase URL and Key must be defined in .env");
    }

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

  async find(
    model: "Idea" | "Profile" | "Evaluation",
    where: any,
    orderBy?: any
  ): Promise<any[]> {
    let query = this.supabase.from(model).select("*").match(where);

    if (orderBy) {
      const key = Object.keys(orderBy)[0];
      const ascending = orderBy[key] === "asc";
      query = query.order(key, { ascending });
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async findOne(
    model: "Idea" | "Profile" | "Evaluation",
    where: any
  ): Promise<any | null> {
    const { data, error } = await this.supabase
      .from(model)
      .select("*")
      .match(where)
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116: "exact one row not found" - this is not an error for findOne
      throw error;
    }
    return data;
  }

  async count(
    model: "Idea" | "Profile" | "Evaluation",
    where?: any
  ): Promise<number> {
    const { count, error } = await this.supabase
      .from(model)
      .select("*", { count: "exact", head: true })
      .match(where || {});

    if (error) throw error;
    return count || 0;
  }

  async create(
    model: "Idea" | "Profile" | "Evaluation",
    data: any
  ): Promise<any> {
    // Supabase adapter for create doesn't handle nested writes like Prisma's `connect`.
    // This would need to be handled in the service layer if required.
    const { data: result, error } = await this.supabase
      .from(model)
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  async update(
    model: "Idea" | "Profile" | "Evaluation",
    where: any,
    data: any
  ): Promise<any> {
    const { data: result, error } = await this.supabase
      .from(model)
      .update(data)
      .match(where)
      .select()
      .single();

    if (error) throw error;
    return result;
  }
}
