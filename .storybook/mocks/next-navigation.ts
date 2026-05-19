/**
 * Minimal `next/navigation` stubs for Storybook so dashboard chrome can render
 * without the Next.js router runtime.
 */

let mockPathname = "/dashboard";

export function setStorybookPathname(next: string) {
  mockPathname = next;
}

export function usePathname() {
  return mockPathname;
}

export function useRouter() {
  return {
    push: () => {},
    replace: () => {},
    prefetch: async () => {},
    back: () => {},
    forward: () => {},
    refresh: () => {},
  };
}

export function useSearchParams() {
  return new URLSearchParams();
}

export function useParams<T extends Record<string, string | string[]>>() {
  return {} as T;
}
