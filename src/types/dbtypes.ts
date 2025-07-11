const TYPES = {
  IDatabase: Symbol.for("IDatabase"),
  DatabaseConfig: Symbol.for("DatabaseConfig"),
  UserService: Symbol.for("UserService"),
  PrismaClient: Symbol.for("PrismaClient"),
  IdeaService: Symbol.for("IdeaService"),
};

export interface DatabaseConfig {
  local: string;
  supabase: string;
}

export { TYPES };
