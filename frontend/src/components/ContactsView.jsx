'use client';

import React, { useState } from 'react';
import { Search, Video, MessageSquare, Mail, Phone, MoreHorizontal, UserPlus } from 'lucide-react';

export default function ContactsView({ onStartMeeting, onOpenChat }) {
  const [search, setSearch] = useState('');

  const contacts = [
    { id: 1, name: 'Sarah Chen', title: 'Product Manager', email: 'sarah.chen@company.com', status: 'Available', color: '#8E44AD' },
    { id: 2, name: 'Alex Rivera', title: 'Lead Backend Engineer', email: 'alex.rivera@company.com', status: 'In a Meeting', color: '#16A085' },
    { id: 3, name: 'Emily Taylor', title: 'Senior UX Designer', email: 'emily.taylor@company.com', status: 'Available', color: '#D35400' },
    { id: 4, name: 'David Kim', title: 'Engineering Director', email: 'david.kim@company.com', status: 'Away', color: '#2980B9' },
    { id: 5, name: 'Jessica Patel', title: 'Fullstack Developer', email: 'jessica.patel@company.com', status: 'Available', color: '#27AE60' },
  ];

  const filtered = contacts.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <div>
          <h2 style={styles.title}>Company Contacts Directory</h2>
          <p style={styles.subtitle}>Connect directly with team members across departments</p>
        </div>
        <button style={styles.addContactBtn}>
          <UserPlus size={15} />
          <span>Add Contact</span>
        </button>
      </div>

      <div style={styles.searchBar}>
        <Search size={16} color="#747487" />
        <input 
          type="text" 
          placeholder="Search by name, department, or email..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      <div style={styles.contactsGrid}>
        {filtered.map((c) => (
          <div key={c.id} style={styles.contactCard}>
            <div style={styles.cardTop}>
              <div style={{ ...styles.avatar, backgroundColor: c.color }}>
                {c.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div style={styles.contactInfo}>
                <h4 style={styles.contactName}>{c.name}</h4>
                <span style={styles.contactTitle}>{c.title}</span>
                <div style={styles.statusRow}>
                  <span style={{
                    ...styles.statusDot,
                    backgroundColor: c.status === 'Available' ? '#2D8C3E' : c.status === 'In a Meeting' ? '#E53935' : '#F5A623'
                  }} />
                  <span style={styles.statusText}>{c.status}</span>
                </div>
              </div>
            </div>

            <div style={styles.cardActions}>
              <button 
                onClick={() => onStartMeeting && onStartMeeting(`1:1 Call with ${c.name}`)}
                style={styles.actionBtnPrimary}
              >
                <Video size={14} />
                <span>Meet</span>
              </button>
              <button 
                onClick={() => onOpenChat && onOpenChat('sarah')}
                style={styles.actionBtnSecondary}
              >
                <MessageSquare size={14} />
                <span>Chat</span>
              </button>
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
    marginBottom: '20px',
  },
  title: {
    fontSize: '20px',
    fontWeight: '700',
  },
  subtitle: {
    fontSize: '13px',
    color: '#747487',
  },
  addContactBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    backgroundColor: '#0B5CFF',
    color: '#FFFFFF',
    borderRadius: '8px',
    border: 'none',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 16px',
    backgroundColor: '#FFFFFF',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    marginBottom: '24px',
    maxWidth: '500px',
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    fontSize: '13px',
    width: '100%',
  },
  contactsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '16px',
  },
  contactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid var(--border)',
    padding: '18px 20px',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
  },
  cardTop: {
    display: 'flex',
    gap: '14px',
    marginBottom: '16px',
  },
  avatar: {
    width: '46px',
    height: '46px',
    borderRadius: '50%',
    color: '#FFFFFF',
    fontSize: '15px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: '15px',
    fontWeight: '700',
    marginBottom: '2px',
  },
  contactTitle: {
    fontSize: '12px',
    color: '#747487',
    display: 'block',
    marginBottom: '6px',
  },
  statusRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  statusText: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#555555',
  },
  cardActions: {
    display: 'flex',
    gap: '10px',
    borderTop: '1px solid #F0F0F3',
    paddingTop: '12px',
  },
  actionBtnPrimary: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '7px',
    backgroundColor: '#0B5CFF',
    color: '#FFFFFF',
    borderRadius: '6px',
    border: 'none',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  actionBtnSecondary: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '7px',
    backgroundColor: '#F3F4F6',
    color: '#232333',
    borderRadius: '6px',
    border: '1px solid #E5E7EB',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
  },
};
