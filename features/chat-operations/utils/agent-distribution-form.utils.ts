export function agentDistributionFieldMultiline(
  fieldType: string,
  fieldKey: string,
): boolean {
  const t = fieldType.toLowerCase();
  return (
    t === "textarea" ||
    t === "multiline" ||
    fieldKey === "transcript" ||
    fieldKey === "journey" ||
    fieldKey === "notes"
  );
}

export type AgentDistributionFormFieldLike = {
  fieldKey: string;
  label: string;
  fieldType: string;
  enabled?: boolean;
  isRequired?: boolean;
  readOnly?: boolean;
};
