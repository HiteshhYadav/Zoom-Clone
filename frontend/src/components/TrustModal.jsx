'use client';

import React from 'react';
import { X, ShieldCheck, Lock, Award, EyeOff, CheckCircle2 } from 'lucide-react';

export default function TrustModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ width: '560px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={styles.iconBadge}>
              <ShieldCheck size={20} color="#2D8C3E" />
            </div>
            <h2>Zoom Trust Center & Security</h2>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '13px', color: '#747487', marginBottom: '18px', lineHeight: '1.5' }}>
            Your privacy and security are foundational to everything we build. All communication sessions are protected with multi-layer encryption.
          </p>

          <div style={styles.grid}>
            <div style={styles.trustCard}>
              <div style={styles.cardHeader}>
                <Lock size={16} color="#0B5CFF" />
                <span style={styles.cardTitle}>256-Bit TLS Encryption</span>
              </div>
              <p style={styles.cardText}>In-transit protection for audio, video, screen share, and instant chat messages.</p>
            </div>

            <div style={styles.trustCard}>
              <div style={styles.cardHeader}>
                <Award size={16} color="#2D8C3E" />
                <span style={styles.cardTitle}>SOC 2 & ISO 27001</span>
              </div>
              <p style={styles.cardText}>Certified compliant with globally recognized data security standards.</p>
            </div>

            <div style={styles.trustCard}>
              <div style={styles.cardHeader}>
                <EyeOff size={16} color="#F26D21" />
                <span style={styles.cardTitle}>Zero Data Selling</span>
              </div>
              <p style={styles.cardText}>We never sell customer meeting content or audio transcripts to third parties.</p>
            </div>

            <div style={styles.trustCard}>
              <div style={styles.cardHeader}>
                <CheckCircle2 size={16} color="#8E44AD" />
                <span style={styles.cardTitle}>GDPR & CCPA Ready</span>
              </div>
              <p style={styles.cardText}>Comprehensive user data control, export, and right-to-be-forgotten APIs.</p>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>
            Understood
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
    backgroundColor: '#E6F7ED',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  trustCard: {
    backgroundColor: '#F8FAFD',
    border: '1px solid #E1E9F8',
    borderRadius: '10px',
    padding: '14px',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '6px',
  },
  cardTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#232333',
  },
  cardText: {
    fontSize: '11px',
    color: '#747487',
    lineHeight: '1.4',
  },
};
