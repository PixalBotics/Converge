/** Portal layer for `FormModal` and other full-screen dialog roots. */
export const FORM_MODAL_PORTAL_Z_INDEX = 16_000;

/**
 * MUI `Menu` / `Popover` / select dropdowns must sit above the dialog portal (e.g. 16000).
 * Use on `MenuProps.sx` (and similar) for controls rendered inside modals.
 */
export const FORM_MODAL_MUI_OVERLAY_Z_INDEX = 16_500;
