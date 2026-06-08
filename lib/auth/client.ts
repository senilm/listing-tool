import { createAuthClient } from "better-auth/react";

// Browser auth client (signIn, signUp, useSession, ...). Same-origin by default.
export const authClient = createAuthClient();
