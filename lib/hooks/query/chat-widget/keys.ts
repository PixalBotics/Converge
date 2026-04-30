export const chatWidgetKeys = {
  all: ["chat-widget", "admin"] as const,
  published: (widgetId: string) => [...chatWidgetKeys.all, "published", widgetId] as const,
  draft: (widgetId: string) => [...chatWidgetKeys.all, "draft", widgetId] as const,
};
