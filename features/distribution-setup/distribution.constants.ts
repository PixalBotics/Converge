export const DISTRIBUTION_BASE_PATH = "/dashboard/distribution-setup";

export const DISTRIBUTION_ROUTES = {
  home: DISTRIBUTION_BASE_PATH,
  configure: `${DISTRIBUTION_BASE_PATH}/configure`,
  settings: `${DISTRIBUTION_BASE_PATH}/settings`,
  table: `${DISTRIBUTION_BASE_PATH}/table`,
  transcript: `${DISTRIBUTION_BASE_PATH}/transcript`,
} as const;
