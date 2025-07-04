import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "USER";
    } & DefaultSession["user"];
  }

  interface User {
    role: "ADMIN" | "USER";
  }
}

declare module "@auth/core/adapters" {
  interface AdapterUser {
    role: "ADMIN" | "USER";
  }
}
