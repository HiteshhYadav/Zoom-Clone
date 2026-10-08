'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Video, ArrowLeft, LogIn, Mic, MicOff, VideoOff, Check } from 'lucide-react';
import { getMeeting } from '@/lib/api';

function JoinContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const codeParam = searchParams.get('code') || '';
  const [meetingCode, setMeetingCode] = useState(codeParam);
  const [displayName, setDisplayName] = useState('Guest User');
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (codeParam) {
      setMeetingCode(codeParam);
    }
  }, [codeParam]);

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!meetingCode.trim()) {
      setError('Please enter a valid Meeting ID');
      return;
    }
    if (!displayName.trim()) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Validate meeting exists in DB
      await getMeeting(meetingCode.trim());

      // Save preferences to local storage
      if (typeof window !== 'undefined') {
        localStorage.setItem(`zoom_name_${meetingCode.trim()}`, displayName.trim());
        localStorage.setItem(`zoom_video_${meetingCode.trim()}`, isVideoOn.toString());
        localStorage.setItem(`zoom_audio_${meetingCode.trim()}`, isAudioOn.toString());
      }

      router.push(`/meeting/${meetingCode.trim()}`);
    } catch (err) {
      setError(err.message || 'Meeting not found. Please verify the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Top Zoom Brand Header */}
      <header style={styles.header}>
        <Link href="/" style={styles.logoLink}>
          <div style={styles.logoBadge}>
            <Video size={22} color="#FFFFFF" strokeWidth={2.5} />
          </div>
          <span style={styles.brandTitle}>zoom</span>
        </Link>

        <Link href="/" style={styles.backBtn}>
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </Link>
      </header>

      {/* Main Join Card */}
      <main style={styles.main}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h1 style={styles.title}>Join a Meeting</h1>
            <p style={styles.subtitle}>
              Enter your meeting ID or personal link name to connect with the team.
            </p>
          </div>

          {error && (
            <div style={styles.errorBox}>
              {error}
            </div>
          )}

          <form onSubmit={handleJoin}>
            <div className="form-group">
              <label className="form-label">Meeting ID or Personal Link</label>
              <input
                type="text"
                className="form-input"
                style={styles.inputBig}
                value={meetingCode}
                onChange={(e) => setMeetingCode(e.target.value)}
                placeholder="e.g. 847-3921-5064"
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Your Display Name</label>
              <input
                type="text"
                className="form-input"
                style={styles.inputBig}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="How you will appear to others"
                required
              />
            </div>

            {/* Quick Preview Toggle Controls */}
            <div style={styles.devicePrefBox}>
              <span style={styles.prefTitle}>Pre-joining Preferences</span>

              <div style={styles.prefGrid}>
                <button
                  type="button"
                  onClick={() => setIsAudioOn(!isAudioOn)}
                  style={{
                    ...styles.prefBtn,
                    backgroundColor: isAudioOn ? '#F0F9F2' : '#FDEDED',
                    color: isAudioOn ? '#2D8C3E' : '#D32F2F',
                    borderColor: isAudioOn ? '#C8E6C9' : '#FFCDD2',
                  }}
                >
                  {isAudioOn ? <Mic size={16} /> : <MicOff size={16} />}
                  <span>{isAudioOn ? 'Mic Connected' : 'Muted'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsVideoOn(!isVideoOn)}
                  style={{
                    ...styles.prefBtn,
                    backgroundColor: isVideoOn ? '#F0F5FF' : '#F4F5F7',
                    color: isVideoOn ? '#0B5CFF' : '#747487',
                    borderColor: isVideoOn ? '#D0E1FD' : '#E5E7EB',
                  }}
                >
                  {isVideoOn ? <Video size={16} /> : <VideoOff size={16} />}
                  <span>{isVideoOn ? 'Camera On' : 'Camera Off'}</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={styles.submitBtn}
            >
              <LogIn size={18} />
              <span>{loading ? 'Validating Meeting...' : 'Join Meeting'}</span>
            </button>
          </form>

          <div style={styles.footerNote}>
            By clicking "Join", you agree to the Terms of Service and Privacy Statement.
          </div>
        </div>
      </main>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <JoinContent />
    </Suspense>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#F7F8FA',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    height: '64px',
    backgroundColor: '#FFFFFF',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 32px',
  },
  logoLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  logoBadge: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    backgroundColor: '#0B5CFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#0B5CFF',
    letterSpacing: '-0.5px',
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: 'var(--text-secondary)',
    fontWeight: '500',
  },
  main: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid var(--border)',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.06)',
    width: '100%',
    maxWidth: '460px',
    padding: '36px 32px',
  },
  cardHeader: {
    textAlign: 'center',
    marginBottom: '24px',
  },
  title: {
    fontSize: '22px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
  },
  errorBox: {
    backgroundColor: '#FDEDED',
    color: '#D32F2F',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    marginBottom: '18px',
    border: '1px solid #FFCDD2',
    textAlign: 'center',
  },
  inputBig: {
    padding: '12px 14px',
    fontSize: '15px',
  },
  devicePrefBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: '10px',
    padding: '14px',
    marginBottom: '22px',
    border: '1px solid #EEF0F2',
  },
  prefTitle: {
    display: 'block',
    fontSize: '11px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
    marginBottom: '10px',
  },
  prefGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
  },
  prefBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '9px 12px',
    borderRadius: '8px',
    border: '1px solid',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  submitBtn: {
    width: '100%',
    padding: '12px',
    fontSize: '15px',
    fontWeight: '600',
    borderRadius: '8px',
  },
  footerNote: {
    marginTop: '20px',
    fontSize: '11px',
    color: 'var(--text-tertiary)',
    textAlign: 'center',
    lineHeight: '1.4',
  },
};
