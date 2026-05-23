import type {
  ChannelRosterSlotsBody,
  PutDepartmentRosterBody,
  ServiceChannel,
  WebsiteAssignmentChannelRoster,
  WebsiteAssignmentTier,
} from "@/api/types/website-assignments.types";
import type { SlotDraft } from "../components/RosterSlotPicker";
import { emptySlotDraft } from "../components/RosterSlotPicker";

export const ROSTER_TIERS: WebsiteAssignmentTier[] = ["Primary", "Secondary", "Backup"];

export function slotsFromRoster(
  roster: WebsiteAssignmentChannelRoster,
): SlotDraft {
  return {
    Primary: roster.primary?.userId ?? "",
    Secondary: roster.secondary?.userId ?? "",
    Backup: roster.backup?.userId ?? "",
  };
}

export function draftToChannelBody(draft: SlotDraft): ChannelRosterSlotsBody {
  return {
    Primary: draft.Primary.trim() || null,
    Secondary: draft.Secondary.trim() || null,
    Backup: draft.Backup.trim() || null,
  };
}

export function buildDepartmentPutBody(args: {
  showInternal: boolean;
  showExternal: boolean;
  internalDraft: SlotDraft;
  externalDraft: SlotDraft;
}): PutDepartmentRosterBody {
  const body: PutDepartmentRosterBody = {};
  if (args.showInternal) body.internal = draftToChannelBody(args.internalDraft);
  if (args.showExternal) body.external = draftToChannelBody(args.externalDraft);
  return body;
}

export function rosterDraftHasChanges(
  internalDraft: SlotDraft,
  externalDraft: SlotDraft,
  internalBaseline: SlotDraft,
  externalBaseline: SlotDraft,
): boolean {
  for (const tier of ROSTER_TIERS) {
    if (internalDraft[tier] !== internalBaseline[tier]) return true;
    if (externalDraft[tier] !== externalBaseline[tier]) return true;
  }
  return false;
}

export function clearChannelDraft(channel: ServiceChannel): SlotDraft {
  return emptySlotDraft();
}
