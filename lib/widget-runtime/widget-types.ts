export type WidgetTypeDto = "CHAT" | "TEXT_US" | "BOTH" | string;

export type WidgetModeDto = "AI_ONLY" | "AGENT_ONLY" | "HYBRID" | string;

export interface WidgetSurfacesDto {
  chatEnabled?: boolean;
  textUsEnabled?: boolean;
}

export interface WidgetFeatureFlagsDto {
  chat?: boolean;
  textUs?: boolean;
}

/** Public `/widget/config/:key` response — `config` may be absent until publish or on older payloads. */
export interface WidgetConfigEnvelope {
  widgetKey: string;
  websiteId: string;
  widgetType: WidgetTypeDto;
  surfaces: WidgetSurfacesDto;
  featureFlags: WidgetFeatureFlagsDto;
  embedAllowAnyOrigin?: boolean;
  versionNo?: number;
  status: string;
  allowedDomains?: string[];
  /** Chat mode sometimes appears at envelope root (`chatMode`) instead of `config.mode`. */
  chatMode?: WidgetModeDto;
  config?: {
    mode?: WidgetModeDto;
    welcomeMessage?: string;
    settingsJson?: Record<string, unknown>;
    theme?: Record<string, unknown>;
    serviceTiles?: unknown[];
    textUsFormConfig?: Record<string, unknown>;
    form?: Record<string, unknown>;
    behavior?: {
      inquiryOptions?: Array<{ label: string; value?: string }>;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
}

export interface WidgetSessionRequest {
  widgetKey: string;
  deployKey: string;
  originHost: string;
}

export interface WidgetSessionResponse {
  tokenType: string;
  sessionToken: string;
  expiresIn: string;
  widgetKey: string;
  websiteId: string;
  widgetType: string;
  surfaces: WidgetSurfacesDto;
}

export interface AiVisitorRespondRequest {
  message: string;
  /** KB scope + conversation resolution — omit when empty so backend can resolve from conversationId. */
  websiteId?: string;
  conversationId?: string;
  widgetKey: string;
  originHost: string;
  /**
   * Full page URL where the widget is embedded. When backend enables live-page context, this grounds the model.
   * Same semantics as widget message APIs’ `currentPageUrl`.
   */
  currentPageUrl?: string;
}

export interface AiVisitorRespondResponse {
  intent?: string;
  shouldEscalate?: boolean;
  response: string;
  knowledgeMatches?: Array<{
    sourceId: string;
    sourceRef?: string;
    score?: number;
  }>;
}
