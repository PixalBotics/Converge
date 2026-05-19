import { defaultWidgetDraft, mergePartialWidgetDraft, type WidgetDraft } from "./widgetDraft";

/** In-memory only — wizard step state is not persisted to localStorage. */
let createFlowDraft: WidgetDraft = mergePartialWidgetDraft(defaultWidgetDraft);

const editFlowDrafts = new Map<string, WidgetDraft>();

export function resetCreateWizardDraft(): void {
  createFlowDraft = mergePartialWidgetDraft(defaultWidgetDraft);
}

export function readCreateWizardDraft(): WidgetDraft {
  return createFlowDraft;
}

export function patchCreateWizardDraft(update: Partial<WidgetDraft>): WidgetDraft {
  createFlowDraft = mergePartialWidgetDraft({
    ...createFlowDraft,
    ...update,
  });
  return createFlowDraft;
}

export function readEditWizardDraft(widgetKey: string): WidgetDraft {
  const k = widgetKey.trim();
  if (!k) return mergePartialWidgetDraft(defaultWidgetDraft);
  const cached = editFlowDrafts.get(k);
  if (cached) return cached;
  const seeded = mergePartialWidgetDraft({
    type: "chat",
    remoteWidgetKey: k,
    widgetId: k,
  });
  editFlowDrafts.set(k, seeded);
  return seeded;
}

/** Replace edit draft from GET /widgets/:widgetKey (source of truth for edit flow). */
export function replaceEditWizardDraftFromApi(
  widgetKey: string,
  mapped: Partial<WidgetDraft>,
): WidgetDraft {
  const k = widgetKey.trim();
  const next = mergePartialWidgetDraft({
    ...mapped,
    type: "chat",
    remoteWidgetKey: k,
    widgetId: mapped.widgetId?.trim() || k,
  });
  editFlowDrafts.set(k, next);
  return next;
}

export function patchEditWizardDraft(
  widgetKey: string,
  update: Partial<WidgetDraft>,
): WidgetDraft {
  const k = widgetKey.trim();
  const current = readEditWizardDraft(k);
  const next = mergePartialWidgetDraft({
    ...current,
    ...update,
    type: "chat",
    remoteWidgetKey: k,
    widgetId: update.widgetId?.trim() || current.widgetId || k,
  });
  editFlowDrafts.set(k, next);
  return next;
}

export function clearEditWizardDraft(widgetKey: string): void {
  const k = widgetKey.trim();
  if (k) editFlowDrafts.delete(k);
}
