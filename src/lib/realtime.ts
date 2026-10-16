import { io, type Socket } from "socket.io-client";

/** Server → client events, mirroring the backend's realtime.events.ts ("<module>:<action>"). Chat adds its own here. */
export const REALTIME_EVENTS = {
  notificationNew: "notification:new",
  notificationUnreadCount: "notification:unread-count",
  messageNew: "message:new",
  messageDeleted: "message:deleted",
  conversationRead: "conversation:read",
  conversationTyping: "conversation:typing",
  chatUnreadCount: "chat:unread-count",
  presenceUpdate: "presence:update",
} as const;

/** Client → server events. */
export const REALTIME_CLIENT_EVENTS = {
  conversationTyping: "conversation:typing",
} as const;

export type RealtimeEvent = (typeof REALTIME_EVENTS)[keyof typeof REALTIME_EVENTS];
export type RealtimeClientEvent = (typeof REALTIME_CLIENT_EVENTS)[keyof typeof REALTIME_CLIENT_EVENTS];

/** Lifecycle events every feature may want (e.g. refetch what was missed while offline). */
type LifecycleEvent = "connect" | "connect_error";

let socket: Socket | null = null;
let socketToken: string | null = null;

/**
 * One socket for the whole app, authenticated with the session's token. Calling it again with
 * the same token is a no-op; a different token (another account) reconnects.
 */
export function connectRealtime(token: string) {
  if (socket && socketToken === token) return;
  disconnectRealtime();
  socketToken = token;
  // The socket lives at the API's origin (/socket.io), not under /api.
  socket = io(process.env.NEXT_PUBLIC_API_URL ?? "", { auth: { token }, transports: ["websocket", "polling"] });
}

export function disconnectRealtime() {
  socket?.disconnect();
  socket = null;
  socketToken = null;
}

/** Subscribes to a server event on the current socket; returns the unsubscribe. No-op when disconnected. */
export function onRealtime(event: RealtimeEvent | LifecycleEvent, handler: (payload: unknown) => void) {
  const current = socket;
  if (!current) return () => undefined;
  current.on(event, handler);
  return () => void current.off(event, handler);
}

/** Sends an event to the server; dropped while disconnected (e.g. "typing", which is only useful live). */
export function emitRealtime(event: RealtimeClientEvent, payload: unknown) {
  if (socket?.connected) socket.emit(event, payload);
}
