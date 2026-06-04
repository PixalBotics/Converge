/**
 * Widget HTTP must never send dashboard auth cookies (visitor JWT in Authorization only).
 * @see https://developer.mozilla.org/en-US/docs/Web/API/fetch#credentials
 */
export const WIDGET_FETCH_CREDENTIALS = "omit" as RequestCredentials;
