'use client';

import React, { useState } from 'react';
import { X, Settings, Video, Mic, Shield, User, Sliders, Check } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('general');
  const [hdVideo, setHdVideo] = useState(true);
  const [noiseSuppression, setNoiseSuppression] = useState(true);
  const [mirrorVideo, setMirrorVideo] = useState(true);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Sliders },
    { id: 'video', label: 'Video', icon: Video },
    { id: 'audio', label: 'Audio', icon: Mic },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ width: '620px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={styles.iconBadge}>
              <Settings size={18} color="#0B5CFF" />
            </div>
            <h2>Zoom Settings</h2>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div style={styles.modalBodyWrapper}>
          {/* Left Settings Sidebar */}
          <div style={styles.settingsSidebar}>
            {tabs.map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  style={{
                    ...styles.tabBtn,
                    ...(isActive ? styles.tabBtnActive : {})
                  }}
                >
                  <Icon size={16} />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Settings Content */}
          <div style={styles.settingsContent}>
            {activeTab === 'general' && (
              <div>
                <h4 style={styles.sectionTitle}>General Preferences</h4>
                <label style={styles.settingRow}>
                  <input type="checkbox" defaultChecked />
                  <span>Start Zoom when I start Windows / Mac</span>
                </label>
                <label style={styles.settingRow}>
                  <input type="checkbox" defaultChecked />
                  <span>Use dual monitors when available</span>
                </label>
                <label style={styles.settingRow}>
                  <input type="checkbox" defaultChecked />
                  <span>Enter full screen automatically when joining a meeting</span>
                </label>
                <label style={styles.settingRow}>
                  <input type="checkbox" defaultChecked />
                  <span>Automatically copy invite link once meeting starts</span>
                </label>
              </div>
            )}

            {activeTab === 'video' && (
              <div>
                <h4 style={styles.sectionTitle}>Camera & Video</h4>
                <div style={styles.previewBox}>
                  <Video size={36} color="#0B5CFF" />
                  <span style={{ fontSize: '12px', color: '#747487', marginTop: '6px' }}>HD Camera Active (1080p)</span>
                </div>
                <label style={styles.settingRow}>
                  <input type="checkbox" checked={hdVideo} onChange={(e) => setHdVideo(e.target.checked)} />
                  <span>Enable HD Video Stream (1080p 60fps)</span>
                </label>
                <label style={styles.settingRow}>
                  <input type="checkbox" checked={mirrorVideo} onChange={(e) => setMirrorVideo(e.target.checked)} />
                  <span>Mirror my video locally</span>
                </label>
                <label style={styles.settingRow}>
                  <input type="checkbox" defaultChecked />
                  <span>Touch up my appearance</span>
                </label>
              </div>
            )}

            {activeTab === 'audio' && (
              <div>
                <h4 style={styles.sectionTitle}>Microphone & Speakers</h4>
                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label">Speaker Output</label>
                  <select className="form-input" defaultValue="default">
                    <option value="default">Same as System (Default Speakers)</option>
                    <option value="headphones">Headphones / AirPods Pro</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label">Microphone Input</label>
                  <select className="form-input" defaultValue="default">
                    <option value="default">Internal Microphone Array</option>
                    <option value="usb">USB Studio Condenser Mic</option>
                  </select>
                </div>
                <label style={styles.settingRow}>
                  <input type="checkbox" checked={noiseSuppression} onChange={(e) => setNoiseSuppression(e.target.checked)} />
                  <span>AI Background Noise Suppression (Auto)</span>
                </label>
              </div>
            )}

            {activeTab === 'profile' && (
              <div>
                <h4 style={styles.sectionTitle}>User Account</h4>
                <div style={styles.profileCard}>
                  <div style={styles.profileAvatar}>JD</div>
                  <div>
                    <h5 style={{ fontSize: '14px', fontWeight: '600' }}>John Doe</h5>
                    <p style={{ fontSize: '12px', color: '#747487' }}>john.doe@company.com</p>
                    <span style={styles.proBadge}>Licensed Account • Pro</span>
                  </div>
                </div>
                <div style={{ marginTop: '16px', fontSize: '12px', color: '#747487' }}>
                  Personal Meeting ID: <strong style={{ color: '#232333' }}>847-3921-5064</strong>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div>
                <h4 style={styles.sectionTitle}>Trust & Privacy</h4>
                <div style={styles.securityItem}>
                  <Shield size={16} color="#2D8C3E" />
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '13px' }}>256-Bit TLS End-to-End Encryption</div>
                    <div style={{ fontSize: '11px', color: '#747487' }}>All real-time streams and chat packets are encrypted in transit.</div>
                  </div>
                </div>
                <label style={styles.settingRow} style={{ marginTop: '12px' }}>
                  <input type="checkbox" defaultChecked />
                  <span>Enable Waiting Room by default</span>
                </label>
                <label style={styles.settingRow}>
                  <input type="checkbox" defaultChecked />
                  <span>Require passcode for all instant meetings</span>
                </label>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            {saved ? <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Check size={14} /> Saved!</span> : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  iconBadge: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    backgroundColor: '#E8F0FE',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBodyWrapper: {
    display: 'flex',
    minHeight: '320px',
    borderTop: '1px solid #E5E5EA',
  },
  settingsSidebar: {
    width: '160px',
    borderRight: '1px solid #E5E5EA',
    padding: '16px 8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  tabBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#747487',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s ease',
  },
  tabBtnActive: {
    backgroundColor: '#E8F0FE',
    color: '#0B5CFF',
    fontWeight: '600',
  },
  settingsContent: {
    flex: 1,
    padding: '20px 24px',
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: '700',
    marginBottom: '16px',
    color: '#232333',
  },
  settingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '13px',
    color: '#333333',
    marginBottom: '12px',
    cursor: 'pointer',
  },
  previewBox: {
    height: '110px',
    backgroundColor: '#F0F5FF',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
    border: '1px dashed #0B5CFF',
  },
  profileCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '14px',
    backgroundColor: '#F8F9FA',
    borderRadius: '10px',
    border: '1px solid #ECECEC',
  },
  profileAvatar: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    backgroundColor: '#0B5CFF',
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  proBadge: {
    display: 'inline-block',
    marginTop: '4px',
    padding: '2px 8px',
    backgroundColor: '#E8F0FE',
    color: '#0B5CFF',
    borderRadius: '6px',
    fontSize: '10px',
    fontWeight: '700',
  },
  securityItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '12px',
    backgroundColor: '#F0F9F2',
    borderRadius: '8px',
    border: '1px solid #C8E6C9',
  },
};
