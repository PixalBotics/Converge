import { redirect } from "next/navigation";
import { AUTH_PATHS } from "@/lib/auth";

export default function Home() {
  redirect(AUTH_PATHS.login);
}
