'use client';

import React from 'react';
import { 
  Home, 
  Calendar, 
  MessageSquare, 
  Video, 
  Users, 
  Settings, 
  ShieldCheck 
} from 'lucide-react';

export default function Sidebar({ activeTab = 'home', onTabChange, onOpenSettings, onOpenTrust }) {
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'meetings', icon: Calendar, label: 'Meetings' },
    { id: 'chat', icon: MessageSquare, label: 'Team Chat' },
    { id: 'clips', icon: Video, label: 'Clips' },
    { id: 'contacts', icon: Users, label: 'Contacts' },
  ];

  return (
    <aside style={styles.sidebar}>
      {/* Zoom Logo Brand */}
      <div style={styles.logoContainer} onClick={() => onTabChange && onTabChange('home')} role="button" tabIndex={0}>
        <div style={styles.logoBadge}>
          <Video size={24} color="#FFFFFF" strokeWidth={2.5} />
        </div>
      </div>

      {/* Main Navigation */}
      <nav style={styles.nav}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange && onTabChange(item.id)}
              style={{
                ...styles.navItem,
                ...(isActive ? styles.navItemActive : {})
              }}
              title={item.label}
            >
              <div style={styles.iconWrapper}>
                <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
              </div>
              <span style={{
                ...styles.navLabel,
                color: isActive ? '#FFFFFF' : 'var(--sidebar-text)'
              }}>
                {item.label}
              </span>
              {isActive && <div style={styles.activeIndicator} />}
            </button>
          );
        })}
      </nav>

      {/* Bottom Profile / Settings */}
      <div style={styles.bottomSection}>
        <button 
          onClick={onOpenTrust}
          style={styles.bottomBtn} 
          title="Security & Compliance"
        >
          <ShieldCheck size={20} />
          <span style={styles.navLabel}>Trust</span>
        </button>
        <button 
          onClick={onOpenSettings}
          style={styles.bottomBtn} 
          title="Settings"
        >
          <Settings size={20} />
          <span style={styles.navLabel}>Settings</span>
        </button>
        <div 
          style={styles.userAvatarContainer} 
          onClick={onOpenSettings}
          title="John Doe (Host) — Click for Profile"
        >
          <div style={styles.userAvatar}>
            JD
          </div>
          <div style={styles.onlineBadge} />
        </div>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    width: 'var(--sidebar-width, 72px)',
    backgroundColor: 'var(--sidebar-bg, #1B1A2E)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '16px 0',
    zIndex: 100,
    boxShadow: '2px 0 10px rgba(0, 0, 0, 0.1)',
  },
  logoContainer: {
    marginBottom: '24px',
    cursor: 'pointer',
  },
  logoBadge: {
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #0B5CFF 0%, #0044CC 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(11, 92, 255, 0.4)',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    width: '100%',
    alignItems: 'center',
    flex: 1,
  },
  navItem: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '58px',
    height: '56px',
    borderRadius: '10px',
    color: 'var(--sidebar-text, #9B9BB4)',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  navItemActive: {
    backgroundColor: 'var(--sidebar-active, rgba(255, 255, 255, 0.12))',
    color: '#FFFFFF',
  },
  iconWrapper: {
    marginBottom: '3px',
  },
  navLabel: {
    fontSize: '10px',
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: '0.2px',
  },
  activeIndicator: {
    position: 'absolute',
    left: '0px',
    top: '12px',
    bottom: '12px',
    width: '3px',
    backgroundColor: '#0B5CFF',
    borderTopRightRadius: '4px',
    borderBottomRightRadius: '4px',
  },
  bottomSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    paddingTop: '12px',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
  },
  bottomBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '58px',
    height: '50px',
    borderRadius: '10px',
    color: 'var(--sidebar-text, #9B9BB4)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  userAvatarContainer: {
    position: 'relative',
    marginTop: '6px',
    cursor: 'pointer',
  },
  userAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#0B5CFF',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    fontSize: '12px',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: '0px',
    right: '0px',
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: '#2D8C3E',
    border: '2px solid var(--sidebar-bg, #1B1A2E)',
  },
};
