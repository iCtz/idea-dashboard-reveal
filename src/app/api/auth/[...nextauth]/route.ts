// This file is essential for NextAuth.js to create its API endpoints.
// It exports the handlers from your main auth configuration.

import { handlers } from "@/../auth";
export const { GET, POST } = handlers;
export { auth, signIn, signOut } from "@/../auth";
