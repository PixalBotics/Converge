type AuthUserLike = {
  roleLabel?: string;
  role?: string;
} | null;

export function dashboardRoleLabel(user: AuthUserLike): string {
  if (!user) return "User";
  if (user.roleLabel) return user.roleLabel;
  if (user.role === "admin") return "Admin";
  if (user.role === "hr-admin") return "HR Admin";
  if (user.role === "network-admin") return "Network Admin";
  if (user.role === "manager") return "Manager";
  return "User";
}

export function dashboardUserInitials(displayName: string): string {
  return displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function dashboardFirstWord(displayName: string): string {
  return displayName.split(" ")[0] ?? displayName;
}
