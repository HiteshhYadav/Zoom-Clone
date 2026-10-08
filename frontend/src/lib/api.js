/**
 * Zoom Clone — API Client
 * Centralized HTTP + WebSocket helpers for the FastAPI backend.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const WS_BASE  = API_BASE.replace(/^http/, 'ws');

// ── HTTP helpers ──────────────────────────────────────────────

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Request failed');
  }

  return res.json();
}

// ── User ──────────────────────────────────────────────────────

export function getCurrentUser() {
  return request('/api/users/me');
}

// ── Meetings ──────────────────────────────────────────────────

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

// ── WebSocket ─────────────────────────────────────────────────

export function connectToMeeting(meetingCode, displayName) {
  const encoded = encodeURIComponent(displayName);
  return new WebSocket(`${WS_BASE}/ws/${meetingCode}?name=${encoded}`);
}
