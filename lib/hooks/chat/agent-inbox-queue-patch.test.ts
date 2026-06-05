import { describe, expect, it } from "vitest";
import {
  applyInboxQueuePatch,
  buildInboxPatchFromSocket,
} from "./agent-inbox-queue-patch";

describe("agent-inbox-queue-patch", () => {
  it("moves assigned chat into active for the assigned agent", () => {
    const patch = buildInboxPatchFromSocket(
      "agent_assignment_popup",
      {
        conversationId: "c1",
        agentId: "agent-a",
        inboxTitle: "Visitor",
      },
      "agent-a",
    );
    expect(patch?.kind).toBe("assigned_to_agent");
    const next = applyInboxQueuePatch(
      { activeChats: [], waitingChats: [{ id: "c1", status: "waiting" }], closedChats: [] },
      patch!,
      "agent-a",
    );
    expect(next.activeChats).toHaveLength(1);
    expect(next.waitingChats).toHaveLength(0);
  });

  it("removes closed conversation from active and waiting", () => {
    const next = applyInboxQueuePatch(
      {
        activeChats: [{ id: "c2", status: "assigned" }],
        waitingChats: [],
        closedChats: [],
      },
      { kind: "conversation_closed", conversationId: "c2" },
      "agent-a",
    );
    expect(next.activeChats).toHaveLength(0);
    expect(next.needsClosedRefresh).toBe(true);
  });
});
