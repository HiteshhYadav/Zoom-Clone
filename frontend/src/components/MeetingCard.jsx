'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Calendar, 
  Clock, 
  Copy, 
  Check, 
  Play, 
  Trash2, 
  MoreHorizontal, 
  Video, 
  Users 
} from 'lucide-react';
import { deleteMeeting } from '@/lib/api';

export default function MeetingCard({ meeting, type = 'upcoming', onDeleted, onStart }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const formatMeetingDate = (dateStr) => {
    if (!dateStr) return 'Not scheduled';
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (isToday) return `Today at ${timeStr}`;
    if (isTomorrow) return `Tomorrow at ${timeStr}`;

    return `${date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    })} at ${timeStr}`;
  };

  const handleCopyLink = (e) => {
    e.stopPropagation();
    const inviteText = `Join Zoom Meeting:\n${meeting.title}\nMeeting ID: ${meeting.meeting_code}\nLink: ${meeting.invite_link}`;
    navigator.clipboard.writeText(inviteText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete "${meeting.title}"?`)) {
      setDeleting(true);
      try {
        await deleteMeeting(meeting.meeting_code);
        if (onDeleted) onDeleted(meeting.meeting_code);
      } catch (err) {
        alert('Failed to delete meeting: ' + err.message);
      } finally {
        setDeleting(false);
      }
    }
  };

  const handleStart = (e) => {
    e.stopPropagation();
    if (onStart) {
      onStart(meeting.meeting_code);
    } else {
      router.push(`/meeting/${meeting.meeting_code}`);
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.leftBar} />

      <div style={styles.cardContent}>
        {/* Top meta & title */}
        <div style={styles.headerRow}>
          <div>
            <div style={styles.dateLabel}>
              <Clock size={13} style={{ display: 'inline', marginRight: '5px' }} />
              {type === 'upcoming' 
                ? formatMeetingDate(meeting.scheduled_at) 
                : `Ended ${formatMeetingDate(meeting.ended_at || meeting.scheduled_at)}`
              }
            </div>
            <h3 style={styles.title}>{meeting.title}</h3>
          </div>

          <div style={styles.badgeGroup}>
            <span style={{
              ...styles.statusBadge,
              backgroundColor: type === 'upcoming' ? '#E8F0FE' : '#F1F3F5',
              color: type === 'upcoming' ? '#0B5CFF' : '#6C757D',
            }}>
              {type === 'upcoming' ? 'Scheduled' : 'Ended'}
            </span>
          </div>
        </div>

        {meeting.description && (
          <p style={styles.description}>{meeting.description}</p>
        )}

        {/* Meeting ID & Details */}
        <div style={styles.detailsRow}>
          <div style={styles.detailItem}>
            <span style={styles.detailLabel}>Meeting ID:</span>
            <span style={styles.meetingIdCode}>{meeting.meeting_code}</span>
          </div>
          <div style={styles.detailItem}>
            <span style={styles.detailLabel}>Duration:</span>
            <span>{meeting.duration_minutes || 40} mins</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={styles.actionsRow}>
          {type === 'upcoming' ? (
            <button 
              onClick={handleStart} 
              style={styles.startBtn}
            >
              <Play size={14} fill="#FFFFFF" />
              <span>Start</span>
            </button>
          ) : (
            <button 
              onClick={handleStart} 
              style={styles.reopenBtn}
            >
              <Video size={14} />
              <span>Reopen Room</span>
            </button>
          )}

          <button 
            onClick={handleCopyLink} 
            style={styles.copyBtn}
            title="Copy meeting invitation link"
          >
            {copied ? <Check size={14} color="#2D8C3E" /> : <Copy size={14} />}
            <span>{copied ? 'Copied Link!' : 'Copy Invite'}</span>
          </button>

          {type === 'upcoming' && (
            <button 
              onClick={handleDelete} 
              style={styles.deleteBtn}
              title="Delete meeting"
              disabled={deleting}
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    position: 'relative',
    display: 'flex',
    backgroundColor: '#FFFFFF',
    border: '1px solid var(--border, #E5E5EA)',
    borderRadius: '12px',
    overflow: 'hidden',
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
    marginBottom: '14px',
  },
  leftBar: {
    width: '5px',
    backgroundColor: '#0B5CFF',
    flexShrink: 0,
  },
  cardContent: {
    flex: 1,
    padding: '16px 20px',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '8px',
  },
  dateLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#0B5CFF',
    marginBottom: '4px',
    display: 'flex',
    alignItems: 'center',
  },
  title: {
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--text-primary, #232333)',
  },
  badgeGroup: {
    display: 'flex',
    gap: '6px',
  },
  statusBadge: {
    fontSize: '11px',
    fontWeight: '600',
    padding: '3px 8px',
    borderRadius: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
  },
  description: {
    fontSize: '13px',
    color: 'var(--text-secondary, #747487)',
    marginBottom: '12px',
    lineHeight: '1.4',
  },
  detailsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    fontSize: '12px',
    color: 'var(--text-secondary, #747487)',
    paddingBottom: '14px',
    marginBottom: '14px',
    borderBottom: '1px solid #F0F0F3',
  },
  detailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  detailLabel: {
    color: 'var(--text-tertiary, #A0A0B8)',
  },
  meetingIdCode: {
    fontWeight: '600',
    color: 'var(--text-primary)',
    fontFamily: 'monospace',
    letterSpacing: '0.5px',
  },
  actionsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  startBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 16px',
    backgroundColor: '#0B5CFF',
    color: '#FFFFFF',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  },
  reopenBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 14px',
    backgroundColor: '#F3F4F6',
    color: 'var(--text-primary)',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
    border: '1px solid #E5E7EB',
    cursor: 'pointer',
  },
  copyBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 12px',
    backgroundColor: '#F8F9FA',
    color: 'var(--text-secondary)',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
    border: '1px solid #E9ECEF',
    cursor: 'pointer',
  },
  deleteBtn: {
    marginLeft: 'auto',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: 'transparent',
    color: 'var(--text-tertiary)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
};
