/**
 * Image assets (served from public/assets/images/).
 * Add new entries when you add image files.
 */
export const imagesBasePath = "/assets/images/" as const;

/** Default user/avatar icon for tables and profiles (place user.png in public/assets/images/) */
export const userIconPath = `${imagesBasePath}user.png` as const;
