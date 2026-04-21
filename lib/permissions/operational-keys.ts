/**
 * Operational permission strings from the auth API (`data.permission.operational`).
 *
 * - **Route / menu / “can open this screen”:** use `useAuth().hasPage("page:...")` and
 *   `lib/permissions/dashboard-access` (`getDashboardPathPageRequirements`, `canAccessDashboardPath`).
 * - **In-page controls (create / edit / delete / approve / etc.):** use `useAuth().hasOperational(OP....)`
 *   or helpers such as `canCompanyAction` from this module.
 */
export const OP = {
  accountSetup: {
    create: "account-setup:create",
    delete: "account-setup:delete",
    update: "account-setup:update",
    view: "account-setup:view",
  },
  billing: { view: "billing:view" },
  chat: { access: "chat:access", audit: "chat:audit" },
  chatWidget: {
    create: "chat-widget:create",
    delete: "chat-widget:delete",
    update: "chat-widget:update",
    view: "chat-widget:view",
  },
  client: { permissions: "client:permissions" },
  company: {
    create: "company:create",
    delete: "company:delete",
    detail: "company:detail",
    list: "company:list",
    manage: "company:manage",
    update: "company:update",
    view: "company:view",
  },
  crmIntegration: {
    create: "crm-integration:create",
    delete: "crm-integration:delete",
    update: "crm-integration:update",
    view: "crm-integration:view",
  },
  department: { create: "department:create" },
  distributionSetup: {
    create: "distribution-setup:create",
    delete: "distribution-setup:delete",
    update: "distribution-setup:update",
    view: "distribution-setup:view",
  },
  hrms: {
    attendance: {
      checkIn: "hrms:attendance:checkin",
      checkOut: "hrms:attendance:checkout",
      self: "hrms:attendance:self",
      selfView: "hrms:attendance:self:view",
      view: "hrms:attendance:view",
    },
    department: {
      create: "hrms:department:create",
      delete: "hrms:department:delete",
      update: "hrms:department:update",
      view: "hrms:department:view",
    },
    departmentHead: {
      create: "hrms:department-head:create",
      delete: "hrms:department-head:delete",
      update: "hrms:department-head:update",
      view: "hrms:department-head:view",
    },
    designation: {
      create: "hrms:designation:create",
      delete: "hrms:designation:delete",
      update: "hrms:designation:update",
      view: "hrms:designation:view",
    },
    leave: {
      apply: "hrms:leave:apply",
      approve: "hrms:leave:approve",
      approveDepartment: "hrms:leave:approve:department",
      approvePool: "hrms:leave:approve:pool",
      rejectDepartment: "hrms:leave:reject:department",
      rejectPool: "hrms:leave:reject:pool",
      selfView: "hrms:leave:self:view",
      typeManage: "hrms:leave:type:manage",
      view: "hrms:leave:view",
    },
    org: {
      departmentManage: "hrms:org:department:manage",
      designationManage: "hrms:org:designation:manage",
      manage: "hrms:org:manage",
      poolManage: "hrms:org:pool:manage",
      structureView: "hrms:org:structure:view",
    },
    pool: {
      create: "hrms:pool:create",
      delete: "hrms:pool:delete",
      memberAdd: "hrms:pool:member:add",
      memberRemove: "hrms:pool:member:remove",
      memberUpdate: "hrms:pool:member:update",
      update: "hrms:pool:update",
      view: "hrms:pool:view",
    },
    poolHead: {
      create: "hrms:pool-head:create",
      delete: "hrms:pool-head:delete",
      update: "hrms:pool-head:update",
      view: "hrms:pool-head:view",
    },
    shift: {
      create: "hrms:shift:create",
      delete: "hrms:shift:delete",
      update: "hrms:shift:update",
      view: "hrms:shift:view",
    },
    shiftAssignment: {
      create: "hrms:shift-assignment:create",
      delete: "hrms:shift-assignment:delete",
      update: "hrms:shift-assignment:update",
      view: "hrms:shift-assignment:view",
    },
    team: { rosterView: "hrms:team:roster:view" },
    userShift: { assign: "hrms:user-shift:assign" },
  },
  ipBlocklist: {
    create: "ip-blocklist:create",
    delete: "ip-blocklist:delete",
    update: "ip-blocklist:update",
    view: "ip-blocklist:view",
  },
  license: {
    admin: "license:admin",
    generate: "license:generate",
    send: "license:send",
    view: "license:view",
  },
  qa: { chatReview: "qa:chat:review" },
  report: { view: "report:view" },
  smtpEmail: {
    create: "smtp-email:create",
    delete: "smtp-email:delete",
    test: "smtp-email:test",
    update: "smtp-email:update",
    view: "smtp-email:view",
  },
  socialMedia: {
    create: "social-media:create",
    delete: "social-media:delete",
    update: "social-media:update",
    view: "social-media:view",
  },
  user: {
    assign: "user:assign",
    create: "user:create",
    delete: "user:delete",
    loginAs: "user:login-as",
    update: "user:update",
    view: "user:view",
  },
  website: { assign: "website:assign" },
  websiteAssignment: {
    create: "website-assignment:create",
    delete: "website-assignment:delete",
    update: "website-assignment:update",
    view: "website-assignment:view",
  },
} as const;

/** Pool / department head assignment row actions (API `hrms:pool-head:*` / shift ops). */
export function canManagePoolHeads(hasOperational: (p: string) => boolean): boolean {
  return (
    hasOperational(OP.hrms.poolHead.create) ||
    hasOperational(OP.hrms.poolHead.update) ||
    hasOperational(OP.hrms.userShift.assign) ||
    hasOperational(OP.hrms.shiftAssignment.create)
  );
}

export function canRemovePoolHead(hasOperational: (p: string) => boolean): boolean {
  return hasOperational(OP.hrms.poolHead.delete) || hasOperational(OP.hrms.shiftAssignment.delete);
}

export function canManageDepartmentHeads(hasOperational: (p: string) => boolean): boolean {
  return (
    hasOperational(OP.hrms.departmentHead.create) ||
    hasOperational(OP.hrms.departmentHead.update) ||
    hasOperational(OP.hrms.userShift.assign) ||
    hasOperational(OP.hrms.shiftAssignment.create)
  );
}

export function canRemoveDepartmentHead(hasOperational: (p: string) => boolean): boolean {
  return hasOperational(OP.hrms.departmentHead.delete) || hasOperational(OP.hrms.shiftAssignment.delete);
}

type H = (permission: string) => boolean;

/** `hrms:org:*:manage` / `hrms:org:manage` imply full HRMS org mutations. */
export function canDepartmentAction(h: H, op: "create" | "update" | "delete" | "view"): boolean {
  if (h(OP.hrms.org.manage) || h(OP.hrms.org.departmentManage)) return true;
  if (op === "create") return h(OP.hrms.department.create);
  if (op === "update") return h(OP.hrms.department.update);
  if (op === "delete") return h(OP.hrms.department.delete);
  return h(OP.hrms.department.view);
}

export function canDesignationAction(h: H, op: "create" | "update" | "delete" | "view"): boolean {
  if (h(OP.hrms.org.manage) || h(OP.hrms.org.designationManage)) return true;
  if (op === "create") return h(OP.hrms.designation.create);
  if (op === "update") return h(OP.hrms.designation.update);
  if (op === "delete") return h(OP.hrms.designation.delete);
  return h(OP.hrms.designation.view);
}

export function canPoolAction(h: H, op: "create" | "update" | "delete" | "view"): boolean {
  if (h(OP.hrms.org.manage) || h(OP.hrms.org.poolManage)) return true;
  if (op === "create") return h(OP.hrms.pool.create);
  if (op === "update") return h(OP.hrms.pool.update);
  if (op === "delete") return h(OP.hrms.pool.delete);
  return h(OP.hrms.pool.view);
}

export function canShiftAction(h: H, op: "create" | "update" | "delete" | "view"): boolean {
  if (op === "create") return h(OP.hrms.shift.create);
  if (op === "update") return h(OP.hrms.shift.update);
  if (op === "delete") return h(OP.hrms.shift.delete);
  return h(OP.hrms.shift.view);
}

export function canCompanyAction(h: H, op: "create" | "update" | "detail" | "list" | "view"): boolean {
  if (h(OP.company.manage)) return true;
  if (op === "create") return h(OP.company.create);
  if (op === "update") return h(OP.company.update);
  if (op === "detail") return h(OP.company.detail) || h(OP.company.view);
  if (op === "list") return h(OP.company.list) || h(OP.company.view);
  return h(OP.company.view);
}

export function canRoleAction(h: H, _op: "create" | "update" | "delete"): boolean {
  return h(OP.client.permissions);
}

export function canLeaveTypeManage(h: H): boolean {
  return h(OP.hrms.leave.typeManage);
}

export function canLeaveTypeView(h: H): boolean {
  return h(OP.hrms.leave.typeManage) || h(OP.hrms.leave.view);
}
