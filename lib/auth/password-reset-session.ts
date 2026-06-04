const EMAIL_KEY = "conver.auth.passwordReset.email";

export function setPasswordResetEmail(email: string): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(EMAIL_KEY, email.trim().toLowerCase());
}

export function getPasswordResetEmail(): string | null {
  if (typeof sessionStorage === "undefined") return null;
  return sessionStorage.getItem(EMAIL_KEY);
}

export function clearPasswordResetEmail(): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem(EMAIL_KEY);
}
