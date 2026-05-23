export type AccountMenuProps = {
  anchorEl: null | HTMLElement;
  open: boolean;
  onClose: () => void;
  isImpersonating: boolean;
  onLogout: () => void;
  onLoginAsAdmin: () => void;
  /** Defaults: `/dashboard/settings?tab=profile` */
  profileHref?: string;
  /** Defaults: `/dashboard/theme` */
  themeHref?: string;
};
