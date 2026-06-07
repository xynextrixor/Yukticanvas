import { supabase, hasValidCredentials } from "./supabase";

export interface CursorPosition {
  x: number;
  y: number;
}

export interface CollaboratorState {
  id: string;
  email?: string;
  color: string;
  cursor: CursorPosition | null;
  selection: string[]; // shape IDs
}

export const createBoardChannel = (
  boardId: string,
  userId: string,
  userEmail: string,
  onPresenceChange: (users: CollaboratorState[]) => void,
  onCursorUpdate: (userId: string, pos: CursorPosition) => void,
  onBoardUpdate: (payload: any) => void
) => {
  if (!hasValidCredentials()) return null;

  const color = '#' + Math.floor(Math.random()*16777215).toString(16); // Random color

  const channel = supabase.channel(`board:${boardId}`, {
    config: {
      presence: {
        key: userId,
      },
      broadcast: {
        self: false,
      }
    },
  });

  // Handle Presence sync
  channel.on('presence', { event: 'sync' }, () => {
    const rawState = channel.presenceState();
    const activeUsers: CollaboratorState[] = [];
    
    for (const key in rawState) {
      if (rawState[key].length > 0) {
        const p = rawState[key][0] as any;
        activeUsers.push({
          id: key,
          email: p.email,
          color: p.color,
          cursor: p.cursor || null,
          selection: p.selection || []
        });
      }
    }
    onPresenceChange(activeUsers);
  });

  // Handle Broadcasts for Cursors
  channel.on('broadcast', { event: 'cursor-update' }, ({ payload }) => {
    onCursorUpdate(payload.userId, payload.position);
  });
  
  // Handle Broadcasts for Board state differences 
  // In a real sophisticated CRDT like Yjs, we'd sync document updates.
  // For this, we'll sync full shapes list or specific actions.
  channel.on('broadcast', { event: 'board-update' }, ({ payload }) => {
    onBoardUpdate(payload);
  });

  // Subscribe and track initial presence
  channel.subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await channel.track({
        email: userEmail,
        color: color,
        cursor: null,
        selection: []
      });
    }
  });

  return {
    channel,
    updateCursor: (position: CursorPosition) => {
      // Need to debounce this in the component
      channel.send({
        type: 'broadcast',
        event: 'cursor-update',
        payload: { userId, position }
      });
    },
    broadcastUpdate: (actionType: string, data: any) => {
      channel.send({
        type: 'broadcast',
        event: 'board-update',
        payload: { actionType, data }
      });
    },
    updateSelection: (selection: string[]) => {
      channel.track({
        email: userEmail,
        color,
        selection
      });
    }
  };
};
