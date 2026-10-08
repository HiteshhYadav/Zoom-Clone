'use client';

import React, { useState } from 'react';
import { 
  Hash, 
  Send, 
  Search, 
  Smile, 
  Paperclip, 
  User, 
  Video, 
  Phone, 
  MoreVertical,
  Plus,
  Circle
} from 'lucide-react';

export default function TeamChatView({ onStartMeeting }) {
  const [activeChannel, setActiveChannel] = useState('general');
  const [chatInput, setChatInput] = useState('');
  
  const [messages, setMessages] = useState({
    general: [
      { id: 1, sender: 'Sarah Chen (PM)', text: 'Morning everyone! Let\'s review the Sprint 24 objectives today at 2 PM.', time: '09:15 AM', avatarColor: '#8E44AD' },
      { id: 2, sender: 'Alex Rivera (Eng)', text: 'FastAPI backend and Next.js frontend are both synced with SQLite schema. Ready for testing!', time: '09:22 AM', avatarColor: '#16A085' },
      { id: 3, sender: 'Emily Taylor (Design)', text: 'Uploaded the updated Zoom icons and color tokens to the repo.', time: '09:40 AM', avatarColor: '#D35400' },
    ],
    engineering: [
      { id: 1, sender: 'Alex Rivera (Eng)', text: 'Deployed the new WebSocket connection manager with automatic reconnect support.', time: '10:05 AM', avatarColor: '#16A085' },
    ],
    sarah: [
      { id: 1, sender: 'Sarah Chen (PM)', text: 'Hey John, do you have a few minutes for a quick 1:1 sync before the client demo?', time: '11:10 AM', avatarColor: '#8E44AD' },
    ]
  });

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: 'John Doe (You)',
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      avatarColor: '#0B5CFF'
    };

    setMessages(prev => ({
      ...prev,
      [activeChannel]: [...(prev[activeChannel] || []), newMsg]
    }));
    setChatInput('');
  };

  const channelNames = {
    general: '📢 general-announcements',
    engineering: '💻 engineering-team',
    sarah: '👤 Sarah Chen (PM)',
  };

  return (
    <div style={styles.container}>
      {/* Left Chat Channels Sidebar */}
      <div style={styles.channelsSidebar}>
        <div style={styles.searchBox}>
          <Search size={14} color="#747487" />
          <input type="text" placeholder="Jump to chat..." style={styles.searchInput} />
        </div>

        <div style={styles.sectionHeader}>
          <span>CHANNELS</span>
          <Plus size={14} style={{ cursor: 'pointer' }} />
        </div>
        <button
          onClick={() => setActiveChannel('general')}
          style={{ ...styles.channelItem, ...(activeChannel === 'general' ? styles.channelActive : {}) }}
        >
          <Hash size={16} />
          <span>general-announcements</span>
        </button>
        <button
          onClick={() => setActiveChannel('engineering')}
          style={{ ...styles.channelItem, ...(activeChannel === 'engineering' ? styles.channelActive : {}) }}
        >
          <Hash size={16} />
          <span>engineering-team</span>
        </button>

        <div style={{ ...styles.sectionHeader, marginTop: '20px' }}>
          <span>DIRECT MESSAGES</span>
        </div>
        <button
          onClick={() => setActiveChannel('sarah')}
          style={{ ...styles.channelItem, ...(activeChannel === 'sarah' ? styles.channelActive : {}) }}
        >
          <div style={styles.dmAvatarWrapper}>
            <div style={{ ...styles.dmAvatar, backgroundColor: '#8E44AD' }}>SC</div>
            <div style={styles.onlineDot} />
          </div>
          <span>Sarah Chen</span>
        </button>
      </div>

      {/* Main Chat Area */}
      <div style={styles.mainChat}>
        {/* Chat Header */}
        <div style={styles.chatTopBar}>
          <div>
            <h3 style={styles.channelTitle}>{channelNames[activeChannel]}</h3>
            <span style={styles.channelSub}>Team collaboration space • 4 members</span>
          </div>
          <div style={styles.headerActions}>
            <button 
              onClick={() => onStartMeeting && onStartMeeting('Team Quick Meet')}
              style={styles.meetNowBtn}
            >
              <Video size={14} />
              <span>Meet Now</span>
            </button>
          </div>
        </div>

        {/* Messages List */}
        <div style={styles.messagesList}>
          {(messages[activeChannel] || []).map((m) => (
            <div key={m.id} style={styles.messageItem}>
              <div style={{ ...styles.msgAvatar, backgroundColor: m.avatarColor || '#0B5CFF' }}>
                {m.sender.split(' ').map(n => n[0]).join('')}
              </div>
              <div style={styles.msgBody}>
                <div style={styles.msgHeader}>
                  <span style={styles.msgSender}>{m.sender}</span>
                  <span style={styles.msgTime}>{m.time}</span>
                </div>
                <p style={styles.msgText}>{m.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSendMessage} style={styles.composerForm}>
          <input
            type="text"
            placeholder={`Message ${channelNames[activeChannel]}...`}
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            style={styles.composerInput}
          />
          <button type="submit" style={styles.sendBtn} disabled={!chatInput.trim()}>
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    height: 'calc(100vh - 60px)',
    backgroundColor: '#FFFFFF',
  },
  channelsSidebar: {
    width: '260px',
    borderRight: '1px solid var(--border)',
    padding: '16px 12px',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#F8FAFD',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    marginBottom: '16px',
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    fontSize: '12px',
    width: '100%',
  },
  sectionHeader: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#747487',
    letterSpacing: '0.5px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 8px',
    marginBottom: '8px',
  },
  channelItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 10px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#232333',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s ease',
    marginBottom: '2px',
  },
  channelActive: {
    backgroundColor: '#E8F0FE',
    color: '#0B5CFF',
    fontWeight: '600',
  },
  dmAvatarWrapper: {
    position: 'relative',
  },
  dmAvatar: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    color: '#FFFFFF',
    fontSize: '10px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineDot: {
    position: 'absolute',
    bottom: '-1px',
    right: '-1px',
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    backgroundColor: '#2D8C3E',
    border: '1px solid #FFFFFF',
  },
  mainChat: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
  },
  chatTopBar: {
    height: '64px',
    padding: '0 24px',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  channelTitle: {
    fontSize: '16px',
    fontWeight: '700',
  },
  channelSub: {
    fontSize: '11px',
    color: '#747487',
  },
  meetNowBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 14px',
    backgroundColor: '#0B5CFF',
    color: '#FFFFFF',
    borderRadius: '6px',
    border: 'none',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  messagesList: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  messageItem: {
    display: 'flex',
    gap: '12px',
  },
  msgAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  msgBody: {
    flex: 1,
  },
  msgHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '3px',
  },
  msgSender: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#232333',
  },
  msgTime: {
    fontSize: '11px',
    color: '#9E9E9E',
  },
  msgText: {
    fontSize: '13px',
    color: '#333333',
    lineHeight: '1.4',
  },
  composerForm: {
    padding: '16px 24px',
    borderTop: '1px solid var(--border)',
    display: 'flex',
    gap: '10px',
  },
  composerInput: {
    flex: 1,
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    fontSize: '13px',
    outline: 'none',
  },
  sendBtn: {
    width: '42px',
    backgroundColor: '#0B5CFF',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
};
