const TYPES = {
  IDatabase: Symbol.for("IDatabase"),
  DatabaseConfig: Symbol.for("DatabaseConfig"),
  UserService: Symbol.for("UserService"),
  IdeaService: Symbol.for("IdeaService"),
};

export interface DatabaseConfig {
  local: string;
  supabase: string;
}

export { TYPES };
