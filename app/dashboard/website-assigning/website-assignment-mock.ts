export interface AssignedUserRow extends Record<string, unknown> {
  id: string;
  username: string;
  email: string;
  department: string;
  chatCount: number;
  chatDeltaPct: string;
}

export const ASSIGNED_TOTAL = 48;
export const TOTAL_ENTRIES = 255_000;
export const PAGE_COUNT = 2;

export const ASSIGNED_USERS: AssignedUserRow[] = [
  {
    id: "1",
    username: "sarah.j",
    email: "sarah.j@marketplace.io",
    department: "Customer Support",
    chatCount: 142,
    chatDeltaPct: "+12%",
  },
  {
    id: "2",
    username: "mike.dev",
    email: "mike@dev.io",
    department: "Engineering",
    chatCount: 89,
    chatDeltaPct: "+8%",
  },
  {
    id: "3",
    username: "alex.ops",
    email: "alex@ops.co",
    department: "Operations",
    chatCount: 210,
    chatDeltaPct: "+15%",
  },
  {
    id: "4",
    username: "nina.sales",
    email: "nina@sales.io",
    department: "Sales",
    chatCount: 64,
    chatDeltaPct: "+12%",
  },
  {
    id: "5",
    username: "omar.help",
    email: "omar@help.io",
    department: "Customer Support",
    chatCount: 178,
    chatDeltaPct: "+12%",
  },
  {
    id: "6",
    username: "emma.qa",
    email: "emma@qa.io",
    department: "Engineering",
    chatCount: 95,
    chatDeltaPct: "+5%",
  },
  {
    id: "7",
    username: "liam.pm",
    email: "liam@pm.co",
    department: "Product",
    chatCount: 132,
    chatDeltaPct: "+12%",
  },
  {
    id: "8",
    username: "zara.cx",
    email: "zara@cx.io",
    department: "Customer Support",
    chatCount: 201,
    chatDeltaPct: "+10%",
  },
];

/** Detail view fallback (matches design reference when id is unknown). */
export const DEMO_USER_DETAIL = {
  username: "Raja Saif",
  email: "rajasaif12@gmail.com",
  department: "Customer Support",
};

export function getAssignedUserDetail(userId: string): {
  username: string;
  email: string;
  department: string;
} {
  const row = ASSIGNED_USERS.find((u) => u.id === userId);
  if (row) {
    return {
      username: row.username,
      email: row.email,
      department: row.department,
    };
  }
  return DEMO_USER_DETAIL;
}

export type WebsiteRank = "Primary" | "Secondary" | "Backup";

export interface AssignedWebsiteRow extends Record<string, unknown> {
  id: string;
  company: string;
  website: string;
  rank: WebsiteRank;
}

export const ASSIGNED_WEBSITES_TOTAL = 48;
export const ASSIGNED_WEBSITES_ENTRIES = 256_000;

export function formatEntries(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}

export const ASSIGNED_WEBSITE_ROWS: AssignedWebsiteRow[] = [
  {
    id: "w1",
    company: "Alpha - Alpha Enterprise",
    website: "www.azurealchemyjewelry.com",
    rank: "Primary",
  },
  {
    id: "w2",
    company: "Nation - National Group",
    website: "www.nationalgroup.io",
    rank: "Secondary",
  },
  {
    id: "w3",
    company: "Vertex - Vertex Holdings",
    website: "www.vertexholdings.com",
    rank: "Backup",
  },
  {
    id: "w4",
    company: "BluePeak - BluePeak Media",
    website: "www.bluepeakmedia.co",
    rank: "Primary",
  },
  {
    id: "w5",
    company: "CloudForge - CloudForge Labs",
    website: "www.cloudforge.dev",
    rank: "Secondary",
  },
  {
    id: "w6",
    company: "DataNest - DataNest AI",
    website: "www.datanest.ai",
    rank: "Primary",
  },
  {
    id: "w7",
    company: "PixelWorks - PixelWorks Studio",
    website: "www.pixelworks.co",
    rank: "Backup",
  },
  {
    id: "w8",
    company: "Northwind - Northwind Labs",
    website: "www.northwind.io",
    rank: "Secondary",
  },
];
