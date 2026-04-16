import type { ApiEnvelope } from "./auth.types";

export interface CompanyResellerSummary {
  id: string;
  name: string;
}

export interface CompanyParentSummary {
  id: string;
  name: string;
  resellerId: string;
  reseller: CompanyResellerSummary;
}

export type CompanyType = "parent" | "child";

export interface CompanyListItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  parentCompanyId: string | null;
  createdAt: string;
  updatedAt: string;
  parentCompany: CompanyParentSummary | null;
  companyType: CompanyType;
}

export interface PaginatedCompaniesData {
  items: CompanyListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CompanyTreeChild {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  parentCompanyId: string;
  createdAt: string;
  updatedAt: string;
  parentCompany: CompanyParentSummary;
}

export interface CompanyTreeParent {
  id: string;
  name: string;
  childCompanies: CompanyTreeChild[];
}

export interface CompanyTreeItem {
  reseller: CompanyResellerSummary;
  parentCompanies: CompanyTreeParent[];
}

export interface PaginatedCompaniesTreeData {
  view: "tree";
  items: CompanyTreeItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  meta: {
    resellerCount: number;
    parentCompanyCount: number;
    childCompanyCount: number;
    companyRowCount: number;
  };
}

export type CompaniesData = PaginatedCompaniesData | PaginatedCompaniesTreeData;

export type CompaniesListResponseEnvelope = ApiEnvelope<CompaniesData>;
