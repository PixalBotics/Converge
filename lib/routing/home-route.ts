import { redirect } from "next/navigation";
import { AUTH_PATHS } from "@/lib/auth";

/** Default `/` behaviour — keeps `app/page.tsx` minimal. */
export function redirectRootToLogin(): never {
  redirect(AUTH_PATHS.login);
}
