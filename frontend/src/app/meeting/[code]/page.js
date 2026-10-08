'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Share2,
  Users,
  MessageSquare,
  Smile,
  PhoneOff,
  Shield,
  LayoutGrid,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Send,
  MoreVertical,
  Volume2,
  VolumeX,
  X,
  UserCheck,
  Radio,
  Hand,
  MonitorUp,
  Settings,
  HelpCircle,
  Circle
} from 'lucide-react';
import { getMeeting, endMeeting, connectToMeeting } from '@/lib/api';

import { Suspense } from 'react';

function MeetingRoomContent() {
  const params = useParams();
  const router = useRouter();
  const meetingCode = params.code;

  // Meeting & User State
  const [meeting, setMeeting] = useState(null);
  const [displayName, setDisplayName] = useState('John Doe (Host)');
  const [isHost, setIsHost] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Audio/Video/Screen State
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [viewMode, setViewMode] = useState('gallery'); // 'gallery' | 'speaker'
  const [isRecording, setIsRecording] = useState(false);
  const [handRaised, setHandRaised] = useState(false);

  // Panels
  const [activePanel, setActivePanel] = useState(null); // 'participants' | 'chat' | 'security' | 'invite' | null
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  // Live WebSocket Data
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [floatingReactions, setFloatingReactions] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // UI helpers
  const [copiedLink, setCopiedLink] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [meetingDuration, setMeetingDuration] = useState(0);

  // Refs
  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const socketRef = useRef(null);
  const chatBottomRef = useRef(null);

  // Meeting timer
  useEffect(() => {
    const timer = setInterval(() => {
      setMeetingDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Load meeting data & Initialize Preferences
  useEffect(() => {
    async function initMeeting() {
      try {
        setLoading(true);
        const meetingData = await getMeeting(meetingCode);
        setMeeting(meetingData);

        // Retrieve local storage preferences if configured
        if (typeof window !== 'undefined') {
          const savedName = localStorage.getItem(`zoom_name_${meetingCode}`);
          const savedVideo = localStorage.getItem(`zoom_video_${meetingCode}`);
          const savedAudio = localStorage.getItem(`zoom_audio_${meetingCode}`);
          const autoScreen = localStorage.getItem(`zoom_screenshare_${meetingCode}`);

          const finalName = savedName || 'John Doe (Host)';
          setDisplayName(finalName);
          if (savedVideo !== null) setIsVideoOn(savedVideo === 'true');
          if (savedAudio !== null) setIsMuted(savedAudio === 'false');
          if (autoScreen === 'true') {
            setIsScreenSharing(true);
            localStorage.removeItem(`zoom_screenshare_${meetingCode}`);
          }

          // Initial participants list including simulated attendees
          const defaultParticipants = [
            { id: 1, name: finalName, isHost: true, isMuted: savedAudio === 'false', isVideoOn: savedVideo !== 'false', avatarColor: '#0B5CFF' },
            { id: 2, name: 'Sarah Chen (PM)', isHost: false, isMuted: false, isVideoOn: true, avatarColor: '#8E44AD' },
            { id: 3, name: 'Alex Rivera (Eng)', isHost: false, isMuted: true, isVideoOn: true, avatarColor: '#16A085' },
            { id: 4, name: 'Emily Taylor (Design)', isHost: false, isMuted: false, isVideoOn: false, avatarColor: '#D35400' },
          ];
          setParticipants(defaultParticipants);

          // Initial seed chat messages
          setMessages([
            { id: 1, sender: 'Zoom Bot', text: 'Welcome to your meeting! End-to-end encryption is enabled.', time: 'Just now', isSystem: true },
            { id: 2, sender: 'Sarah Chen (PM)', text: 'Hey team, glad everyone could make it!', time: '1 min ago' },
          ]);

          // Connect WebSocket for live communication
          try {
            const ws = connectToMeeting(meetingCode, finalName);
            socketRef.current = ws;

            ws.onmessage = (event) => {
              const data = JSON.parse(event.data);
              handleSocketMessage(data);
            };

            ws.onerror = () => {
              console.log('WebSocket running in offline/simulated fallback mode.');
            };
          } catch (wsErr) {
            console.warn('WS Init notice:', wsErr);
          }
        }
      } catch (err) {
        setError(err.message || 'Unable to join meeting');
      } finally {
        setLoading(false);
      }
    }

    initMeeting();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [meetingCode]);

  // Webcam stream setup
  useEffect(() => {
    async function startCamera() {
      if (isVideoOn) {
        try {
          if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            localStreamRef.current = stream;
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = stream;
            }
          }
        } catch (camErr) {
          console.log('Camera access notice (fallback to animated avatar avatar):', camErr.message);
        }
      } else {
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach(track => track.stop());
          localStreamRef.current = null;
        }
      }
    }
    startCamera();
  }, [isVideoOn]);

  // WebSocket message receiver
  const handleSocketMessage = (data) => {
    switch (data.type) {
      case 'chat_message':
        setMessages(prev => [...prev, {
          id: Date.now(),
          sender: data.name,
          text: data.message,
          time: data.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        if (activePanel !== 'chat') {
          setUnreadChatCount(prev => prev + 1);
        }
        break;
      case 'reaction':
        triggerFloatingReaction(data.emoji, data.name);
        break;
      case 'participant_joined':
        if (!participants.some(p => p.name === data.name)) {
          setParticipants(prev => [...prev, {
            id: Date.now(),
            name: data.name,
            isHost: false,
            isMuted: false,
            isVideoOn: true,
            avatarColor: '#2980B9'
          }]);
        }
        break;
      case 'participant_left':
        setParticipants(prev => prev.filter(p => p.name !== data.name));
        break;
      case 'mute_all':
        setIsMuted(true);
        break;
      default:
        break;
    }
  };

  // Floating reaction trigger
  const triggerFloatingReaction = (emoji, senderName = 'You') => {
    const id = Date.now() + Math.random();
    setFloatingReactions(prev => [...prev, { id, emoji, senderName }]);
    setTimeout(() => {
      setFloatingReactions(prev => prev.filter(r => r.id !== id));
    }, 3500);
  };

  const handleSendReaction = (emoji) => {
    triggerFloatingReaction(emoji, 'You');
    setShowEmojiPicker(false);
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'reaction', emoji }));
    }
  };

  // Chat sender
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: displayName,
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'chat_message',
        message: chatInput.trim(),
        timestamp: newMsg.time
      }));
    }
    setChatInput('');
  };

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Host Controls: Mute All
  const handleMuteAll = () => {
    setParticipants(prev => prev.map(p => ({ ...p, isMuted: true })));
    setIsMuted(true);
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'mute_all' }));
    }
  };

  // Host Controls: Remove Participant
  const handleRemoveParticipant = (id, name) => {
    setParticipants(prev => prev.filter(p => p.id !== id));
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'remove_participant', target_name: name }));
    }
  };

  // Copy Meeting Link
  const handleCopyInvite = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const link = `${origin}/meeting/${meetingCode}`;
    const text = `Join Zoom Meeting:\n${meeting?.title || 'Zoom Meeting'}\nMeeting ID: ${meetingCode}\nLink: ${link}`;
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // End or Leave Meeting
  const handleEndMeeting = async () => {
    if (confirm('Are you sure you want to end this meeting for all participants?')) {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      try {
        await endMeeting(meetingCode);
      } catch (err) {
        // Handled locally
      }
      router.push('/');
    }
  };

  const togglePanel = (panelName) => {
    if (activePanel === panelName) {
      setActivePanel(null);
    } else {
      setActivePanel(panelName);
      if (panelName === 'chat') setUnreadChatCount(0);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingScreen}>
        <div style={styles.loadingLogo}>
          <Video size={40} color="#FFFFFF" />
        </div>
        <h2 style={{ marginTop: '20px', color: '#FFFFFF', fontSize: '18px' }}>
          Connecting to Zoom Meeting...
        </h2>
        <p style={{ color: '#8E8E93', fontSize: '13px', marginTop: '6px' }}>Meeting ID: {meetingCode}</p>
      </div>
    );
  }

  return (
    <div style={styles.roomContainer}>
      {/* ── TOP MEETING BAR ────────────────────────────────────────── */}
      <header style={styles.roomHeader}>
        <div style={styles.headerLeft}>
          <div style={styles.securityBadge} onClick={() => togglePanel('security')} title="Zoom 256-bit Encryption">
            <Shield size={16} color="#2D8C3E" fill="#2D8C3E" />
          </div>
          <div style={styles.meetingInfoBlock}>
            <span style={styles.roomTitle}>{meeting?.title || 'Zoom Meeting'}</span>
            <div style={styles.roomMetaRow}>
              <span style={styles.codeText}>ID: {meetingCode}</span>
              <span style={styles.timerBadge}>
                <Circle size={8} fill={isRecording ? '#E53935' : '#2D8C3E'} color={isRecording ? '#E53935' : '#2D8C3E'} />
                {formatTimer(meetingDuration)}
              </span>
              {isRecording && (
                <span style={styles.recordingPill}>
                  <Radio size={12} style={{ animation: 'pulse 1.5s infinite' }} /> REC
                </span>
              )}
            </div>
          </div>
        </div>

        <div style={styles.headerRight}>
          <button 
            onClick={handleCopyInvite}
            style={styles.inviteHeaderBtn}
          >
            {copiedLink ? <Check size={14} color="#2D8C3E" /> : <Copy size={14} />}
            <span>{copiedLink ? 'Link Copied!' : 'Copy Invite'}</span>
          </button>

          <button 
            onClick={() => setViewMode(viewMode === 'gallery' ? 'speaker' : 'gallery')}
            style={styles.viewToggleBtn}
          >
            <LayoutGrid size={15} />
            <span>{viewMode === 'gallery' ? 'Speaker View' : 'Gallery View'}</span>
          </button>

          <button 
            onClick={() => {
              if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
                setIsFullscreen(true);
              } else {
                document.exitFullscreen();
                setIsFullscreen(false);
              }
            }}
            style={styles.headerIconBtn}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </header>

      {/* ── MAIN STAGE & SIDEBAR PANELS ────────────────────────────── */}
      <div style={styles.stageWrapper}>
        {/* VIDEO TILES GRID */}
        <div style={styles.videoStage}>
          {/* Floating Emoji Reactions Layer */}
          <div style={styles.reactionsLayer}>
            {floatingReactions.map((r) => (
              <div key={r.id} style={styles.floatingEmojiItem}>
                <span style={{ fontSize: '36px' }}>{r.emoji}</span>
                <span style={styles.floatingEmojiUser}>{r.senderName}</span>
              </div>
            ))}
          </div>

          {/* SCREEN SHARING SIMULATOR VIEW */}
          {isScreenSharing ? (
            <div style={styles.screenShareStage}>
              <div style={styles.shareBanner}>
                <MonitorUp size={16} color="#0B5CFF" />
                <span>You are sharing your screen: "Presentation — Q4 Strategy & Roadmap"</span>
                <button 
                  onClick={() => setIsScreenSharing(false)}
                  style={styles.stopShareBtn}
                >
                  Stop Share
                </button>
              </div>

              <div style={styles.screenContentMock}>
                <div style={styles.mockSlide}>
                  <div style={styles.slideHeader}>
                    <span style={styles.slideTitle}>Zoom Fullstack Scalability Architecture</span>
                    <span style={styles.slidePage}>Slide 4 of 12</span>
                  </div>
                  <div style={styles.slideBody}>
                    <div style={styles.diagramBox}>
                      <div style={styles.diagNode}>Next.js Client (SPA)</div>
                      <div style={styles.diagArrow}>⇄ WebSocket / REST ⇄</div>
                      <div style={styles.diagNode}>FastAPI Python Backend</div>
                      <div style={styles.diagArrow}>⇄ ORM ⇄</div>
                      <div style={styles.diagNode}>SQLite Relational DB</div>
                    </div>
                    <div style={styles.slideBullets}>
                      <div>✓ Real-time participant signaling via WebSocket manager</div>
                      <div>✓ Instant & Scheduled meeting lifecycle support</div>
                      <div>✓ Complete Zoom UI parity with high-contrast audio controls</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* REGULAR GALLERY / SPEAKER VIDEO GRID */
            <div style={{
              ...styles.galleryGrid,
              gridTemplateColumns: participants.length <= 2 ? 'repeat(auto-fit, minmax(360px, 1fr))' : 'repeat(2, 1fr)'
            }}>
              {/* Local User Tile */}
              <div style={styles.videoTile}>
                {isVideoOn ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    style={styles.videoStream}
                  />
                ) : (
                  <div style={{ ...styles.avatarTile, backgroundColor: '#0B5CFF' }}>
                    <div style={styles.avatarLetter}>
                      {displayName.split(' ').map(n => n[0]).join('')}
                    </div>
                  </div>
                )}

                <div style={styles.tileNameTag}>
                  <span style={styles.tileMicStatus}>
                    {isMuted ? <MicOff size={13} color="#E53935" /> : <Mic size={13} color="#2D8C3E" />}
                  </span>
                  <span>{displayName} (You)</span>
                </div>

                {handRaised && (
                  <div style={styles.handBadge}>
                    <Hand size={16} color="#F5A623" />
                  </div>
                )}
              </div>

              {/* Remote Participants */}
              {participants.filter(p => p.name !== displayName).map((p) => (
                <div key={p.id} style={styles.videoTile}>
                  <div style={{ ...styles.avatarTile, backgroundColor: p.avatarColor }}>
                    <div style={styles.avatarLetter}>
                      {p.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  </div>

                  <div style={styles.tileNameTag}>
                    <span style={styles.tileMicStatus}>
                      {p.isMuted ? <MicOff size={13} color="#E53935" /> : <Mic size={13} color="#2D8C3E" />}
                    </span>
                    <span>{p.name}</span>
                  </div>

                  {/* Talking active audio wave simulation */}
                  {!p.isMuted && (
                    <div style={styles.audioWaveRing} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── PARTICIPANTS PANEL ─────────────────────────────────────── */}
        {activePanel === 'participants' && (
          <aside style={styles.sidePanel}>
            <div style={styles.panelHeader}>
              <h3 style={styles.panelTitle}>Participants ({participants.length})</h3>
              <button onClick={() => setActivePanel(null)} style={styles.panelCloseBtn}>
                <X size={18} />
              </button>
            </div>

            <div style={styles.panelList}>
              {participants.map((p) => (
                <div key={p.id} style={styles.participantItem}>
                  <div style={styles.partLeft}>
                    <div style={{ ...styles.partAvatar, backgroundColor: p.avatarColor || '#0B5CFF' }}>
                      {p.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div style={styles.partInfo}>
                      <span style={styles.partName}>
                        {p.name} {p.name === displayName && '(You)'}
                      </span>
                      <span style={styles.partRole}>{p.isHost ? 'Host' : 'Participant'}</span>
                    </div>
                  </div>

                  <div style={styles.partRight}>
                    {p.isMuted ? <MicOff size={16} color="#E53935" /> : <Mic size={16} color="#747487" />}
                    {p.isVideoOn ? <Video size={16} color="#747487" /> : <VideoOff size={16} color="#E53935" />}
                    {p.name !== displayName && (
                      <button
                        onClick={() => handleRemoveParticipant(p.id, p.name)}
                        style={styles.removePartBtn}
                        title="Remove from meeting"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div style={styles.panelFooter}>
              <button onClick={handleMuteAll} style={styles.muteAllBtn}>
                Mute All
              </button>
              <button onClick={handleCopyInvite} style={styles.inviteFooterBtn}>
                Invite
              </button>
            </div>
          </aside>
        )}

        {/* ── LIVE CHAT PANEL ────────────────────────────────────────── */}
        {activePanel === 'chat' && (
          <aside style={styles.sidePanel}>
            <div style={styles.panelHeader}>
              <h3 style={styles.panelTitle}>Meeting Chat</h3>
              <button onClick={() => setActivePanel(null)} style={styles.panelCloseBtn}>
                <X size={18} />
              </button>
            </div>

            <div style={styles.chatMessagesArea}>
              {messages.map((m) => (
                <div key={m.id} style={m.isSystem ? styles.systemChatBox : styles.chatBubble}>
                  {!m.isSystem && (
                    <div style={styles.chatHeader}>
                      <span style={styles.chatSender}>{m.sender}</span>
                      <span style={styles.chatTime}>{m.time}</span>
                    </div>
                  )}
                  <p style={styles.chatText}>{m.text}</p>
                </div>
              ))}
              <div ref={chatBottomRef} />
            </div>

            <form onSubmit={handleSendMessage} style={styles.chatInputContainer}>
              <input
                type="text"
                placeholder="Type message to Everyone..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                style={styles.chatInput}
              />
              <button type="submit" style={styles.chatSendBtn} disabled={!chatInput.trim()}>
                <Send size={16} />
              </button>
            </form>
          </aside>
        )}
      </div>

      {/* ── BOTTOM MEETING CONTROLS BAR (ICONIC ZOOM TOOLBAR) ──────── */}
      <footer style={styles.controlsBar}>
        {/* Left: Audio & Video Buttons */}
        <div style={styles.controlGroupLeft}>
          <button 
            onClick={() => setIsMuted(!isMuted)}
            style={{
              ...styles.controlBtn,
              ...(isMuted ? styles.controlBtnMuted : {})
            }}
          >
            {isMuted ? <MicOff size={20} color="#E53935" /> : <Mic size={20} />}
            <span style={styles.controlLabel}>{isMuted ? 'Unmute' : 'Mute'}</span>
          </button>

          <button 
            onClick={() => setIsVideoOn(!isVideoOn)}
            style={{
              ...styles.controlBtn,
              ...(!isVideoOn ? styles.controlBtnMuted : {})
            }}
          >
            {isVideoOn ? <Video size={20} /> : <VideoOff size={20} color="#E53935" />}
            <span style={styles.controlLabel}>{isVideoOn ? 'Stop Video' : 'Start Video'}</span>
          </button>
        </div>

        {/* Center: Meeting Collaboration Tools */}
        <div style={styles.controlGroupCenter}>
          <button 
            onClick={() => togglePanel('security')}
            style={styles.controlBtn}
          >
            <Shield size={20} />
            <span style={styles.controlLabel}>Security</span>
          </button>

          <button 
            onClick={() => togglePanel('participants')}
            style={{
              ...styles.controlBtn,
              ...(activePanel === 'participants' ? styles.controlBtnActive : {})
            }}
          >
            <div style={styles.badgeWrapper}>
              <Users size={20} />
              <span style={styles.countBadge}>{participants.length}</span>
            </div>
            <span style={styles.controlLabel}>Participants</span>
          </button>

          <button 
            onClick={() => togglePanel('chat')}
            style={{
              ...styles.controlBtn,
              ...(activePanel === 'chat' ? styles.controlBtnActive : {})
            }}
          >
            <div style={styles.badgeWrapper}>
              <MessageSquare size={20} />
              {unreadChatCount > 0 && (
                <span style={styles.unreadBadge}>{unreadChatCount}</span>
              )}
            </div>
            <span style={styles.controlLabel}>Chat</span>
          </button>

          {/* Share Screen (Zoom Green) */}
          <button 
            onClick={() => setIsScreenSharing(!isScreenSharing)}
            style={styles.shareControlBtn}
          >
            <Share2 size={20} color="#2D8C3E" />
            <span style={{ ...styles.controlLabel, color: '#2D8C3E', fontWeight: '600' }}>
              {isScreenSharing ? 'Sharing' : 'Share Screen'}
            </span>
          </button>

          {/* Record */}
          <button 
            onClick={() => setIsRecording(!isRecording)}
            style={styles.controlBtn}
          >
            <Circle size={20} fill={isRecording ? '#E53935' : 'transparent'} color={isRecording ? '#E53935' : '#FFFFFF'} />
            <span style={styles.controlLabel}>{isRecording ? 'Pause REC' : 'Record'}</span>
          </button>

          {/* Emoji Reactions with Picker Popup */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              style={styles.controlBtn}
            >
              <Smile size={20} />
              <span style={styles.controlLabel}>Reactions</span>
            </button>

            {showEmojiPicker && (
              <div style={styles.emojiPickerMenu}>
                <div style={styles.emojiRow}>
                  {['👏', '👍', '❤️', '😂', '😮', '🎉'].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleSendReaction(emoji)}
                      style={styles.emojiBtn}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => {
                    setHandRaised(!handRaised);
                    setShowEmojiPicker(false);
                    triggerFloatingReaction(handRaised ? '✋ Lowered Hand' : '✋ Raised Hand', 'You');
                  }}
                  style={styles.raiseHandBtn}
                >
                  <Hand size={16} />
                  <span>{handRaised ? 'Lower Hand' : 'Raise Hand'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: End / Leave Meeting Button (Zoom Red) */}
        <div style={styles.controlGroupRight}>
          <button 
            onClick={handleEndMeeting}
            style={styles.endMeetingBtn}
          >
            End
          </button>
        </div>
      </footer>
    </div>
  );
}

export default function MeetingRoom() {
  return (
    <Suspense fallback={
      <div style={{ height: '100vh', backgroundColor: '#1B1A2E', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF' }}>
        Connecting to Meeting...
      </div>
    }>
      <MeetingRoomContent />
    </Suspense>
  );
}

const styles = {
  roomContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: '100vw',
    backgroundColor: '#1A1A1A',
    color: '#FFFFFF',
    overflow: 'hidden',
  },
  loadingScreen: {
    height: '100vh',
    backgroundColor: '#1B1A2E',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingLogo: {
    width: '70px',
    height: '70px',
    borderRadius: '20px',
    backgroundColor: '#0B5CFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 24px rgba(11, 92, 255, 0.4)',
  },
  roomHeader: {
    height: '52px',
    backgroundColor: '#1E1E1E',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px',
    borderBottom: '1px solid #2B2B2B',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  securityBadge: {
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
  },
  meetingInfoBlock: {
    display: 'flex',
    flexDirection: 'column',
  },
  roomTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#FFFFFF',
  },
  roomMetaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '11px',
    color: '#9E9E9E',
  },
  codeText: {
    fontFamily: 'monospace',
  },
  timerBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    color: '#D1D1D6',
  },
  recordingPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    color: '#E53935',
    fontWeight: '700',
    fontSize: '10px',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  inviteHeaderBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '6px',
    backgroundColor: '#2A2A2A',
    color: '#FFFFFF',
    fontSize: '12px',
    fontWeight: '500',
    border: '1px solid #3A3A3A',
    cursor: 'pointer',
  },
  viewToggleBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '6px',
    backgroundColor: '#2A2A2A',
    color: '#FFFFFF',
    fontSize: '12px',
    border: '1px solid #3A3A3A',
    cursor: 'pointer',
  },
  headerIconBtn: {
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    backgroundColor: '#2A2A2A',
    color: '#D1D1D6',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  stageWrapper: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
    position: 'relative',
  },
  videoStage: {
    flex: 1,
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  reactionsLayer: {
    position: 'absolute',
    bottom: '40px',
    left: '40px',
    pointerEvents: 'none',
    zIndex: 50,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  floatingEmojiItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: '6px 14px',
    borderRadius: '20px',
    animation: 'float 3.5s forwards ease-out',
  },
  floatingEmojiUser: {
    fontSize: '12px',
    color: '#FFFFFF',
    fontWeight: '500',
  },
  galleryGrid: {
    display: 'grid',
    gap: '16px',
    width: '100%',
    height: '100%',
    maxHeight: 'calc(100vh - 140px)',
  },
  videoTile: {
    position: 'relative',
    backgroundColor: '#242424',
    borderRadius: '12px',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid transparent',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
  },
  videoStream: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transform: 'scaleX(-1)', // Mirror local camera
  },
  avatarTile: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    width: '84px',
    height: '84px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    fontWeight: '700',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
  },
  tileNameTag: {
    position: 'absolute',
    bottom: '12px',
    left: '12px',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    backdropFilter: 'blur(4px)',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  tileMicStatus: {
    display: 'flex',
    alignItems: 'center',
  },
  handBadge: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: '6px',
    borderRadius: '50%',
  },
  audioWaveRing: {
    position: 'absolute',
    inset: 0,
    border: '2px solid #2D8C3E',
    borderRadius: '12px',
    pointerEvents: 'none',
  },
  screenShareStage: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#0F111A',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  shareBanner: {
    backgroundColor: '#1E2230',
    padding: '8px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '13px',
    color: '#FFFFFF',
    borderBottom: '1px solid #2D334A',
  },
  stopShareBtn: {
    backgroundColor: '#E53935',
    color: '#FFFFFF',
    padding: '4px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
  },
  screenContentMock: {
    flex: 1,
    padding: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mockSlide: {
    width: '100%',
    maxWidth: '850px',
    backgroundColor: '#161926',
    borderRadius: '12px',
    border: '1px solid #2C3249',
    padding: '24px 32px',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
  },
  slideHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    borderBottom: '1px solid #2C3249',
    paddingBottom: '12px',
    marginBottom: '20px',
  },
  slideTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#0B5CFF',
  },
  slidePage: {
    fontSize: '12px',
    color: '#8E94AA',
  },
  slideBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  diagramBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '20px',
    backgroundColor: '#0F111A',
    borderRadius: '8px',
    border: '1px dashed #3B4261',
  },
  diagNode: {
    padding: '8px 14px',
    backgroundColor: '#0B5CFF',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
  },
  diagArrow: {
    fontSize: '11px',
    color: '#8E94AA',
  },
  slideBullets: {
    fontSize: '13px',
    color: '#D1D5DB',
    lineHeight: '2',
  },
  sidePanel: {
    width: '340px',
    backgroundColor: '#FFFFFF',
    color: '#232333',
    display: 'flex',
    flexDirection: 'column',
    borderLeft: '1px solid #E5E5EA',
  },
  panelHeader: {
    height: '52px',
    padding: '0 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid #E5E5EA',
  },
  panelTitle: {
    fontSize: '15px',
    fontWeight: '600',
  },
  panelCloseBtn: {
    color: '#747487',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
  },
  panelList: {
    flex: 1,
    overflowY: 'auto',
    padding: '12px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  participantItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  partLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  partAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: '700',
  },
  partInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  partName: {
    fontSize: '13px',
    fontWeight: '600',
  },
  partRole: {
    fontSize: '11px',
    color: '#747487',
  },
  partRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  removePartBtn: {
    fontSize: '11px',
    color: '#E53935',
    border: '1px solid #FFCDD2',
    backgroundColor: '#FDEDED',
    padding: '2px 6px',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  panelFooter: {
    padding: '12px 16px',
    borderTop: '1px solid #E5E5EA',
    display: 'flex',
    gap: '8px',
  },
  muteAllBtn: {
    flex: 1,
    padding: '8px',
    borderRadius: '6px',
    backgroundColor: '#F3F4F6',
    border: '1px solid #E5E7EB',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  inviteFooterBtn: {
    padding: '8px 16px',
    borderRadius: '6px',
    backgroundColor: '#0B5CFF',
    color: '#FFFFFF',
    border: 'none',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  chatMessagesArea: {
    flex: 1,
    padding: '16px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  chatBubble: {
    backgroundColor: '#F7F8FA',
    borderRadius: '8px',
    padding: '8px 12px',
    border: '1px solid #EFEFEF',
  },
  systemChatBox: {
    backgroundColor: '#E8F0FE',
    color: '#0B5CFF',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '12px',
    textAlign: 'center',
  },
  chatHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '3px',
  },
  chatSender: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#0B5CFF',
  },
  chatTime: {
    fontSize: '10px',
    color: '#A0A0B8',
  },
  chatText: {
    fontSize: '13px',
    color: '#232333',
    lineHeight: '1.4',
  },
  chatInputContainer: {
    display: 'flex',
    padding: '12px 16px',
    borderTop: '1px solid #E5E5EA',
    gap: '8px',
  },
  chatInput: {
    flex: 1,
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #D1D5DB',
    fontSize: '13px',
  },
  chatSendBtn: {
    backgroundColor: '#0B5CFF',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    width: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  controlsBar: {
    height: '74px',
    backgroundColor: '#1E1E1E',
    borderTop: '1px solid #2B2B2B',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    zIndex: 90,
  },
  controlGroupLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  controlGroupCenter: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  controlGroupRight: {
    display: 'flex',
    alignItems: 'center',
  },
  controlBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    minWidth: '60px',
    height: '56px',
    padding: '4px 8px',
    borderRadius: '8px',
    color: '#FFFFFF',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  },
  controlBtnMuted: {
    color: '#E53935',
  },
  controlBtnActive: {
    backgroundColor: '#2D2D2D',
  },
  shareControlBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    minWidth: '70px',
    height: '56px',
    padding: '4px 8px',
    borderRadius: '8px',
    backgroundColor: 'rgba(45, 140, 62, 0.15)',
    border: '1px solid rgba(45, 140, 62, 0.3)',
    cursor: 'pointer',
  },
  controlLabel: {
    fontSize: '11px',
    fontWeight: '500',
    color: '#D1D1D6',
  },
  badgeWrapper: {
    position: 'relative',
  },
  countBadge: {
    position: 'absolute',
    top: '-6px',
    right: '-10px',
    backgroundColor: '#0B5CFF',
    color: '#FFFFFF',
    fontSize: '10px',
    fontWeight: '700',
    padding: '1px 5px',
    borderRadius: '8px',
  },
  unreadBadge: {
    position: 'absolute',
    top: '-6px',
    right: '-10px',
    backgroundColor: '#E53935',
    color: '#FFFFFF',
    fontSize: '10px',
    fontWeight: '700',
    padding: '1px 5px',
    borderRadius: '8px',
  },
  emojiPickerMenu: {
    position: 'absolute',
    bottom: '70px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#2A2A2A',
    borderRadius: '12px',
    padding: '12px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
    border: '1px solid #3A3A3A',
    zIndex: 100,
    width: '260px',
  },
  emojiRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px',
  },
  emojiBtn: {
    fontSize: '22px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '6px',
    transition: 'transform 0.1s ease',
  },
  raiseHandBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '8px',
    borderRadius: '6px',
    backgroundColor: '#383838',
    color: '#FFFFFF',
    fontSize: '12px',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
  },
  endMeetingBtn: {
    backgroundColor: '#E53935',
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: '13px',
    padding: '8px 20px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(229, 57, 53, 0.3)',
  },
};
