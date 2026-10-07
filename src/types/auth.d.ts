import type { DefaultSession } from "@auth/core/types";

declare module "@auth/core/types" {
  interface Session {
    error?: string;
    user: {
      accessToken?: string;
    } & DefaultSession["user"];
  }
}
