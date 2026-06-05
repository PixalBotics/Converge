import { describe, expect, it, vi, beforeEach } from "vitest";

const managerSocket = vi.fn();
const managerDisconnect = vi.fn();
const managerRemoveAllListeners = vi.fn();

function makeFakeSocket() {
  return {
    connected: false,
    auth: {} as { token?: string },
    connect: vi.fn(function (this: { connected: boolean }) {
      this.connected = true;
    }),
    disconnect: vi.fn(function (this: { connected: boolean }) {
      this.connected = false;
    }),
    removeAllListeners: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  };
}

vi.mock("socket.io-client", () => ({
  Manager: class FakeManager {
    socket = managerSocket;
    removeAllListeners = managerRemoveAllListeners;
    disconnect = managerDisconnect;
  },
}));

import {
  acquireNamespaceSocket,
  resetSharedSocketManagersForTests,
} from "./sharedSocketManager";

describe("sharedSocketManager", () => {
  beforeEach(() => {
    resetSharedSocketManagersForTests();
    managerSocket.mockReset();
    managerDisconnect.mockReset();
    managerRemoveAllListeners.mockReset();
  });

  it("multiplexes namespaces on one Manager for the same token", () => {
    const chatSock = makeFakeSocket();
    const notifSock = makeFakeSocket();
    managerSocket.mockReturnValueOnce(chatSock).mockReturnValueOnce(notifSock);

    acquireNamespaceSocket({
      baseUrl: "http://localhost:3001",
      namespace: "/chat",
      authToken: "agent-token",
    });
    acquireNamespaceSocket({
      baseUrl: "http://localhost:3001",
      namespace: "/notifications",
      authToken: "agent-token",
    });

    expect(managerSocket).toHaveBeenCalledTimes(2);
    expect(managerSocket.mock.calls[0][0]).toBe("/chat");
    expect(managerSocket.mock.calls[1][0]).toBe("/notifications");
    expect(managerDisconnect).not.toHaveBeenCalled();
  });
});
