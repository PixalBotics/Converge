import type { Preview } from "@storybook/react";
import Box from "@mui/material/Box";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { ThemeRegistry } from "@/components/theme-registry";
import { AuthProvider } from "@/lib/auth";
import { GlassToastProvider } from "@/components/common/GlassToast/GlassToastProvider";

function StorybookQueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: false },
        },
      }),
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

const preview: Preview = {
  parameters: {
    layout: "fullscreen",
    controls: {
      expanded: true,
      sort: "requiredFirst",
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    backgrounds: { disable: true },
  },
  decorators: [
    (Story) => (
      <ThemeRegistry>
        <StorybookQueryProvider>
          <AuthProvider>
            <GlassToastProvider>
              <Box
                sx={{
                  minHeight: "100vh",
                  boxSizing: "border-box",
                  p: { xs: 2, sm: 3 },
                }}
              >
                <Story />
              </Box>
            </GlassToastProvider>
          </AuthProvider>
        </StorybookQueryProvider>
      </ThemeRegistry>
    ),
  ],
};

export default preview;
