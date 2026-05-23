export type FilterableComboOption = {
  value: string;
  label: string;
  /** Shown in list but not selectable (e.g. loading / hint rows). */
  disabled?: boolean;
};

export type FilterableComboFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterableComboOption[];
  placeholder?: string;
  disabled?: boolean;
  /** Shown when the typed query matches nothing. */
  noMatchesMessage?: string;
  /** Max height of the suggestion panel (px). */
  listMaxHeight?: number;
  /** `aria-label` on the typeable input (defaults to `label`). */
  inputAriaLabel?: string;
};
