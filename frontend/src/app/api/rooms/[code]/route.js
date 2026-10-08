import { NextResponse } from 'next/server';

// In-memory global store for Vercel serverless instances
const globalRooms = globalThis._zoomRooms || (globalThis._zoomRooms = {});

export async function GET(request, { params }) {
  const { code } = params;
  
  if (!globalRooms[code]) {
    globalRooms[code] = {
      code,
      title: 'Zoom Meeting',
      createdAt: Date.now(),
      participants: [],
      messages: [
        { id: 1, sender: 'Zoom Bot', text: `Welcome to meeting room ${code}! Cloud encryption active.`, time: 'Just now', isSystem: true }
      ],
      reactions: [],
    };
  }

  // Clean up stale participants inactive for > 45 seconds
  const now = Date.now();
  globalRooms[code].participants = (globalRooms[code].participants || []).filter(
    p => (now - (p.lastHeartbeat || now)) < 45000
  );

  return NextResponse.json(globalRooms[code]);
}

export async function POST(request, { params }) {
  const { code } = params;
  const body = await request.json().catch(() => ({}));
  const { action, participant, message, emoji, senderName } = body;

  if (!globalRooms[code]) {
    globalRooms[code] = {
      code,
      title: 'Zoom Meeting',
      createdAt: Date.now(),
      participants: [],
      messages: [
        { id: 1, sender: 'Zoom Bot', text: `Welcome to meeting room ${code}! Cloud encryption active.`, time: 'Just now', isSystem: true }
      ],
      reactions: [],
    };
  }

  const room = globalRooms[code];
  const now = Date.now();

  // 1. Join / Heartbeat
  if (action === 'join' || action === 'heartbeat') {
    if (participant && participant.name) {
      const idx = room.participants.findIndex(p => p.id === participant.id || p.name === participant.name);
      const updatedP = { ...participant, lastHeartbeat: now };
      if (idx >= 0) {
        room.participants[idx] = updatedP;
      } else {
        room.participants.push(updatedP);
      }
    }
  }

  // 2. Leave
  if (action === 'leave') {
    if (participant && participant.name) {
      room.participants = room.participants.filter(p => p.name !== participant.name && p.id !== participant.id);
    }
  }

  // 3. Send Chat
  if (action === 'chat' && message) {
    room.messages.push({
      id: Date.now() + Math.random(),
      sender: senderName || 'User',
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  }

  // 4. Send Reaction
  if (action === 'reaction' && emoji) {
    room.reactions.push({
      id: Date.now() + Math.random(),
      senderName: senderName || 'User',
      emoji,
      timestamp: now
    });
    // Keep only last 10 reactions
    room.reactions = room.reactions.slice(-10);
  }

  // 5. Mute All
  if (action === 'mute_all') {
    room.participants = room.participants.map(p => ({ ...p, isMuted: true }));
  }

  return NextResponse.json(room);
}
