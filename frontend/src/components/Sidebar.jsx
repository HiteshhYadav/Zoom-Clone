'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Video, 
  Calendar, 
  MessageSquare, 
  Clock, 
  Users, 
  Settings, 
  ShieldCheck 
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { icon: Home, label: 'Home', href: '/', active: pathname === '/' },
    { icon: Calendar, label: 'Meetings', href: '/#meetings', active: pathname.includes('/#meetings') },
    { icon: MessageSquare, label: 'Team Chat', href: '/#chat', active: false },
    { icon: Video, label: 'Clips', href: '/#clips', active: false },
    { icon: Users, label: 'Contacts', href: '/#contacts', active: false },
  ];

  return (
    <aside style={styles.sidebar}>
      {/* Zoom Logo Brand */}
      <div style={styles.logoContainer}>
        <div style={styles.logoBadge}>
          <Video size={24} color="#FFFFFF" strokeWidth={2.5} />
        </div>
      </div>

      {/* Main Navigation */}
      <nav style={styles.nav}>
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <Link 
              key={idx} 
              href={item.href}
              style={{
                ...styles.navItem,
                ...(item.active ? styles.navItemActive : {})
              }}
              title={item.label}
            >
              <div style={styles.iconWrapper}>
                <Icon size={20} strokeWidth={item.active ? 2.2 : 1.8} />
              </div>
              <span style={{
                ...styles.navLabel,
                color: item.active ? '#FFFFFF' : 'var(--sidebar-text)'
              }}>
                {item.label}
              </span>
              {item.active && <div style={styles.activeIndicator} />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Profile / Settings */}
      <div style={styles.bottomSection}>
        <button style={styles.bottomBtn} title="Security & Compliance">
          <ShieldCheck size={20} />
          <span style={styles.navLabel}>Trust</span>
        </button>
        <button style={styles.bottomBtn} title="Settings">
          <Settings size={20} />
          <span style={styles.navLabel}>Settings</span>
        </button>
        <div style={styles.userAvatarContainer} title="John Doe (Host)">
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
    gap: '12px',
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
    transition: 'all 0.15s ease',
    textDecoration: 'none',
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
    gap: '12px',
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
