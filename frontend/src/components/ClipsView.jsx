'use client';

import React, { useState } from 'react';
import { Play, Video, Clock, Share2, MoreVertical, Plus } from 'lucide-react';

export default function ClipsView({ onStartMeeting }) {
  const [playingClip, setPlayingClip] = useState(null);

  const clips = [
    { id: 1, title: 'Zoom Scalability Demo & Code Walkthrough', duration: '03:45', date: 'Yesterday', views: 28, author: 'John Doe' },
    { id: 2, title: 'Q4 Product Roadmap & Sprint 24 Kickoff', duration: '08:12', date: '3 days ago', views: 45, author: 'Sarah Chen' },
    { id: 3, title: 'Design Tokens & UI System Guidelines', duration: '04:30', date: 'Last week', views: 62, author: 'Emily Taylor' },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <div>
          <h2 style={styles.title}>Zoom Clips & Recordings</h2>
          <p style={styles.subtitle}>Short-form video messages and recorded meeting sessions</p>
        </div>
        <button 
          onClick={() => onStartMeeting && onStartMeeting('Quick Clip Recording')}
          style={styles.recordClipBtn}
        >
          <Video size={15} />
          <span>Record a Clip</span>
        </button>
      </div>

      {playingClip && (
        <div style={styles.playerBanner}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={styles.playBadge}><Play size={16} fill="#FFFFFF" /></div>
            <div>
              <div style={{ fontWeight: '600', fontSize: '13px' }}>Now Playing: {playingClip.title}</div>
              <div style={{ fontSize: '11px', color: '#747487' }}>Duration: {playingClip.duration} • Shared with Organization</div>
            </div>
          </div>
          <button onClick={() => setPlayingClip(null)} style={styles.closePlayerBtn}>Close Player</button>
        </div>
      )}

      <div style={styles.clipsGrid}>
        {clips.map((clip) => (
          <div key={clip.id} style={styles.clipCard}>
            <div 
              style={styles.thumbnailBox}
              onClick={() => setPlayingClip(clip)}
            >
              <div style={styles.playOverlay}>
                <div style={styles.playCircle}>
                  <Play size={20} fill="#FFFFFF" />
                </div>
              </div>
              <span style={styles.durationBadge}>{clip.duration}</span>
            </div>

            <div style={styles.clipMeta}>
              <h4 style={styles.clipTitle}>{clip.title}</h4>
              <div style={styles.clipInfoRow}>
                <span>{clip.author}</span>
                <span>•</span>
                <span>{clip.date}</span>
                <span>•</span>
                <span>{clip.views} views</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '32px 28px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
  },
  title: {
    fontSize: '20px',
    fontWeight: '700',
  },
  subtitle: {
    fontSize: '13px',
    color: '#747487',
  },
  recordClipBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    backgroundColor: '#F26D21',
    color: '#FFFFFF',
    borderRadius: '8px',
    border: 'none',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  playerBanner: {
    backgroundColor: '#1B1A2E',
    color: '#FFFFFF',
    padding: '14px 20px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  playBadge: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#0B5CFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closePlayerBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    color: '#FFFFFF',
    border: 'none',
    padding: '5px 12px',
    borderRadius: '6px',
    fontSize: '11px',
    cursor: 'pointer',
  },
  clipsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px',
  },
  clipCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid var(--border)',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
  },
  thumbnailBox: {
    height: '170px',
    backgroundColor: '#1E2230',
    position: 'relative',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundImage: 'radial-gradient(circle at center, rgba(11, 92, 255, 0.25), transparent 70%)',
  },
  playOverlay: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playCircle: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: 'rgba(11, 92, 255, 0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: '3px',
    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)',
  },
  durationBadge: {
    position: 'absolute',
    bottom: '10px',
    right: '10px',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    color: '#FFFFFF',
    padding: '3px 7px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '600',
  },
  clipMeta: {
    padding: '14px 16px',
  },
  clipTitle: {
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '6px',
    color: '#232333',
  },
  clipInfoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    color: '#747487',
  },
};
