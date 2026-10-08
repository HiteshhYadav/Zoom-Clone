'use client';

import React from 'react';
import { Search, Bell, Settings, HelpCircle, User, ShieldAlert } from 'lucide-react';

export default function Navbar({ user }) {
  return (
    <header style={styles.header}>
      {/* Search Bar */}
      <div style={styles.searchContainer}>
        <Search size={16} color="var(--text-tertiary)" style={styles.searchIcon} />
        <input 
          type="text" 
          placeholder="Search meetings, contacts, messages (Ctrl+F)" 
          style={styles.searchInput} 
        />
      </div>

      {/* Right User Actions */}
      <div style={styles.rightActions}>
        <div style={styles.planBadge}>
          <span style={styles.planDot}></span>
          <span style={styles.planText}>Pro License</span>
        </div>

        <button style={styles.iconBtn} title="Help & Support">
          <HelpCircle size={18} />
        </button>

        <button style={styles.iconBtn} title="Notifications">
          <Bell size={18} />
          <span style={styles.notificationBadge} />
        </button>

        <div style={styles.divider} />

        {/* User Profile Pill */}
        <div style={styles.profilePill}>
          <div style={styles.avatar}>
            {user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'JD'}
          </div>
          <div style={styles.profileInfo}>
            <span style={styles.userName}>{user?.name || 'John Doe'}</span>
            <span style={styles.userRole}>Host</span>
          </div>
        </div>
      </div>
    </header>
  );
}

const styles = {
  header: {
    height: '60px',
    backgroundColor: '#FFFFFF',
    borderBottom: '1px solid var(--border, #E5E5EA)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    position: 'sticky',
    top: 0,
    zIndex: 90,
  },
  searchContainer: {
    position: 'relative',
    width: '380px',
    maxWidth: '45%',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
  },
  searchInput: {
    width: '100%',
    padding: '8px 14px 8px 36px',
    backgroundColor: '#F3F4F6',
    border: '1px solid transparent',
    borderRadius: '20px',
    fontSize: '13px',
    color: 'var(--text-primary)',
    outline: 'none',
    transition: 'all 0.2s ease',
  },
  rightActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  planBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    backgroundColor: '#E8F0FE',
    borderRadius: '12px',
    color: '#0B5CFF',
    fontSize: '11px',
    fontWeight: '600',
  },
  planDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#0B5CFF',
  },
  planText: {
    letterSpacing: '0.3px',
  },
  iconBtn: {
    position: 'relative',
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-secondary)',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  notificationBadge: {
    position: 'absolute',
    top: '6px',
    right: '6px',
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#E53935',
  },
  divider: {
    width: '1px',
    height: '24px',
    backgroundColor: 'var(--border, #E5E5EA)',
    margin: '0 4px',
  },
  profilePill: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '4px 10px 4px 4px',
    borderRadius: '20px',
    backgroundColor: '#F7F8FA',
    border: '1px solid #ECECEC',
    cursor: 'pointer',
  },
  avatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#0B5CFF',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: '700',
  },
  profileInfo: {
    display: 'flex',
    flexDirection: 'column',
    lineHeight: '1.2',
  },
  userName: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  userRole: {
    fontSize: '10px',
    color: 'var(--text-secondary)',
  },
};
