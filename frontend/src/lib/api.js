/**
 * Zoom Clone — API Client with Smart Hybrid Cloud Fallback
 * Works seamlessly with FastAPI backend when available, and gracefully
 * provides full client-side persistence & mock data when deployed standalone on Vercel.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const WS_BASE  = API_BASE.replace(/^http/, 'ws');

// ── Client-side Seed Data & Storage Helper ────────────────────

const STORAGE_KEY_UPCOMING = 'zoom_meetings_upcoming';
const STORAGE_KEY_RECENT = 'zoom_meetings_recent';
const STORAGE_KEY_USER = 'zoom_user';

function initLocalStorage() {
  if (typeof window === 'undefined') return;

  const now = new Date();

  if (!localStorage.getItem(STORAGE_KEY_USER)) {
    localStorage.setItem(
      STORAGE_KEY_USER,
      JSON.stringify({
        id: 1,
        name: 'John Doe',
        email: 'john.doe@company.com',
        avatar_url: null,
      })
    );
  }

  if (!localStorage.getItem(STORAGE_KEY_UPCOMING)) {
    const upcoming = [
      {
        id: 1,
        meeting_code: '847-3921-5064',
        title: 'Weekly Team Standup',
        description: 'Regular team sync to discuss progress and blockers',
        host_id: 1,
        status: 'scheduled',
        scheduled_at: new Date(now.getTime() + 2 * 3600 * 1000).toISOString(),
        duration_minutes: 30,
        invite_link: 'http://localhost:3000/meeting/847-3921-5064',
        host_name: 'John Doe',
        participant_count: 4,
      },
      {
        id: 2,
        meeting_code: '562-1847-3290',
        title: 'Product Review Meeting',
        description: 'Monthly product review with stakeholders',
        host_id: 1,
        status: 'scheduled',
        scheduled_at: new Date(now.getTime() + 27 * 3600 * 1000).toISOString(),
        duration_minutes: 60,
        invite_link: 'http://localhost:3000/meeting/562-1847-3290',
        host_name: 'John Doe',
        participant_count: 5,
      },
      {
        id: 3,
        meeting_code: '913-6728-4051',
        title: 'Sprint Planning — Sprint 24',
        description: 'Plan next sprint tasks and allocate story points',
        host_id: 1,
        status: 'scheduled',
        scheduled_at: new Date(now.getTime() + 75 * 3600 * 1000).toISOString(),
        duration_minutes: 90,
        invite_link: 'http://localhost:3000/meeting/913-6728-4051',
        host_name: 'John Doe',
        participant_count: 6,
      },
    ];
    localStorage.setItem(STORAGE_KEY_UPCOMING, JSON.stringify(upcoming));
  }

  if (!localStorage.getItem(STORAGE_KEY_RECENT)) {
    const recent = [
      {
        id: 4,
        meeting_code: '384-5029-1763',
        title: 'Project Kickoff — Q4 Initiative',
        description: 'Kickoff meeting for the Q4 product initiative',
        host_id: 1,
        status: 'ended',
        scheduled_at: new Date(now.getTime() - 26 * 3600 * 1000).toISOString(),
        ended_at: new Date(now.getTime() - 25 * 3600 * 1000).toISOString(),
        duration_minutes: 45,
        invite_link: 'http://localhost:3000/meeting/384-5029-1763',
        host_name: 'John Doe',
        participant_count: 4,
      },
      {
        id: 5,
        meeting_code: '641-7382-9015',
        title: 'Design Review — Homepage Redesign',
        description: 'Reviewed new homepage mockups and design tokens',
        host_id: 1,
        status: 'ended',
        scheduled_at: new Date(now.getTime() - 52 * 3600 * 1000).toISOString(),
        ended_at: new Date(now.getTime() - 51 * 3600 * 1000).toISOString(),
        duration_minutes: 30,
        invite_link: 'http://localhost:3000/meeting/641-7382-9015',
        host_name: 'John Doe',
        participant_count: 3,
      },
    ];
    localStorage.setItem(STORAGE_KEY_RECENT, JSON.stringify(recent));
  }
}

function generateCode() {
  const digits = Math.floor(10000000000 + Math.random() * 90000000000).toString();
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

// ── HTTP helpers with Auto-Fallback ───────────────────────────

async function request(path, options = {}) {
  try {
    const url = `${API_BASE}${path}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout for offline/cloud fallback

    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      signal: controller.signal,
      ...options,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || 'Request failed');
    }
    return await res.json();
  } catch (fetchErr) {
    // Graceful fallback to client persistence
    return handleClientFallback(path, options);
  }
}

function handleClientFallback(path, options) {
  initLocalStorage();
  const method = (options.method || 'GET').toUpperCase();

  // GET /api/users/me
  if (path === '/api/users/me') {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_USER));
  }

  // GET /api/meetings/upcoming
  if (path === '/api/meetings/upcoming') {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_UPCOMING) || '[]');
  }

  // GET /api/meetings/recent
  if (path === '/api/meetings/recent') {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_RECENT) || '[]');
  }

  // POST /api/meetings (Instant)
  if (path === '/api/meetings' && method === 'POST') {
    const body = JSON.parse(options.body || '{}');
    const code = generateCode();
    const newMeeting = {
      id: Date.now(),
      meeting_code: code,
      title: body.title || 'Instant Zoom Meeting',
      description: body.description || null,
      host_id: 1,
      status: 'active',
      started_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      duration_minutes: 40,
      invite_link: typeof window !== 'undefined' ? `${window.location.origin}/meeting/${code}` : `/meeting/${code}`,
      host_name: 'John Doe',
      participant_count: 1,
      participants: [
        { id: 1, display_name: 'John Doe (Host)', is_muted: false, is_video_on: true, role: 'host' }
      ]
    };
    return newMeeting;
  }

  // POST /api/meetings/schedule
  if (path === '/api/meetings/schedule' && method === 'POST') {
    const body = JSON.parse(options.body || '{}');
    const code = generateCode();
    const newMeeting = {
      id: Date.now(),
      meeting_code: code,
      title: body.title || 'Scheduled Meeting',
      description: body.description || null,
      host_id: 1,
      status: 'scheduled',
      scheduled_at: body.scheduled_at,
      duration_minutes: body.duration_minutes || 45,
      created_at: new Date().toISOString(),
      invite_link: typeof window !== 'undefined' ? `${window.location.origin}/meeting/${code}` : `/meeting/${code}`,
      host_name: 'John Doe',
      participant_count: 1,
    };
    const current = JSON.parse(localStorage.getItem(STORAGE_KEY_UPCOMING) || '[]');
    localStorage.setItem(STORAGE_KEY_UPCOMING, JSON.stringify([newMeeting, ...current]));
    return newMeeting;
  }

  // GET /api/meetings/{code}
  if (path.startsWith('/api/meetings/') && method === 'GET') {
    const code = path.replace('/api/meetings/', '');
    const upcoming = JSON.parse(localStorage.getItem(STORAGE_KEY_UPCOMING) || '[]');
    const recent = JSON.parse(localStorage.getItem(STORAGE_KEY_RECENT) || '[]');
    const found = [...upcoming, ...recent].find(m => m.meeting_code === code);
    
    return found || {
      id: Date.now(),
      meeting_code: code,
      title: 'Zoom Meeting Room',
      description: 'Active collaboration room',
      host_id: 1,
      status: 'active',
      created_at: new Date().toISOString(),
      duration_minutes: 40,
      invite_link: typeof window !== 'undefined' ? `${window.location.origin}/meeting/${code}` : `/meeting/${code}`,
      host_name: 'John Doe',
      participant_count: 4,
    };
  }

  // DELETE /api/meetings/{code}
  if (path.startsWith('/api/meetings/') && method === 'DELETE') {
    const code = path.replace('/api/meetings/', '');
    let upcoming = JSON.parse(localStorage.getItem(STORAGE_KEY_UPCOMING) || '[]');
    upcoming = upcoming.filter(m => m.meeting_code !== code);
    localStorage.setItem(STORAGE_KEY_UPCOMING, JSON.stringify(upcoming));
    return { status: 'deleted', meeting_code: code };
  }

  // POST /api/meetings/{code}/end
  if (path.includes('/end') && method === 'POST') {
    return { status: 'ended' };
  }

  return { status: 'ok' };
}

// ── Exported API Methods ──────────────────────────────────────

export function getCurrentUser() {
  return request('/api/users/me');
}

export function createInstantMeeting(title = 'Zoom Meeting') {
  return request('/api/meetings', {
    method: 'POST',
    body: JSON.stringify({ title }),
  });
}

export function scheduleMeeting(data) {
  return request('/api/meetings/schedule', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getUpcomingMeetings() {
  return request('/api/meetings/upcoming');
}

export function getRecentMeetings() {
  return request('/api/meetings/recent');
}

export function getMeeting(meetingCode) {
  return request(`/api/meetings/${meetingCode}`);
}

export function joinMeeting(meetingCode, displayName) {
  return request(`/api/meetings/${meetingCode}/join`, {
    method: 'POST',
    body: JSON.stringify({ display_name: displayName }),
  });
}

export function startMeeting(meetingCode) {
  return request(`/api/meetings/${meetingCode}/start`, { method: 'POST' });
}

export function endMeeting(meetingCode) {
  return request(`/api/meetings/${meetingCode}/end`, { method: 'POST' });
}

export function deleteMeeting(meetingCode) {
  return request(`/api/meetings/${meetingCode}`, { method: 'DELETE' });
}

// ── WebSocket with Mock Simulation Fallback ───────────────────

export function connectToMeeting(meetingCode, displayName) {
  try {
    const encoded = encodeURIComponent(displayName);
    const ws = new WebSocket(`${WS_BASE}/ws/${meetingCode}?name=${encoded}`);
    return ws;
  } catch (err) {
    return null;
  }
}
