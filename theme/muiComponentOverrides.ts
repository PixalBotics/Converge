/**
 * Global MUI defaults so every surface follows dashboard appearance (text, primary, cards).
 * Style overrides are the single place for hover / focus / disabled — like OS-level theme UI.
 */
import { alpha, type Theme, type ThemeOptions } from "@mui/material/styles";

const transitionFast = "background-color 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease, color 0.18s ease, opacity 0.18s ease";
const transitionTransform = `${transitionFast}, transform 0.18s ease`;

function ink(theme: Theme) {
  return theme.palette.text.primary;
}

function isDarkMode(theme: Theme) {
  return theme.palette.mode === "dark";
}

function borderSubtle(theme: Theme, mult = 1) {
  return alpha(ink(theme), isDarkMode(theme) ? 0.12 * mult : 0.14 * mult);
}

export function buildMuiComponentOverrides(): NonNullable<ThemeOptions["components"]> {
  return {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: false,
      },
      styleOverrides: {
        root: {
          transition: transitionTransform,
        },
      },
    },

    MuiButton: {
      defaultProps: {
        disableElevation: true,
        disableRipple: false,
      },
      styleOverrides: {
        root: ({ theme }) => ({
          textTransform: "none",
          fontWeight: 600,
          borderRadius: "10px",
          paddingInline: "1.1rem",
          transition: transitionTransform,
          "&:focus-visible": {
            outline: `2px solid ${alpha(theme.palette.primary.main, 0.55)}`,
            outlineOffset: 2,
          },
        }),
        sizeSmall: {
          paddingBlock: "0.4rem",
          paddingInline: "0.85rem",
          fontSize: "0.8125rem",
        },
        sizeMedium: {
          paddingBlock: "0.55rem",
        },
        sizeLarge: {
          paddingBlock: "0.7rem",
          fontSize: "0.9375rem",
        },
        contained: ({ theme }) => ({
          boxShadow: "none",
          "&:hover": {
            boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, isDarkMode(theme) ? 0.35 : 0.22)}`,
            transform: "translateY(-1px)",
          },
          "&:active": {
            transform: "translateY(0)",
            boxShadow: "none",
          },
          "&.Mui-disabled": {
            opacity: 0.48,
            color: alpha(ink(theme), 0.65),
          },
        }),
        outlined: ({ theme }) => ({
          borderWidth: "1px",
          borderColor: borderSubtle(theme),
          color: ink(theme),
          "&:hover": {
            borderColor: alpha(theme.palette.primary.main, 0.45),
            backgroundColor: alpha(theme.palette.primary.main, isDarkMode(theme) ? 0.1 : 0.06),
          },
          "&.Mui-disabled": {
            borderColor: alpha(ink(theme), 0.12),
            color: alpha(ink(theme), 0.35),
          },
        }),
        text: ({ theme }) => ({
          color: ink(theme),
          "&:hover": {
            backgroundColor: alpha(theme.palette.primary.main, isDarkMode(theme) ? 0.12 : 0.08),
          },
        }),
      },
    },

    MuiIconButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: "10px",
          transition: transitionTransform,
          color: "inherit",
          "&:hover": {
            backgroundColor: alpha(ink(theme), isDarkMode(theme) ? 0.08 : 0.06),
          },
          "&:focus-visible": {
            outline: `2px solid ${alpha(theme.palette.primary.main, 0.45)}`,
            outlineOffset: 2,
          },
          "&.Mui-disabled": {
            opacity: 0.4,
          },
        }),
        sizeSmall: {
          padding: "6px",
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundImage: "none",
          transition: transitionFast,
        }),
        outlined: ({ theme }) => ({
          borderColor: borderSubtle(theme),
          backgroundColor: alpha(ink(theme), isDarkMode(theme) ? 0.04 : 0.02),
        }),
        elevation1: ({ theme }) => ({
          boxShadow: isDarkMode(theme)
            ? `0 4px 6px rgba(0,0,0,0.2), 0 12px 28px rgba(0,0,0,0.35)`
            : `0 2px 4px rgba(15,23,42,0.06), 0 8px 24px rgba(15,23,42,0.08)`,
        }),
      },
    },

    MuiMenu: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        paper: ({ theme }) => {
          const app = theme.app;
          return {
            marginTop: 6,
            borderRadius: "12px",
            backgroundColor: app.dashboard.cardBg,
            backdropFilter: "blur(20px) saturate(160%)",
            WebkitBackdropFilter: "blur(20px) saturate(160%)",
            border: `1px solid ${app.dashboard.cardBorder}`,
            boxShadow: isDarkMode(theme)
              ? "0 16px 48px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)"
              : "0 12px 40px rgba(15,23,42,0.12), inset 0 1px 0 rgba(255,255,255,0.85)",
            paddingTop: 4,
            paddingBottom: 4,
            minWidth: 160,
          };
        },
        list: {
          paddingTop: 4,
          paddingBottom: 4,
        },
      },
    },

    MuiPopover: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        paper: ({ theme }) => ({
          borderRadius: "12px",
          backgroundColor: theme.app.dashboard.cardBg,
          backdropFilter: "blur(20px) saturate(160%)",
          WebkitBackdropFilter: "blur(20px) saturate(160%)",
          border: `1px solid ${theme.app.dashboard.cardBorder}`,
          boxShadow: isDarkMode(theme)
            ? "0 16px 48px rgba(0,0,0,0.45)"
            : "0 12px 40px rgba(15,23,42,0.12)",
        }),
      },
    },

    MuiMenuItem: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: "8px",
          marginInline: "6px",
          marginBlock: "2px",
          minHeight: 40,
          fontSize: "0.875rem",
          fontWeight: 500,
          transition: transitionFast,
          color: ink(theme),
          "&:hover": {
            backgroundColor: alpha(ink(theme), isDarkMode(theme) ? 0.08 : 0.06),
          },
          "&.Mui-focusVisible": {
            backgroundColor: alpha(theme.palette.primary.main, 0.12),
          },
          "&.Mui-selected": {
            backgroundColor: alpha(theme.palette.primary.main, isDarkMode(theme) ? 0.18 : 0.12),
            "&:hover": {
              backgroundColor: alpha(theme.palette.primary.main, isDarkMode(theme) ? 0.24 : 0.16),
            },
          },
        }),
      },
    },

    MuiListItemButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          transition: transitionFast,
          borderRadius: "10px",
          "&:hover": {
            backgroundColor: alpha(ink(theme), isDarkMode(theme) ? 0.06 : 0.05),
          },
          "&.Mui-focusVisible": {
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
          },
        }),
      },
    },

    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: "inherit",
          minWidth: 40,
        },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: ({ theme }) => ({
          borderRadius: "16px",
          backgroundColor: theme.app.dashboard.cardBg,
          backdropFilter: "blur(24px) saturate(170%)",
          WebkitBackdropFilter: "blur(24px) saturate(170%)",
          border: `1px solid ${theme.app.dashboard.cardBorder}`,
          boxShadow: isDarkMode(theme)
            ? "0 24px 64px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)"
            : "0 20px 50px rgba(15,23,42,0.15)",
          padding: 2,
        }),
      },
    },

    MuiDialogTitle: {
      styleOverrides: {
        root: ({ theme }) => ({
          fontWeight: 700,
          fontSize: "1.125rem",
          letterSpacing: "-0.02em",
          color: ink(theme),
          paddingTop: "1.25rem",
        }),
      },
    },

    MuiDialogContent: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.palette.text.secondary,
          paddingTop: 8,
        }),
      },
    },

    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: "12px 16px 16px",
          gap: 8,
        },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: "10px",
          transition: transitionFast,
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: alpha(ink(theme), isDarkMode(theme) ? 0.35 : 0.28),
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderWidth: "1px",
            borderColor: theme.palette.primary.main,
            boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.2)}`,
          },
          "& fieldset": {
            borderColor: borderSubtle(theme),
            transition: transitionFast,
          },
        }),
        input: ({ theme }) => ({
          color: ink(theme),
          "&::placeholder": {
            color: theme.app.text.placeholder,
            opacity: 1,
          },
        }),
      },
    },

    MuiInputLabel: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.palette.text.secondary,
          "&.Mui-focused": {
            color: theme.palette.primary.main,
          },
        }),
      },
    },

    MuiFormHelperText: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.palette.text.secondary,
          marginTop: 6,
        }),
      },
    },

    MuiInputAdornment: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.app.text.iconMuted,
        }),
      },
    },

    MuiSelect: {
      styleOverrides: {
        icon: ({ theme }) => ({
          color: theme.palette.text.secondary,
          transition: transitionFast,
        }),
      },
    },

    MuiAutocomplete: {
      styleOverrides: {
        paper: ({ theme }) => ({
          borderRadius: "12px",
          backgroundColor: theme.app.dashboard.cardBg,
          backdropFilter: "blur(20px) saturate(160%)",
          border: `1px solid ${theme.app.dashboard.cardBorder}`,
          boxShadow: isDarkMode(theme) ? "0 16px 48px rgba(0,0,0,0.45)" : "0 12px 40px rgba(15,23,42,0.12)",
        }),
        option: ({ theme }) => ({
          borderRadius: "8px",
          marginInline: "4px",
          fontSize: "0.875rem",
          "&[aria-selected='true']": {
            backgroundColor: alpha(theme.palette.primary.main, isDarkMode(theme) ? 0.2 : 0.12),
          },
          "&.Mui-focused": {
            backgroundColor: alpha(ink(theme), isDarkMode(theme) ? 0.08 : 0.06),
          },
        }),
        listbox: {
          padding: "6px 0",
        },
      },
    },

    MuiDivider: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderColor: alpha(ink(theme), isDarkMode(theme) ? 0.1 : 0.12),
        }),
      },
    },

    MuiTooltip: {
      styleOverrides: {
        tooltip: ({ theme }) => ({
          backgroundColor: theme.app.dashboard.chartTooltipBg,
          color: theme.app.dashboard.chartTooltipLabel,
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: `1px solid ${theme.app.dashboard.chartTooltipBorder}`,
          borderRadius: "8px",
          fontSize: "0.75rem",
          fontWeight: 600,
          boxShadow: isDarkMode(theme) ? "0 8px 24px rgba(0,0,0,0.35)" : "0 4px 16px rgba(15,23,42,0.1)",
        }),
        arrow: ({ theme }) => ({
          color: theme.app.dashboard.chartTooltipBg,
        }),
      },
    },

    MuiSwitch: {
      styleOverrides: {
        root: {
          padding: "6px 8px",
        },
        switchBase: ({ theme }) => ({
          "&.Mui-checked": {
            color: theme.palette.primary.main,
            "& + .MuiSwitch-track": {
              backgroundColor: alpha(theme.palette.primary.main, 0.55),
              opacity: 1,
            },
          },
        }),
        track: ({ theme }) => ({
          backgroundColor: alpha(ink(theme), isDarkMode(theme) ? 0.22 : 0.18),
          opacity: 1,
          borderRadius: 12,
        }),
        thumb: ({ theme }) => ({
          boxShadow: `0 2px 6px ${alpha("#000", 0.25)}`,
          backgroundColor: isDarkMode(theme) ? "#f8fafc" : theme.palette.common.white,
        }),
      },
    },

    MuiCheckbox: {
      defaultProps: {
        color: "primary",
      },
      styleOverrides: {
        root: ({ theme }) => ({
          transition: transitionFast,
          "&:hover": {
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
          },
        }),
      },
    },

    MuiRadio: {
      defaultProps: {
        color: "primary",
      },
      styleOverrides: {
        root: ({ theme }) => ({
          transition: transitionFast,
          "&:hover": {
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
          },
        }),
      },
    },

    MuiChip: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: "8px",
          fontWeight: 600,
          transition: transitionFast,
          "&:hover": {
            backgroundColor: alpha(ink(theme), isDarkMode(theme) ? 0.1 : 0.08),
          },
        }),
        outlined: ({ theme }) => ({
          borderColor: borderSubtle(theme),
          color: ink(theme),
          "&:hover": {
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
          },
        }),
      },
    },

    MuiTab: {
      styleOverrides: {
        root: ({ theme }) => ({
          textTransform: "none",
          fontWeight: 600,
          minHeight: 44,
          transition: transitionFast,
          color: theme.palette.text.secondary,
          "&:hover": {
            color: alpha(ink(theme), 0.95),
            backgroundColor: alpha(ink(theme), 0.04),
          },
          "&.Mui-selected": {
            color: theme.palette.primary.main,
          },
        }),
      },
    },

    MuiTabs: {
      styleOverrides: {
        indicator: ({ theme }) => ({
          height: 3,
          borderRadius: "3px 3px 0 0",
          backgroundColor: theme.palette.primary.main,
        }),
      },
    },

    MuiSlider: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.palette.primary.main,
          "& .MuiSlider-thumb": {
            transition: transitionTransform,
            "&:hover, &.Mui-focusVisible": {
              boxShadow: `0 0 0 8px ${alpha(theme.palette.primary.main, 0.16)}`,
            },
          },
        }),
      },
    },

    MuiAccordion: {
      defaultProps: {
        elevation: 0,
        disableGutters: false,
      },
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: alpha(ink(theme), isDarkMode(theme) ? 0.04 : 0.02),
          border: `1px solid ${borderSubtle(theme)}`,
          borderRadius: "12px !important",
          transition: transitionFast,
          "&:before": { display: "none" },
          "&.Mui-expanded": {
            margin: 0,
          },
        }),
      },
    },

    MuiAccordionSummary: {
      styleOverrides: {
        root: ({ theme }) => ({
          minHeight: 52,
          transition: transitionFast,
          "&:hover:not(.Mui-disabled)": {
            backgroundColor: alpha(ink(theme), isDarkMode(theme) ? 0.05 : 0.04),
          },
        }),
      },
    },

    MuiToggleButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          textTransform: "none",
          fontWeight: 600,
          borderRadius: "10px !important",
          borderColor: borderSubtle(theme),
          color: theme.palette.text.secondary,
          transition: transitionFast,
          "&:hover": {
            backgroundColor: alpha(theme.palette.primary.main, isDarkMode(theme) ? 0.1 : 0.06),
            borderColor: alpha(theme.palette.primary.main, 0.35),
          },
          "&.Mui-selected": {
            color: ink(theme),
            backgroundColor: alpha(theme.palette.primary.main, isDarkMode(theme) ? 0.22 : 0.14),
            borderColor: alpha(theme.palette.primary.main, 0.45),
            "&:hover": {
              backgroundColor: alpha(theme.palette.primary.main, isDarkMode(theme) ? 0.28 : 0.18),
            },
          },
        }),
      },
    },

    MuiTableCell: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderBottomColor: theme.app.dashboard.cardBorder,
          color: ink(theme),
          transition: transitionFast,
        }),
        head: ({ theme }) => ({
          fontWeight: 700,
          fontSize: "0.75rem",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: theme.palette.text.secondary,
          backgroundColor: alpha(ink(theme), isDarkMode(theme) ? 0.04 : 0.03),
        }),
      },
    },

    MuiTableRow: {
      styleOverrides: {
        root: ({ theme }) => ({
          transition: transitionFast,
          "&:hover": {
            backgroundColor: alpha(ink(theme), isDarkMode(theme) ? 0.04 : 0.03),
          },
        }),
      },
    },

    MuiLinearProgress: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 4,
          height: 6,
          backgroundColor: alpha(ink(theme), isDarkMode(theme) ? 0.12 : 0.08),
        }),
        bar: {
          borderRadius: 4,
        },
      },
    },

    MuiLink: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.app.text.link,
          transition: transitionFast,
          "&:hover": {
            color: theme.palette.primary.main,
          },
        }),
      },
    },

    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          alignItems: "flex-start",
        },
        standardInfo: ({ theme }) => ({
          backgroundColor: alpha(theme.palette.primary.main, isDarkMode(theme) ? 0.12 : 0.08),
          color: ink(theme),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
        }),
      },
    },

    MuiBackdrop: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(0,0,0,0.52)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
        },
      },
    },

    MuiTextField: {
      defaultProps: {
        variant: "outlined",
      },
    },
  };
}
