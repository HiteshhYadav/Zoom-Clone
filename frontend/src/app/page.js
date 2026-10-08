'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import ScheduleModal from '@/components/ScheduleModal';
import JoinModal from '@/components/JoinModal';
import MeetingCard from '@/components/MeetingCard';
import { 
  Video, 
  Plus, 
  Calendar, 
  Share2, 
  Clock, 
  ChevronRight, 
  Copy, 
  Check, 
  CalendarCheck2, 
  History,
  Sparkles,
  Link2,
  Tv
} from 'lucide-react';
import { 
  createInstantMeeting, 
  getUpcomingMeetings, 
  getRecentMeetings, 
  getCurrentUser 
} from '@/lib/api';

export default function Dashboard() {
  const router = useRouter();

  // State
  const [user, setUser] = useState(null);
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [recentMeetings, setRecentMeetings] = useState([]);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'recent'
  const [loading, setLoading] = useState(true);
  const [creatingInstant, setCreatingInstant] = useState(false);

  // Modals
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [copiedPMI, setCopiedPMI] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Clock
  const [currentTime, setCurrentTime] = useState(null);

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch initial data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [userData, upcomingData, recentData] = await Promise.all([
          getCurrentUser().catch(() => ({ id: 1, name: 'John Doe', email: 'john.doe@company.com' })),
          getUpcomingMeetings().catch(() => []),
          getRecentMeetings().catch(() => []),
        ]);
        setUser(userData);
        setUpcomingMeetings(upcomingData);
        setRecentMeetings(recentData);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Instant meeting handler
  const handleNewMeeting = async () => {
    try {
      setCreatingInstant(true);
      const meeting = await createInstantMeeting('Instant Zoom Meeting');
      showToast('Meeting created! Launching room...');
      router.push(`/meeting/${meeting.meeting_code}`);
    } catch (err) {
      alert('Failed to start instant meeting: ' + err.message);
      setCreatingInstant(false);
    }
  };

  // Share screen quick launcher
  const handleShareScreen = async () => {
    try {
      setCreatingInstant(true);
      const meeting = await createInstantMeeting('Screen Share Session');
      // Save flag to auto-trigger screen share mode
      if (typeof window !== 'undefined') {
        localStorage.setItem(`zoom_screenshare_${meeting.meeting_code}`, 'true');
      }
      router.push(`/meeting/${meeting.meeting_code}`);
    } catch (err) {
      alert('Failed to start meeting: ' + err.message);
      setCreatingInstant(false);
    }
  };

  const handleMeetingDeleted = (code) => {
    setUpcomingMeetings(prev => prev.filter(m => m.meeting_code !== code));
    showToast('Meeting deleted');
  };

  const handleMeetingScheduled = (newMeeting) => {
    setUpcomingMeetings(prev => [newMeeting, ...prev]);
    showToast('Meeting scheduled successfully!');
  };

  const copyPMILink = () => {
    const pmiCode = '847-3921-5064';
    const link = `http://localhost:3000/meeting/${pmiCode}`;
    navigator.clipboard.writeText(`Personal Meeting Room:\n${link}`);
    setCopiedPMI(true);
    showToast('Personal Meeting link copied!');
    setTimeout(() => setCopiedPMI(false), 2000);
  };

  const formattedTime = currentTime
    ? currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
    : '--:--';
  
  const formattedDate = currentTime
    ? currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : 'Loading date...';

  return (
    <div className="app-layout">
      {/* Zoom Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="main-content">
        <Navbar user={user} />

        {toastMessage && (
          <div className="toast toast-success">
            <Check size={16} />
            <span>{toastMessage}</span>
          </div>
        )}

        <div style={styles.dashboardContainer}>
          {/* Top Banner & Quick Actions Section */}
          <div style={styles.topSection}>
            {/* Left 4 Iconic Zoom Action Buttons */}
            <div style={styles.actionsGrid}>
              {/* 1. New Meeting (Orange) */}
              <button 
                onClick={handleNewMeeting} 
                disabled={creatingInstant}
                style={styles.actionCard}
                className="action-card-hover"
              >
                <div style={{ ...styles.actionIconBadge, backgroundColor: 'var(--orange, #F26D21)' }}>
                  <Video size={30} color="#FFFFFF" strokeWidth={2.2} />
                </div>
                <span style={styles.actionTitle}>New Meeting</span>
                <span style={styles.actionSubtitle}>
                  {creatingInstant ? 'Starting...' : 'Instant video room'}
                </span>
              </button>

              {/* 2. Join (Blue) */}
              <button 
                onClick={() => setIsJoinOpen(true)}
                style={styles.actionCard}
                className="action-card-hover"
              >
                <div style={{ ...styles.actionIconBadge, backgroundColor: 'var(--zoom-blue, #0B5CFF)' }}>
                  <Plus size={30} color="#FFFFFF" strokeWidth={2.5} />
                </div>
                <span style={styles.actionTitle}>Join</span>
                <span style={styles.actionSubtitle}>via ID or link</span>
              </button>

              {/* 3. Schedule (Blue) */}
              <button 
                onClick={() => setIsScheduleOpen(true)}
                style={styles.actionCard}
                className="action-card-hover"
              >
                <div style={{ ...styles.actionIconBadge, backgroundColor: 'var(--zoom-blue, #0B5CFF)' }}>
                  <Calendar size={28} color="#FFFFFF" strokeWidth={2.2} />
                </div>
                <span style={styles.actionTitle}>Schedule</span>
                <span style={styles.actionSubtitle}>Plan upcoming call</span>
              </button>

              {/* 4. Share Screen (Blue) */}
              <button 
                onClick={handleShareScreen}
                disabled={creatingInstant}
                style={styles.actionCard}
                className="action-card-hover"
              >
                <div style={{ ...styles.actionIconBadge, backgroundColor: 'var(--zoom-blue, #0B5CFF)' }}>
                  <Share2 size={26} color="#FFFFFF" strokeWidth={2.2} />
                </div>
                <span style={styles.actionTitle}>Share Screen</span>
                <span style={styles.actionSubtitle}>Instant presentation</span>
              </button>
            </div>

            {/* Right Widget: Live Clock & Personal Meeting ID */}
            <div style={styles.clockCard}>
              <div style={styles.clockHeader}>
                <div style={styles.clockTime}>{formattedTime}</div>
                <div style={styles.clockDate}>{formattedDate}</div>
              </div>

              <div style={styles.pmiBox}>
                <div style={styles.pmiInfo}>
                  <span style={styles.pmiLabel}>Personal Meeting ID (PMI)</span>
                  <span style={styles.pmiValue}>847-3921-5064</span>
                </div>
                <div style={styles.pmiActions}>
                  <button 
                    onClick={copyPMILink}
                    style={styles.pmiBtn}
                    title="Copy Personal Meeting Link"
                  >
                    {copiedPMI ? <Check size={14} color="#2D8C3E" /> : <Copy size={14} />}
                    <span>{copiedPMI ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button 
                    onClick={() => router.push('/meeting/847-3921-5064')}
                    style={styles.pmiStartBtn}
                  >
                    Start PMI
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Meetings Section */}
          <div style={styles.meetingsSection}>
            <div style={styles.sectionHeader}>
              <div style={styles.tabsList}>
                <button
                  onClick={() => setActiveTab('upcoming')}
                  style={{
                    ...styles.tabButton,
                    ...(activeTab === 'upcoming' ? styles.tabButtonActive : {})
                  }}
                >
                  <CalendarCheck2 size={16} />
                  <span>Upcoming Meetings</span>
                  <span style={styles.tabBadge}>{upcomingMeetings.length}</span>
                </button>

                <button
                  onClick={() => setActiveTab('recent')}
                  style={{
                    ...styles.tabButton,
                    ...(activeTab === 'recent' ? styles.tabButtonActive : {})
                  }}
                >
                  <History size={16} />
                  <span>Recent & Ended</span>
                  <span style={styles.tabBadge}>{recentMeetings.length}</span>
                </button>
              </div>

              <button
                onClick={() => setIsScheduleOpen(true)}
                style={styles.scheduleNewBtn}
              >
                <Plus size={15} />
                <span>Schedule Meeting</span>
              </button>
            </div>

            {/* Meetings Content List */}
            <div style={styles.listContainer}>
              {loading ? (
                <div style={styles.emptyState}>
                  <Clock size={32} color="var(--zoom-blue)" style={{ animation: 'spin 2s linear infinite' }} />
                  <p style={{ marginTop: '12px', color: 'var(--text-secondary)' }}>Loading meetings...</p>
                </div>
              ) : activeTab === 'upcoming' ? (
                upcomingMeetings.length > 0 ? (
                  upcomingMeetings.map((m) => (
                    <MeetingCard
                      key={m.id || m.meeting_code}
                      meeting={m}
                      type="upcoming"
                      onDeleted={handleMeetingDeleted}
                      onStart={(code) => router.push(`/meeting/${code}`)}
                    />
                  ))
                ) : (
                  <div style={styles.emptyState}>
                    <div style={styles.emptyIconCircle}>
                      <Calendar size={32} color="var(--zoom-blue)" />
                    </div>
                    <h4 style={styles.emptyTitle}>No Upcoming Meetings</h4>
                    <p style={styles.emptySub}>Schedule your next collaborative session or launch an instant meeting.</p>
                    <button
                      onClick={() => setIsScheduleOpen(true)}
                      className="btn btn-primary"
                      style={{ marginTop: '16px' }}
                    >
                      Schedule a Meeting
                    </button>
                  </div>
                )
              ) : (
                recentMeetings.length > 0 ? (
                  recentMeetings.map((m) => (
                    <MeetingCard
                      key={m.id || m.meeting_code}
                      meeting={m}
                      type="recent"
                      onStart={(code) => router.push(`/meeting/${code}`)}
                    />
                  ))
                ) : (
                  <div style={styles.emptyState}>
                    <div style={styles.emptyIconCircle}>
                      <History size={32} color="var(--text-secondary)" />
                    </div>
                    <h4 style={styles.emptyTitle}>No Recent Meetings</h4>
                    <p style={styles.emptySub}>Your meeting history will appear here after you conclude sessions.</p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ScheduleModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        onScheduled={handleMeetingScheduled}
      />

      <JoinModal
        isOpen={isJoinOpen}
        onClose={() => setIsJoinOpen(false)}
        defaultName={user?.name || 'John Doe'}
      />
    </div>
  );
}

const styles = {
  dashboardContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '32px 28px',
  },
  topSection: {
    display: 'grid',
    gridTemplateColumns: '1.4fr 1fr',
    gap: '24px',
    marginBottom: '36px',
  },
  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '14px',
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid var(--border, #E5E5EA)',
    borderRadius: '16px',
    padding: '20px 12px 16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
  },
  actionIconBadge: {
    width: '60px',
    height: '60px',
    borderRadius: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '14px',
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.12)',
    transition: 'transform 0.2s ease',
  },
  actionTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-primary, #232333)',
    marginBottom: '4px',
  },
  actionSubtitle: {
    fontSize: '11px',
    color: 'var(--text-secondary, #747487)',
  },
  clockCard: {
    backgroundColor: 'linear-gradient(135deg, #1B1A2E 0%, #2A2946 100%)',
    background: '#1B1A2E',
    color: '#FFFFFF',
    borderRadius: '16px',
    padding: '22px 24px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxShadow: '0 6px 20px rgba(27, 26, 46, 0.25)',
    backgroundImage: 'radial-gradient(circle at top right, rgba(11, 92, 255, 0.25), transparent 60%)',
  },
  clockHeader: {
    marginBottom: '16px',
  },
  clockTime: {
    fontSize: '34px',
    fontWeight: '700',
    letterSpacing: '-0.5px',
    color: '#FFFFFF',
  },
  clockDate: {
    fontSize: '13px',
    color: '#A0A0B8',
    marginTop: '2px',
  },
  pmiBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: '10px',
    padding: '12px 14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    border: '1px solid rgba(255, 255, 255, 0.06)',
  },
  pmiInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  pmiLabel: {
    fontSize: '10px',
    color: '#9B9BB4',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
    marginBottom: '2px',
  },
  pmiValue: {
    fontSize: '13px',
    fontWeight: '600',
    fontFamily: 'monospace',
    color: '#FFFFFF',
  },
  pmiActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  pmiBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '5px 10px',
    borderRadius: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    color: '#FFFFFF',
    fontSize: '11px',
    fontWeight: '500',
    border: 'none',
    cursor: 'pointer',
    transition: 'background 0.15s ease',
  },
  pmiStartBtn: {
    padding: '5px 12px',
    borderRadius: '6px',
    backgroundColor: '#0B5CFF',
    color: '#FFFFFF',
    fontSize: '11px',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
  },
  meetingsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid var(--border, #E5E5EA)',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: '16px',
    borderBottom: '1px solid var(--border-light, #F0F0F3)',
    marginBottom: '20px',
  },
  tabsList: {
    display: 'flex',
    gap: '10px',
  },
  tabButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    borderRadius: '20px',
    backgroundColor: '#F7F8FA',
    color: 'var(--text-secondary, #747487)',
    fontSize: '13px',
    fontWeight: '500',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  tabButtonActive: {
    backgroundColor: '#E8F0FE',
    color: '#0B5CFF',
    fontWeight: '600',
  },
  tabBadge: {
    padding: '2px 7px',
    borderRadius: '10px',
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    fontSize: '11px',
    fontWeight: '700',
  },
  scheduleNewBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: '8px',
    backgroundColor: '#0B5CFF',
    color: '#FFFFFF',
    fontSize: '13px',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(11, 92, 255, 0.25)',
  },
  listContainer: {
    minHeight: '220px',
  },
  emptyState: {
    padding: '40px 20px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  emptyIconCircle: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: '#F0F5FF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '14px',
  },
  emptyTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    marginBottom: '4px',
  },
  emptySub: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    maxWidth: '380px',
  },
};
