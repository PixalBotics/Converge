type Params = Record<string, unknown> | undefined;

export const hrmsAttendanceKeys = {
  all: ["hrms", "attendance"] as const,
  me: (params?: Params) => [...hrmsAttendanceKeys.all, "me", params] as const,
  user: (userId: string, params?: Params) =>
    [...hrmsAttendanceKeys.all, "user", userId, params] as const,
};
