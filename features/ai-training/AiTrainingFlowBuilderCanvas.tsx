"use client";

import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
  type DragEvent as ReactDragEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import CloseRounded from "@mui/icons-material/CloseRounded";
import AccountTreeOutlined from "@mui/icons-material/AccountTreeOutlined";
import CenterFocusStrongRounded from "@mui/icons-material/CenterFocusStrongRounded";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import LinkOffRounded from "@mui/icons-material/LinkOffRounded";
import LinkRounded from "@mui/icons-material/LinkRounded";
import PreviewOutlined from "@mui/icons-material/PreviewOutlined";
import RestartAltRounded from "@mui/icons-material/RestartAltRounded";
import SettingsRounded from "@mui/icons-material/SettingsRounded";
import WidgetsOutlined from "@mui/icons-material/WidgetsOutlined";
import ZoomInRounded from "@mui/icons-material/ZoomInRounded";
import ZoomOutRounded from "@mui/icons-material/ZoomOutRounded";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { useTheme, alpha } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { mergeSx } from "@/lib/mui/merge-sx";
import { Typography } from "@/components/common";
import type { AiPipelineStep, FlowExecutionStep } from "@/api/ai-training/ai-training.api";
import {
  useAiTrainingAutomationFlowQuery,
  useSaveAiTrainingAutomationFlowMutation,
} from "@/lib/hooks/query/ai-training/hooks";
import {
  FLOW_NODE_CATALOG,
  PIPELINE_STEP_TO_NODE_TYPE,
  type FlowBuilderGraph,
  type FlowBuilderNode,
  type FlowBuilderNodeType,
} from "./ai-flow-builder.types";
import { flowNodeIcon } from "./ai-flow-builder.icons";
import { defaultFlowGraph } from "./ai-flow-builder.storage";
import { autoLayoutFlowGraph, flowGraphNeedsAutoLayout, nextFreeNodePosition } from "./ai-flow-layout.util";
import type { AiTrainingKbVariant } from "./ai-training-kb.utils";
import {
  aiTrainingStudioCanvasArea,
  aiTrainingStudioGridBg,
  aiTrainingStudioShell,
  aiTrainingStudioToolbarLeadingSx,
  aiTrainingStudioToolbarRow,
  aiTrainingStudioToolCluster,
  aiTrainingSettingsDrawerBody,
  aiTrainingSettingsDrawerHeader,
  aiTrainingSettingsDrawerPaper,
} from "./ai-training-studio.styles";
import { AiTrainingFlowNodeInspector } from "./AiTrainingFlowNodeInspector";
import { AiTrainingFlowPalette } from "./AiTrainingFlowPalette";
import { AiTrainingFlowExecutionPanel } from "./AiTrainingFlowExecutionPanel";
import { AiTrainingStudioGuideBar } from "./AiTrainingStudioGuideBar";
import { AiTrainingFlowWireGuide } from "./AiTrainingFlowWireGuide";
import {
  AiTrainingFlowStudioSubTabs,
  type FlowStudioSubTab,
} from "./AiTrainingFlowStudioSubTabs";
import { FLOW_BUILDER_EXPERIMENTAL_UI } from "./ai-training-studio.flags";
import { flowNodeDisplaySubtitle, studioColors } from "./ai-training-studio.tokens";

const NODE_W = 232;
const NODE_H = 88;
const CANVAS_W = 1600;
const CANVAS_H = 1000;
const PORT_R = 10;

function clientToCanvas(
  clientX: number,
  clientY: number,
  rect: DOMRect,
  pan: { x: number; y: number },
  zoom: number,
) {
  return {
    x: (clientX - rect.left - pan.x) / zoom,
    y: (clientY - rect.top - pan.y) / zoom,
  };
}

function catalogMeta(type: FlowBuilderNodeType) {
  return FLOW_NODE_CATALOG.find((c) => c.type === type)!;
}

function newNodeId(): string {
  return `n-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function portOut(node: FlowBuilderNode): { x: number; y: number } {
  return { x: node.x + NODE_W / 2, y: node.y + NODE_H };
}

function portIn(node: FlowBuilderNode): { x: number; y: number } {
  return { x: node.x + NODE_W / 2, y: node.y };
}

function edgePath(from: FlowBuilderNode, to: FlowBuilderNode): string {
  const { x: x1, y: y1 } = portOut(from);
  const { x: x2, y: y2 } = portIn(to);
  const midY = (y1 + y2) / 2;
  return `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
}

function edgeMidpoint(from: FlowBuilderNode, to: FlowBuilderNode): { x: number; y: number } {
  const { x: x1, y: y1 } = portOut(from);
  const { x: x2, y: y2 } = portIn(to);
  return { x: (x1 + x2) / 2, y: (y1 + y2) / 2 };
}

export function AiTrainingFlowBuilderCanvas({
  websiteId,
  variant,
  pipelineSteps,
  activeFlowNodeIds,
  activeFlowEdgeIds,
  isRunning,
  selectedNodeId,
  onSelectNode,
  toolbarLeading,
  navTabs,
  topBar,
  scrapeBar,
  testChat,
  settingsPanel,
  studioView = "advanced",
  simpleContent,
  viewToggle,
  flowExecution = [],
  flowExecutionErrors = [],
}: {
  websiteId: string;
  variant: AiTrainingKbVariant;
  pipelineSteps: AiPipelineStep[];
  activeFlowNodeIds?: string[];
  activeFlowEdgeIds?: string[];
  isRunning?: boolean;
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
  toolbarLeading?: ReactNode;
  navTabs?: ReactNode;
  topBar?: ReactNode;
  scrapeBar?: ReactNode;
  testChat?: ReactNode;
  settingsPanel?: ReactNode;
  studioView?: "simple" | "advanced";
  simpleContent?: ReactNode;
  viewToggle?: ReactNode;
  flowExecution?: FlowExecutionStep[];
  flowExecutionErrors?: string[];
}) {
  const theme = useTheme() as AppTheme;
  const canvasRef = useRef<HTMLDivElement>(null);
  const flowQuery = useAiTrainingAutomationFlowQuery(websiteId, variant);
  const saveFlowMutation = useSaveAiTrainingAutomationFlowMutation();
  const hydratedRef = useRef(false);
  const skipSaveRef = useRef(true);
  const [graph, setGraph] = useState<FlowBuilderGraph>(() => defaultFlowGraph());
  const [zoom, setZoom] = useState(0.92);
  const [pan, setPan] = useState({ x: 48, y: 56 });
  const [connectFrom, setConnectFrom] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [connectPointer, setConnectPointer] = useState<{ x: number; y: number } | null>(null);
  /** Side panel shows only the block the user explicitly clicked (not palette add). */
  const [inspectorNodeId, setInspectorNodeId] = useState<string | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [flowSubTab, setFlowSubTab] = useState<FlowStudioSubTab>("diagram");
  const isAdvanced = studioView === "advanced";
  const flowEditing = FLOW_BUILDER_EXPERIMENTAL_UI;
  const d = theme.app.dashboard;
  const c = studioColors(theme);
  const isLight = theme.palette.mode === "light";
  const dragRef = useRef<{
    nodeId: string;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);
  const panRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(
    null,
  );

  useEffect(() => {
    hydratedRef.current = false;
    skipSaveRef.current = true;
  }, [websiteId, variant]);

  useEffect(() => {
    if (flowQuery.data && !hydratedRef.current) {
      let next = flowQuery.data as FlowBuilderGraph;
      const needsLayout = flowGraphNeedsAutoLayout(next);
      if (needsLayout) {
        next = autoLayoutFlowGraph(next);
      }
      setGraph(next);
      hydratedRef.current = true;
      skipSaveRef.current = !needsLayout;
      if (needsLayout && isAdvanced) {
        window.setTimeout(() => fitView(), 150);
      }
    }
    // fitView intentionally omitted — stable ref from closure on first hydrate only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flowQuery.data]);

  useEffect(() => {
    if (!isAdvanced || !hydratedRef.current) return;
    const t = window.setTimeout(() => fitView(), 120);
    return () => window.clearTimeout(t);
    // fit once when advanced diagram loads
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdvanced, websiteId, variant, flowSubTab]);

  useEffect(() => {
    if (!isAdvanced || flowSubTab !== "diagram" || !canvasRef.current) return;
    const el = canvasRef.current;
    const ro = new ResizeObserver(() => {
      window.requestAnimationFrame(() => fitView());
    });
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdvanced, flowSubTab, websiteId, variant]);

  useEffect(() => {
    if (!hydratedRef.current) return;
    if (skipSaveRef.current) {
      skipSaveRef.current = false;
      return;
    }
    const timer = window.setTimeout(() => {
      saveFlowMutation.mutate({ websiteId, variant, graph });
    }, 900);
    return () => window.clearTimeout(timer);
  }, [graph, websiteId, variant]);

  useEffect(() => {
    if (!flowEditing && flowSubTab === "execution") setFlowSubTab("diagram");
  }, [flowEditing, flowSubTab]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea") return;

      if (e.key === "Escape") {
        setConnectFrom(null);
        setConnectPointer(null);
        setSelectedEdgeId(null);
        setInspectorNodeId(null);
        onSelectNode(null);
      }
      if (!flowEditing) return;
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedEdgeId) {
          e.preventDefault();
          setGraph((g) => ({
            ...g,
            edges: g.edges.filter((edge) => edge.id !== selectedEdgeId),
          }));
          setSelectedEdgeId(null);
          return;
        }
        if (selectedNodeId) {
          e.preventDefault();
          setGraph((g) => ({
            nodes: g.nodes.filter((n) => n.id !== selectedNodeId),
            edges: g.edges.filter((edge) => edge.from !== selectedNodeId && edge.to !== selectedNodeId),
          }));
          onSelectNode(null);
          setInspectorNodeId(null);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedNodeId, selectedEdgeId, onSelectNode, inspectorNodeId, flowEditing]);

  const activeNodeIdSet = useMemo(() => {
    if (activeFlowNodeIds?.length) return new Set(activeFlowNodeIds);
    const types = new Set<FlowBuilderNodeType>();
    types.add("trigger");
    for (const step of pipelineSteps) {
      const t = PIPELINE_STEP_TO_NODE_TYPE[step.id];
      if (t) types.add(t);
    }
    return new Set(graph.nodes.filter((n) => types.has(n.type)).map((n) => n.id));
  }, [activeFlowNodeIds, pipelineSteps, graph.nodes]);

  const activeEdgeIdSet = useMemo(() => {
    if (activeFlowEdgeIds?.length) return new Set(activeFlowEdgeIds);
    if (pipelineSteps.length === 0) return new Set<string>();
    return new Set(
      graph.edges
        .filter((e) => activeNodeIdSet.has(e.from) && activeNodeIdSet.has(e.to))
        .map((e) => e.id),
    );
  }, [activeFlowEdgeIds, graph.edges, activeNodeIdSet, pipelineSteps.length]);

  const addNode = (type: FlowBuilderNodeType, atX?: number, atY?: number) => {
    const meta = catalogMeta(type);
    const id = newNodeId();
    setGraph((g) => {
      const pos =
        atX != null && atY != null ? { x: atX, y: atY } : nextFreeNodePosition(g.nodes);
      return {
        ...g,
        nodes: [
          ...g.nodes,
          {
            id,
            type,
            label: meta.label,
            detail: meta.detail,
            x: pos.x,
            y: pos.y,
          },
        ],
      };
    });
    onSelectNode(id);
    setInspectorNodeId(null);
    setSelectedEdgeId(null);
    setConnectFrom(null);
  };

  const addEdge = (fromId: string, toId: string) => {
    if (fromId === toId) return;
    setGraph((g) => {
      if (g.edges.some((e) => e.from === fromId && e.to === toId)) return g;
      return {
        ...g,
        edges: [...g.edges, { id: `e-${Date.now()}`, from: fromId, to: toId }],
      };
    });
  };

  const deleteSelected = () => {
    if (selectedEdgeId) {
      setGraph((g) => ({
        ...g,
        edges: g.edges.filter((e) => e.id !== selectedEdgeId),
      }));
      setSelectedEdgeId(null);
      return;
    }
    if (!selectedNodeId) return;
    setGraph((g) => ({
      nodes: g.nodes.filter((n) => n.id !== selectedNodeId),
      edges: g.edges.filter((e) => e.from !== selectedNodeId && e.to !== selectedNodeId),
    }));
    onSelectNode(null);
    setInspectorNodeId(null);
  };

  const deleteEdge = (edgeId: string) => {
    setGraph((g) => ({
      ...g,
      edges: g.edges.filter((e) => e.id !== edgeId),
    }));
    setSelectedEdgeId(null);
  };

  const resetTemplate = () => {
    setGraph(defaultFlowGraph());
    onSelectNode(null);
    setConnectFrom(null);
    setConnectPointer(null);
    setSelectedEdgeId(null);
    setPan({ x: 48, y: 56 });
    setZoom(0.92);
    window.setTimeout(() => fitView(), 80);
  };

  const arrangeLayout = () => {
    setGraph((g) => autoLayoutFlowGraph(g));
    onSelectNode(null);
    setConnectFrom(null);
    setConnectPointer(null);
    setSelectedEdgeId(null);
    window.setTimeout(() => fitView(), 80);
  };

  const fitView = () => {
    if (graph.nodes.length === 0 || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const topPad = 48;
    const bottomPad = 72;
    const sidePad = 48;
    const minX = Math.min(...graph.nodes.map((n) => n.x)) - sidePad;
    const minY = Math.min(...graph.nodes.map((n) => n.y)) - topPad;
    const maxX = Math.max(...graph.nodes.map((n) => n.x + NODE_W)) + sidePad;
    const maxY = Math.max(...graph.nodes.map((n) => n.y + NODE_H)) + bottomPad;
    const contentW = maxX - minX;
    const contentH = maxY - minY;
    const scale = Math.min(1.05, Math.max(0.45, Math.min(rect.width / contentW, rect.height / contentH)));
    setZoom(scale);
    setPan({
      x: (rect.width - contentW * scale) / 2 - minX * scale,
      y: (rect.height - contentH * scale) / 2 - minY * scale,
    });
  };

  const tryConnect = (targetId: string) => {
    if (!connectFrom || connectFrom === targetId) return;
    addEdge(connectFrom, targetId);
    setConnectFrom(null);
    setConnectPointer(null);
  };

  const openNodePreview = (nodeId: string) => {
    if (inspectorNodeId === nodeId) {
      setInspectorNodeId(null);
      onSelectNode(null);
      return;
    }
    onSelectNode(nodeId);
    setInspectorNodeId(nodeId);
    setSelectedEdgeId(null);
  };

  const startConnectFrom = (nodeId: string, e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setConnectFrom(nodeId);
    setSelectedEdgeId(null);
    onSelectNode(nodeId);
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setConnectPointer(clientToCanvas(e.clientX, e.clientY, rect, pan, zoom));
    }
  };

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      if (connectFrom && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setConnectPointer(clientToCanvas(e.clientX, e.clientY, rect, pan, zoom));
      }
      if (dragRef.current) {
        const d = dragRef.current;
        const dx = (e.clientX - d.startX) / zoom;
        const dy = (e.clientY - d.startY) / zoom;
        setGraph((g) => ({
          ...g,
          nodes: g.nodes.map((n) =>
            n.id === d.nodeId ? { ...n, x: d.origX + dx, y: d.origY + dy } : n,
          ),
        }));
      } else if (panRef.current) {
        const p = panRef.current;
        setPan({
          x: p.origX + (e.clientX - p.startX),
          y: p.origY + (e.clientY - p.startY),
        });
      }
    },
    [zoom, connectFrom, pan],
  );

  const onPointerUp = useCallback(
    (e: PointerEvent) => {
      if (connectFrom) {
        const el = document.elementFromPoint(e.clientX, e.clientY);
        const inPort = el?.closest('[data-flow-port="in"]');
        const targetId = inPort?.getAttribute("data-node-id");
        if (targetId && targetId !== connectFrom) {
          setGraph((g) => {
            if (g.edges.some((edge) => edge.from === connectFrom && edge.to === targetId)) return g;
            return {
              ...g,
              edges: [...g.edges, { id: `e-${Date.now()}`, from: connectFrom!, to: targetId }],
            };
          });
        }
        setConnectFrom(null);
        setConnectPointer(null);
      }

      const drag = dragRef.current;
      if (drag) {
        const moved = Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY);
        if (moved < 6) {
          onSelectNode(drag.nodeId);
          setSelectedEdgeId(null);
        }
      }

      dragRef.current = null;
      panRef.current = null;
    },
    [connectFrom, onSelectNode],
  );

  useEffect(() => {
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [onPointerMove, onPointerUp]);

  const updateSelectedNode = (patch: Partial<FlowBuilderNode>) => {
    const id = inspectorNodeId ?? selectedNodeId;
    if (!id) return;
    setGraph((g) => ({
      ...g,
      nodes: g.nodes.map((n) => (n.id === id ? { ...n, ...patch } : n)),
    }));
  };

  const beginPan = (clientX: number, clientY: number) => {
    panRef.current = {
      startX: clientX,
      startY: clientY,
      origX: pan.x,
      origY: pan.y,
    };
    onSelectNode(null);
    setInspectorNodeId(null);
  };

  return (
    <Box sx={aiTrainingStudioShell}>
      <Box sx={aiTrainingStudioToolbarRow}>
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            flexWrap: "nowrap",
            overflow: "hidden",
          }}
        >
          <Box sx={aiTrainingStudioToolbarLeadingSx}>
            {toolbarLeading}
            {toolbarLeading && (navTabs || viewToggle) ? (
              <Box
                sx={{
                  width: "1px",
                  alignSelf: "stretch",
                  minHeight: 26,
                  bgcolor: alpha(c.border, 0.75),
                  flexShrink: 0,
                  display: { xs: "none", sm: "block" },
                }}
              />
            ) : null}
            {navTabs}
            {viewToggle}
          </Box>
          {topBar ? (
            <Box
              sx={{
                width: "1px",
                alignSelf: "stretch",
                minHeight: 24,
                bgcolor: alpha(c.border, 0.75),
                flexShrink: 0,
                display: { xs: "none", md: "block" },
                mx: 0.25,
              }}
            />
          ) : null}
          {topBar}
          {isAdvanced && flowEditing ? (
            <AiTrainingFlowStudioSubTabs
              value={flowSubTab}
              onChange={setFlowSubTab}
              executionCount={flowExecution.length}
              errorCount={flowExecutionErrors.length}
            />
          ) : null}
        </Box>
        <Box sx={aiTrainingStudioToolCluster}>
          {isAdvanced && pipelineSteps.length > 0 ? (
            <Box
              sx={{
                px: 1,
                py: 0.35,
                mr: 0.25,
                borderRadius: 999,
                bgcolor: "rgba(34,197,94,0.15)",
                color: theme.palette.success.light,
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              Live path
            </Box>
          ) : null}
          {isRunning ? (
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, px: 0.5 }}>
              Testing…
            </Typography>
          ) : null}
          {isAdvanced && flowSubTab === "diagram" && flowEditing ? (
            <>
              <Tooltip title={paletteOpen ? "Hide flow blocks" : "Add flow blocks"}>
                <IconButton
                  size="small"
                  onClick={() => setPaletteOpen((o) => !o)}
                  sx={{
                    color: paletteOpen ? d.accentBlue : c.textSecondary,
                    bgcolor: paletteOpen ? alpha(d.accentBlue, 0.12) : "transparent",
                  }}
                >
                  <WidgetsOutlined fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Connect wires: drag from bottom dot of one block to top dot of another">
                <IconButton
                  size="small"
                  color={connectFrom ? "primary" : "default"}
                  onClick={() => {
                    setSelectedEdgeId(null);
                    setConnectFrom(selectedNodeId);
                  }}
                  disabled={!selectedNodeId}
                  sx={{ color: c.textSecondary }}
                >
                  <LinkRounded fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={selectedEdgeId ? "Remove selected wire" : "Delete selected block (Del key)"}>
                <IconButton
                  size="small"
                  onClick={deleteSelected}
                  disabled={!selectedNodeId && !selectedEdgeId}
                  sx={{ color: c.textSecondary }}
                >
                  {selectedEdgeId ? (
                    <LinkOffRounded fontSize="small" />
                  ) : (
                    <DeleteOutlineRounded fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
              <Tooltip title="Auto-arrange blocks (fix overlap)">
                <IconButton size="small" onClick={arrangeLayout} sx={{ color: c.textSecondary }}>
                  <AccountTreeOutlined fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Reset to default flow template">
                <IconButton size="small" onClick={resetTemplate} sx={{ color: c.textSecondary }}>
                  <RestartAltRounded fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Fit all blocks on screen">
                <IconButton size="small" onClick={fitView} sx={{ color: c.textSecondary }}>
                  <CenterFocusStrongRounded fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Zoom out">
                <IconButton
                  size="small"
                  onClick={() => setZoom((z) => Math.max(0.5, z - 0.08))}
                  sx={{ color: c.textSecondary }}
                >
                  <ZoomOutRounded fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Zoom in">
                <IconButton
                  size="small"
                  onClick={() => setZoom((z) => Math.min(1.35, z + 0.08))}
                  sx={{ color: c.textSecondary }}
                >
                  <ZoomInRounded fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          ) : isAdvanced && flowSubTab === "diagram" ? (
            <>
              <Tooltip title="Fit all blocks on screen">
                <IconButton size="small" onClick={fitView} sx={{ color: c.textSecondary }}>
                  <CenterFocusStrongRounded fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Zoom out">
                <IconButton
                  size="small"
                  onClick={() => setZoom((z) => Math.max(0.5, z - 0.08))}
                  sx={{ color: c.textSecondary }}
                >
                  <ZoomOutRounded fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Zoom in">
                <IconButton
                  size="small"
                  onClick={() => setZoom((z) => Math.min(1.35, z + 0.08))}
                  sx={{ color: c.textSecondary }}
                >
                  <ZoomInRounded fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          ) : null}
          {settingsPanel ? (
            <Tooltip title="Bot settings — messages & answer quality">
              <IconButton size="small" onClick={() => setSettingsOpen(true)} sx={{ color: c.textSecondary }}>
                <SettingsRounded fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : null}
        </Box>
      </Box>

      {scrapeBar}

      <Box sx={aiTrainingStudioCanvasArea}>
        {!isAdvanced && simpleContent ? (
          <Box sx={{ position: "relative", width: "100%", height: "100%", minHeight: 0, display: "flex", flexDirection: "column" }}>
            <Box sx={{ flex: 1, minHeight: 0, position: "relative" }}>
              {simpleContent}
              {testChat}
            </Box>
            {flowEditing ? (
              <AiTrainingFlowExecutionPanel
                steps={flowExecution}
                errors={flowExecutionErrors}
                isRunning={isRunning}
              />
            ) : null}
          </Box>
        ) : (
        <Box sx={{ display: "flex", flex: 1, flexDirection: "column", minHeight: 0, minWidth: 0, position: "relative", width: "100%" }}>
          {flowEditing && flowSubTab === "execution" ? (
            <AiTrainingFlowExecutionPanel
              variant="page"
              steps={flowExecution}
              errors={flowExecutionErrors}
              isRunning={isRunning}
            />
          ) : (
          <Box sx={{ flex: 1, minWidth: 0, minHeight: 0, display: "flex", flexDirection: "column", position: "relative" }}>
          <Box
            ref={canvasRef}
            sx={(t) => ({
              flex: 1,
              minWidth: 0,
              minHeight: 320,
              overflow: "hidden",
              cursor: panRef.current ? "grabbing" : connectFrom ? "crosshair" : "default",
              position: "relative",
              pb: { xs: 7, sm: 0 },
              pr: { xs: 0, sm: testChat ? 2 : 0 },
              ...aiTrainingStudioGridBg(t, zoom, pan),
            })}
            onDragOver={
              flowEditing
                ? (e: ReactDragEvent<HTMLDivElement>) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "copy";
                  }
                : undefined
            }
            onDrop={
              flowEditing
                ? (e: ReactDragEvent<HTMLDivElement>) => {
                    e.preventDefault();
                    const type = e.dataTransfer.getData("application/flow-node-type") as FlowBuilderNodeType;
                    if (!type || !canvasRef.current) return;
                    const rect = canvasRef.current.getBoundingClientRect();
                    const pos = clientToCanvas(e.clientX, e.clientY, rect, pan, zoom);
                    addNode(type, pos.x - NODE_W / 2, pos.y - NODE_H / 2);
                  }
                : undefined
            }
            onPointerDown={(e: ReactPointerEvent<HTMLDivElement>) => {
              if (e.target === e.currentTarget) {
                beginPan(e.clientX, e.clientY);
                setSelectedEdgeId(null);
              }
            }}
          >
            {!connectFrom && !selectedEdgeId ? <AiTrainingStudioGuideBar /> : null}
            {!connectFrom && !selectedEdgeId && flowEditing ? (
              <Box sx={{ position: "absolute", bottom: 56, left: 16, zIndex: 14 }}>
                <AiTrainingFlowWireGuide />
              </Box>
            ) : null}
            {connectFrom ? (
              <Box
                sx={{
                  position: "absolute",
                  top: 12,
                  left: "50%",
                  transform: "translateX(-50%)",
                  zIndex: 20,
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  bgcolor: d.accentBlue,
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 600,
                  boxShadow: `0 8px 24px ${alpha(d.accentBlue, 0.45)}`,
                  pointerEvents: "none",
                  textAlign: "center",
                  maxWidth: 360,
                  lineHeight: 1.45,
                }}
              >
                {(() => {
                  const fromNode = graph.nodes.find((n) => n.id === connectFrom);
                  const name = fromNode?.label ?? "Block";
                  return (
                    <>
                      Connecting from <strong>{name}</strong>
                      <br />
                      Step 2 → drag to another block&apos;s top dot ● · Esc to cancel
                    </>
                  );
                })()}
              </Box>
            ) : null}
            {selectedEdgeId ? (
              <Box
                sx={{
                  position: "absolute",
                  top: 12,
                  left: "50%",
                  transform: "translateX(-50%)",
                  zIndex: 20,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  px: 1.5,
                  py: 0.75,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.error.main, 0.92),
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 600,
                  boxShadow: `0 8px 24px ${alpha(theme.palette.error.main, 0.35)}`,
                }}
              >
                <span>Wire selected</span>
                <Box
                  component="button"
                  type="button"
                  onClick={() => deleteEdge(selectedEdgeId)}
                  sx={{
                    border: "1px solid rgba(255,255,255,0.5)",
                    borderRadius: 1,
                    bgcolor: "rgba(255,255,255,0.15)",
                    color: "#fff",
                    px: 1,
                    py: 0.25,
                    cursor: "pointer",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  Remove wire
                </Box>
              </Box>
            ) : null}

            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: CANVAS_W,
                height: CANVAS_H,
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: "0 0",
              }}
              onPointerDown={(e) => {
                if (e.target === e.currentTarget) beginPan(e.clientX, e.clientY);
              }}
            >
              <svg
                width={CANVAS_W}
                height={CANVAS_H}
                style={{ position: "absolute", top: 0, left: 0, zIndex: 1, overflow: "visible", pointerEvents: "none" }}
              >
                <defs>
                  <marker id="flow-arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
                    <path d="M0,0 L10,5 L0,10 Z" fill={isLight ? "#475569" : "#94a3b8"} />
                  </marker>
                  <marker id="flow-arrow-active" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
                    <path d="M0,0 L10,5 L0,10 Z" fill={d.accentBlue} />
                  </marker>
                  <marker id="flow-arrow-selected" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
                    <path d="M0,0 L10,5 L0,10 Z" fill={theme.palette.error.main} />
                  </marker>
                </defs>
                {graph.edges.map((edge) => {
                  const from = graph.nodes.find((n) => n.id === edge.from);
                  const to = graph.nodes.find((n) => n.id === edge.to);
                  if (!from || !to) return null;
                  const active = activeEdgeIdSet.has(edge.id);
                  const selected = selectedEdgeId === edge.id;
                  const mid = edgeMidpoint(from, to);
                  const pathD = edgePath(from, to);
                  const stroke = selected
                    ? theme.palette.error.main
                    : active
                      ? d.accentBlue
                      : isLight
                        ? "#64748b"
                        : "#94a3b8";
                  const marker = selected
                    ? "url(#flow-arrow-selected)"
                    : active
                      ? "url(#flow-arrow-active)"
                      : "url(#flow-arrow)";
                  return (
                    <g key={`vis-${edge.id}`}>
                      <path
                        d={pathD}
                        fill="none"
                        stroke={stroke}
                        strokeWidth={selected ? 3.5 : active ? 3 : 2.5}
                        markerEnd={marker}
                      />
                      {edge.label ? (
                        <text
                          x={mid.x}
                          y={mid.y - 8}
                          textAnchor="middle"
                          fill={stroke}
                          fontSize={11}
                          fontWeight={700}
                        >
                          {edge.label}
                        </text>
                      ) : null}
                    </g>
                  );
                })}
              </svg>

              {graph.nodes.map((node) => {
                const meta = catalogMeta(node.type);
                const selected = selectedNodeId === node.id;
                const active = activeNodeIdSet.has(node.id) && pipelineSteps.length > 0;
                const connecting = connectFrom === node.id;
                const isConnectTarget = Boolean(connectFrom && connectFrom !== node.id);
                const nodeBg = c.surface;

                return (
                  <Box
                    key={node.id}
                    onPointerDown={(e) => {
                      if ((e.target as HTMLElement).closest("[data-flow-port]")) return;
                      if ((e.target as HTMLElement).closest("[data-flow-preview]")) return;
                      e.stopPropagation();
                      setSelectedEdgeId(null);
                      onSelectNode(node.id);
                      dragRef.current = {
                        nodeId: node.id,
                        startX: e.clientX,
                        startY: e.clientY,
                        origX: node.x,
                        origY: node.y,
                      };
                    }}
                    sx={{
                      position: "absolute",
                      left: node.x,
                      top: node.y,
                      width: NODE_W,
                      minHeight: NODE_H,
                      borderRadius: 2,
                      bgcolor: nodeBg,
                      border: `2px solid ${
                        connecting || selected
                          ? d.accentBlue
                          : active
                            ? meta.color
                            : alpha(d.cardBorder, 0.55)
                      }`,
                      boxShadow: selected
                        ? `0 0 0 3px ${alpha(d.accentBlue, 0.25)}, 0 12px 28px rgba(0,0,0,0.18)`
                        : active
                          ? `0 8px 22px ${alpha(meta.color, 0.35)}`
                          : `0 4px 14px rgba(0,0,0,${isLight ? 0.08 : 0.25})`,
                      cursor: "grab",
                      overflow: "visible",
                      zIndex: selected || connecting ? 12 : 10,
                      transition: "box-shadow 0.15s, border-color 0.15s",
                    }}
                  >
                    {flowEditing ? (
                    <Box
                      data-flow-port="in"
                      data-node-id={node.id}
                      onPointerUp={(e) => {
                        e.stopPropagation();
                        if (connectFrom) tryConnect(node.id);
                      }}
                      sx={{
                        position: "absolute",
                        top: -PORT_R - 2,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: (PORT_R + 2) * 2,
                        height: (PORT_R + 2) * 2,
                        borderRadius: "50%",
                        bgcolor: isConnectTarget ? d.accentBlue : nodeBg,
                        border: `3px solid ${isConnectTarget || connectFrom ? d.accentBlue : alpha(d.cardBorder, 0.8)}`,
                        cursor: connectFrom ? "crosshair" : "pointer",
                        zIndex: 14,
                        boxShadow: isConnectTarget ? `0 0 0 4px ${alpha(d.accentBlue, 0.3)}` : undefined,
                        "&:hover": { borderColor: meta.color, transform: "translateX(-50%) scale(1.12)" },
                      }}
                    />
                    ) : null}

                    <Box sx={{ display: "flex", alignItems: "stretch", minHeight: NODE_H - 4 }}>
                      <Box sx={{ width: 4, borderRadius: "8px 0 0 8px", bgcolor: meta.color, flexShrink: 0 }} />
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1.1, py: 0.85, flex: 1, minWidth: 0 }}>
                        <Box
                          sx={{
                            width: 34,
                            height: 34,
                            borderRadius: 1.25,
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor: alpha(meta.color, 0.14),
                            color: meta.color,
                          }}
                        >
                          {flowNodeIcon(meta.icon, meta.type)}
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="caption" fontWeight={700} sx={{ color: c.text, display: "block" }}>
                            {node.label}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: c.textSecondary, display: "block", lineHeight: 1.35, mt: 0.15, fontSize: 11 }}
                          >
                            {flowNodeDisplaySubtitle(node)}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {flowEditing ? (
                    <Box
                      data-flow-port="out"
                      data-node-id={node.id}
                      onPointerDown={(e) => startConnectFrom(node.id, e)}
                      sx={{
                        position: "absolute",
                        bottom: -PORT_R - 2,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: (PORT_R + 2) * 2,
                        height: (PORT_R + 2) * 2,
                        borderRadius: "50%",
                        bgcolor: connecting ? d.accentBlue : nodeBg,
                        border: `3px solid ${connecting || selected ? d.accentBlue : meta.color}`,
                        cursor: "crosshair",
                        zIndex: 14,
                        "&:hover": { bgcolor: meta.color, borderColor: meta.color, transform: "translateX(-50%) scale(1.12)" },
                      }}
                    />
                    ) : null}

                    <Tooltip title="Preview block details" placement="top">
                      <Box
                        component="button"
                        type="button"
                        data-flow-preview
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          openNodePreview(node.id);
                        }}
                        sx={{
                          position: "absolute",
                          top: 6,
                          right: 6,
                          zIndex: 15,
                          width: 28,
                          height: 28,
                          borderRadius: 1.25,
                          border: `1px solid ${inspectorNodeId === node.id ? d.accentBlue : c.border}`,
                          bgcolor: inspectorNodeId === node.id ? alpha(d.accentBlue, 0.12) : c.surfaceMuted,
                          color: inspectorNodeId === node.id ? d.accentBlue : c.textSecondary,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          p: 0,
                          transition: "background 0.12s, border-color 0.12s, color 0.12s",
                          "&:hover": {
                            bgcolor: alpha(d.accentBlue, 0.15),
                            borderColor: d.accentBlue,
                            color: d.accentBlue,
                          },
                        }}
                      >
                        <PreviewOutlined sx={{ fontSize: 16 }} />
                      </Box>
                    </Tooltip>

                    {active ? (
                      <Box
                        sx={{
                          position: "absolute",
                          top: 8,
                          left: 8,
                          px: 0.65,
                          py: 0.15,
                          borderRadius: 999,
                          bgcolor: alpha(theme.palette.success.main, 0.18),
                          color: theme.palette.success.light,
                          fontSize: 9,
                          fontWeight: 800,
                        }}
                      >
                        RUN
                      </Box>
                    ) : null}
                  </Box>
                );
              })}

              {connectFrom && connectPointer ? (
                <svg
                  width={CANVAS_W}
                  height={CANVAS_H}
                  style={{ position: "absolute", top: 0, left: 0, zIndex: 11, overflow: "visible", pointerEvents: "none" }}
                >
                  {(() => {
                    const fromNode = graph.nodes.find((n) => n.id === connectFrom);
                    if (!fromNode) return null;
                    const start = portOut(fromNode);
                    return (
                      <path
                        d={`M ${start.x} ${start.y} L ${connectPointer.x} ${connectPointer.y}`}
                        fill="none"
                        stroke={d.accentBlue}
                        strokeWidth={2.5}
                        strokeDasharray="6 4"
                      />
                    );
                  })()}
                </svg>
              ) : null}

              {flowEditing && !connectFrom ? (
                <svg
                  width={CANVAS_W}
                  height={CANVAS_H}
                  style={{ position: "absolute", top: 0, left: 0, zIndex: 2, overflow: "visible", pointerEvents: "none" }}
                >
                  {graph.edges.map((edge) => {
                    const from = graph.nodes.find((n) => n.id === edge.from);
                    const to = graph.nodes.find((n) => n.id === edge.to);
                    if (!from || !to) return null;
                    const pathD = edgePath(from, to);
                    return (
                      <path
                        key={`hit-${edge.id}`}
                        d={pathD}
                        fill="none"
                        stroke="transparent"
                        strokeWidth={22}
                        style={{ cursor: "pointer", pointerEvents: "stroke" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEdgeId(edge.id);
                          onSelectNode(null);
                          setInspectorNodeId(null);
                          setConnectFrom(null);
                          setConnectPointer(null);
                        }}
                      />
                    );
                  })}
                </svg>
              ) : null}

              {flowEditing && selectedEdgeId
                ? (() => {
                    const edge = graph.edges.find((e) => e.id === selectedEdgeId);
                    if (!edge) return null;
                    const from = graph.nodes.find((n) => n.id === edge.from);
                    const to = graph.nodes.find((n) => n.id === edge.to);
                    if (!from || !to) return null;
                    const mid = edgeMidpoint(from, to);
                    return (
                      <IconButton
                        size="small"
                        aria-label="Remove wire"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteEdge(selectedEdgeId);
                        }}
                        sx={{
                          position: "absolute",
                          left: mid.x - 16,
                          top: mid.y - 16,
                          zIndex: 15,
                          width: 32,
                          height: 32,
                          bgcolor: theme.palette.error.main,
                          color: "#fff",
                          boxShadow: `0 4px 14px ${alpha(theme.palette.error.main, 0.45)}`,
                          "&:hover": { bgcolor: theme.palette.error.dark },
                        }}
                      >
                        <LinkOffRounded sx={{ fontSize: 16 }} />
                      </IconButton>
                    );
                  })()
                : null}
            </Box>

            <Box
              sx={{
                position: "absolute",
                bottom: 16,
                left: 16,
                display: "flex",
                gap: 0.75,
                alignItems: "center",
                zIndex: 15,
              }}
            >
              <Box
                sx={{
                  px: 1.25,
                  py: 0.45,
                  borderRadius: 1.5,
                  bgcolor: c.surface,
                  border: `1px solid ${c.border}`,
                  color: c.text,
                  fontSize: 11,
                  fontWeight: 600,
                  backdropFilter: "blur(8px)",
                  boxShadow: `0 4px 14px rgba(15,23,42,${isLight ? 0.08 : 0.25})`,
                }}
              >
                {Math.round(zoom * 100)}%
              </Box>
              <Tooltip title="Fit all blocks">
                <IconButton
                  size="small"
                  onClick={fitView}
                  sx={{
                    bgcolor: c.surface,
                    border: `1px solid ${c.border}`,
                    color: c.textSecondary,
                    boxShadow: `0 4px 14px rgba(15,23,42,${isLight ? 0.08 : 0.25})`,
                  }}
                >
                  <CenterFocusStrongRounded fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>

            {testChat}
          </Box>
          </Box>
          )}

          {flowEditing && flowSubTab === "diagram" && paletteOpen ? (
            <>
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 14,
                  bgcolor: alpha(theme.palette.common.black, isLight ? 0.12 : 0.35),
                }}
                onClick={() => setPaletteOpen(false)}
              />
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  bottom: 0,
                  zIndex: 15,
                  display: "flex",
                  flexDirection: "column",
                  animation: "flowBlocksSlideIn 0.18s ease-out",
                  "@keyframes flowBlocksSlideIn": {
                    from: { transform: "translateX(-100%)", opacity: 0.6 },
                    to: { transform: "translateX(0)", opacity: 1 },
                  },
                }}
              >
                <AiTrainingFlowPalette
                  onAddNode={(type) => addNode(type)}
                  onClose={() => setPaletteOpen(false)}
                />
              </Box>
            </>
          ) : null}
        </Box>
        )}
      </Box>

      <Drawer
        anchor="right"
        open={Boolean(inspectorNodeId)}
        onClose={() => {
          setInspectorNodeId(null);
          onSelectNode(null);
        }}
        PaperProps={{
          sx: [aiTrainingSettingsDrawerPaper, { width: { xs: "100%", sm: 340 } }] as SxProps<Theme>,
        }}
      >
        {inspectorNodeId ? (
          (() => {
            const node = graph.nodes.find((n) => n.id === inspectorNodeId);
            if (!node) return null;
            return (
              <Box sx={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
                <Box sx={aiTrainingSettingsDrawerHeader}>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: c.textSecondary,
                        display: "block",
                        fontSize: 10,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        mb: 0.25,
                      }}
                    >
                      Block details
                    </Typography>
                    <Typography variant="body1" fontWeight={700} sx={{ color: c.text }} noWrap>
                      {node.label}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    aria-label="Close block details"
                    onClick={() => {
                      setInspectorNodeId(null);
                      onSelectNode(null);
                    }}
                    sx={{ color: c.textSecondary, mt: 0.25 }}
                  >
                    <CloseRounded fontSize="small" />
                  </IconButton>
                </Box>
                <Box
                  sx={mergeSx(aiTrainingSettingsDrawerBody, {
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                    "&::-webkit-scrollbar": { display: "none" },
                  })}
                >
                  <AiTrainingFlowNodeInspector
                    key={node.id}
                    websiteId={websiteId}
                    node={node}
                    onUpdate={updateSelectedNode}
                    onOpenSettings={() => {
                      setInspectorNodeId(null);
                      onSelectNode(null);
                      setSettingsOpen(true);
                    }}
                  />
                </Box>
              </Box>
            );
          })()
        ) : null}
      </Drawer>

      <Drawer
        anchor="right"
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        PaperProps={{
          sx: aiTrainingSettingsDrawerPaper,
        }}
      >
        {isValidElement(settingsPanel)
          ? cloneElement(settingsPanel, {
              onClose: () => setSettingsOpen(false),
            } as { onClose: () => void })
          : settingsPanel}
      </Drawer>
    </Box>
  );
}
