'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Lock, Video, Globe, Check } from 'lucide-react';
import { scheduleMeeting } from '@/lib/api';

export default function ScheduleModal({ isOpen, onClose, onScheduled }) {
  const [title, setTitle] = useState('My Scheduled Meeting');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00');
  const [duration, setDuration] = useState(45);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    setDate(d.toISOString().split('T')[0]);
  }, []);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a meeting title');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Combine date and time to ISO string
      const scheduledIso = new Date(`${date}T${time}:00`).toISOString();
      const newMeeting = await scheduleMeeting({
        title: title.trim(),
        description: description.trim() || null,
        scheduled_at: scheduledIso,
        duration_minutes: parseInt(duration, 10),
      });

      if (onScheduled) {
        onScheduled(newMeeting);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to schedule meeting');
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
              <Calendar size={18} color="#0B5CFF" />
            </div>
            <h2>Schedule a Meeting</h2>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div style={styles.errorAlert}>
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Topic</label>
              <input
                type="text"
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Weekly Product Sync"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description (Optional)</label>
              <textarea
                className="form-input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add meeting agenda, notes, or details..."
                rows={2}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Date</label>
                <div style={styles.inputWithIcon}>
                  <Calendar size={15} style={styles.fieldIcon} />
                  <input
                    type="date"
                    className="form-input"
                    style={{ paddingLeft: '34px' }}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Start Time</label>
                <div style={styles.inputWithIcon}>
                  <Clock size={15} style={styles.fieldIcon} />
                  <input
                    type="time"
                    className="form-input"
                    style={{ paddingLeft: '34px' }}
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Duration</label>
                <select
                  className="form-input"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Time Zone</label>
                <div style={styles.tzDisplay}>
                  <Globe size={14} color="var(--text-secondary)" />
                  <span>{Intl.DateTimeFormat().resolvedOptions().timeZone}</span>
                </div>
              </div>
            </div>

            {/* Zoom Meeting Settings Box */}
            <div style={styles.securityBox}>
              <div style={styles.securityTitle}>
                <Lock size={14} color="#0B5CFF" />
                <span>Security & Access</span>
              </div>
              <div style={styles.securityItem}>
                <span style={styles.checkIcon}><Check size={12} /></span>
                <span>Auto-generated encrypted Meeting ID</span>
              </div>
              <div style={styles.securityItem}>
                <span style={styles.checkIcon}><Check size={12} /></span>
                <span>Waiting Room enabled</span>
              </div>
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
              {loading ? 'Scheduling...' : 'Save & Schedule'}
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
  inputWithIcon: {
    position: 'relative',
  },
  fieldIcon: {
    position: 'absolute',
    left: '11px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--text-tertiary)',
    pointerEvents: 'none',
  },
  tzDisplay: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 14px',
    backgroundColor: '#F7F8FA',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    fontSize: '13px',
    color: 'var(--text-secondary)',
  },
  securityBox: {
    backgroundColor: '#F8FAFD',
    border: '1px solid #E1E9F8',
    borderRadius: '8px',
    padding: '12px 14px',
    marginTop: '6px',
  },
  securityTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#0B5CFF',
    marginBottom: '8px',
  },
  securityItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: 'var(--text-secondary)',
    marginBottom: '4px',
  },
  checkIcon: {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    backgroundColor: '#E8F0FE',
    color: '#0B5CFF',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};
