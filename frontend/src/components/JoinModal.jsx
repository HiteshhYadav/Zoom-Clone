'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, LogIn, Video, Mic, Check } from 'lucide-react';
import { getMeeting, joinMeeting } from '@/lib/api';

export default function JoinModal({ isOpen, onClose, defaultName = 'John Doe' }) {
  const router = useRouter();
  const [meetingInput, setMeetingInput] = useState('');
  const [displayName, setDisplayName] = useState(defaultName);
  const [dontConnectAudio, setDontConnectAudio] = useState(false);
  const [turnOffVideo, setTurnOffVideo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const extractMeetingCode = (input) => {
    let trimmed = input.trim();
    if (trimmed.includes('/meeting/')) {
      const parts = trimmed.split('/meeting/');
      trimmed = parts[1].split('?')[0].split('/')[0].trim();
    }
    // If entered without dashes like 84739215064 or with spaces
    const digitsOnly = trimmed.replace(/\D/g, '');
    if (digitsOnly.length === 11) {
      return `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3, 7)}-${digitsOnly.slice(7)}`;
    }
    return trimmed;
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    const code = extractMeetingCode(meetingInput);

    if (!code) {
      setError('Please enter a Meeting ID or Personal Link Name');
      return;
    }
    if (!displayName.trim()) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Validate meeting exists in backend
      await getMeeting(code);
      
      // Store user meeting preferences in localStorage for the meeting page to pick up
      if (typeof window !== 'undefined') {
        localStorage.setItem(`zoom_name_${code}`, displayName.trim());
        localStorage.setItem(`zoom_video_${code}`, (!turnOffVideo).toString());
        localStorage.setItem(`zoom_audio_${code}`, (!dontConnectAudio).toString());
      }

      onClose();
      router.push(`/meeting/${code}`);
    } catch (err) {
      setError(err.message || 'Invalid Meeting ID. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={styles.headerIconBadge}>
              <LogIn size={18} color="#0B5CFF" />
            </div>
            <h2>Join a Meeting</h2>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleJoin}>
          <div className="modal-body">
            {error && (
              <div style={styles.errorAlert}>
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Meeting ID or Personal Link</label>
              <input
                type="text"
                className="form-input"
                value={meetingInput}
                onChange={(e) => setMeetingInput(e.target.value)}
                placeholder="e.g. 847-3921-5064 or Paste Invite Link"
                autoFocus
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Your Name</label>
              <input
                type="text"
                className="form-input"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your display name"
                required
              />
            </div>

            {/* Joining Options */}
            <div style={styles.optionsSection}>
              <label className="form-label" style={{ marginBottom: '10px' }}>
                Join Options
              </label>

              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={dontConnectAudio}
                  onChange={(e) => setDontConnectAudio(e.target.checked)}
                  style={styles.checkbox}
                />
                <span>Do not connect to audio</span>
              </label>

              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={turnOffVideo}
                  onChange={(e) => setTurnOffVideo(e.target.checked)}
                  style={styles.checkbox}
                />
                <span>Turn off my video</span>
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Joining...' : 'Join'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  headerIconBadge: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    backgroundColor: '#E8F0FE',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorAlert: {
    backgroundColor: '#FDEDED',
    color: '#D32F2F',
    padding: '10px 14px',
    borderRadius: '6px',
    fontSize: '13px',
    marginBottom: '16px',
    border: '1px solid #FFCDD2',
  },
  optionsSection: {
    marginTop: '20px',
    paddingTop: '16px',
    borderTop: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '13px',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    userSelect: 'none',
  },
  checkbox: {
    width: '16px',
    height: '16px',
    accentColor: '#0B5CFF',
    cursor: 'pointer',
  },
};
