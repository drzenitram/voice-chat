import React, { useState, useEffect, useRef, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { 
  getFirestore, doc, setDoc, onSnapshot, collection, addDoc, 
  deleteDoc, updateDoc 
} from 'firebase/firestore';
import { Mic, MicOff, Users, Radio, Key, LogOut, AlertTriangle, ShieldCheck, MessageSquare, Send, X, Trash2, UserX, Pin } from 'lucide-react';
import './App.css';

const firebaseConfig = {
  apiKey: "AIzaSyA2bLmRQtMYx-fxr2ZAo3oAaCEGPczsUSM",
  authDomain: "voicechatapp-d00e3.firebaseapp.com",
  projectId: "voicechatapp-d00e3",
  storageBucket: "voicechatapp-d00e3.firebasestorage.app",
  messagingSenderId: "364793432621",
  appId: "1:364793432621:web:529f72be4e38ca55c9c6a4",
  measurementId: "G-HQV3SGVNJF"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const rtcConfig = {
  iceServers: [
    { urls: "stun:stun.relay.metered.ca:80" },
    {
      urls: "turn:standard.relay.metered.ca:80",
      username: "9842b3e0331fb4d6a1f78a50",
      credential: "Qy0V+KQdzK/jzLC7",
    },
    {
      urls: "turn:standard.relay.metered.ca:80?transport=tcp",
      username: "9842b3e0331fb4d6a1f78a50",
      credential: "Qy0V+KQdzK/jzLC7",
    },
    {
      urls: "turn:standard.relay.metered.ca:443",
      username: "9842b3e0331fb4d6a1f78a50",
      credential: "Qy0V+KQdzK/jzLC7",
    },
    {
      urls: "turns:standard.relay.metered.ca:443?transport=tcp",
      username: "9842b3e0331fb4d6a1f78a50",
      credential: "Qy0V+KQdzK/jzLC7",
    },
  ]
};

export default function App() {
  const [user, setUser] = useState(null);
  const [roomCode, setRoomCode] = useState('');
  const [username, setUsername] = useState('');
  const [isInRoom, setIsInRoom] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (err) {
        console.error("Auth Error:", err);
      }
    };
    initAuth();
    
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  const handleJoin = (e) => {
    e.preventDefault();
    if (!username.trim() || !roomCode.trim()) {
      setError("Username and Room Code are required.");
      return;
    }
    if (roomCode.length < 4) {
      setError("Room Code must be at least 4 characters for security.");
      return;
    }
    setError('');
    setIsInRoom(true);
  };

  if (!user) {
    return (
      <div className="min-h-[100dvh] bg-slate-950 text-slate-200 flex items-center justify-center font-sans p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="animate-pulse text-indigo-400 font-semibold text-center text-sm">Establishing Secure Connection...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      {!isInRoom ? (
        <Lobby 
          username={username} setUsername={setUsername} 
          roomCode={roomCode} setRoomCode={setRoomCode} 
          handleJoin={handleJoin} error={error} 
        />
      ) : (
        <VoiceRoom 
          user={user} username={username} roomCode={roomCode} 
          onLeave={() => setIsInRoom(false)} 
        />
      )}
    </div>
  );
}

function Lobby({ username, setUsername, roomCode, setRoomCode, handleJoin, error }) {
  return (
    <div className="flex items-center justify-center min-h-[100dvh] p-4">
      <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl"></div>

        <div className="relative z-10 text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-800/80 text-indigo-400 mb-3 sm:mb-4 ring-1 ring-slate-700 shadow-lg shadow-indigo-500/10">
            <ShieldCheck size={30} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2 tracking-tight">Secure Voice</h1>
          <p className="text-slate-400 text-xs sm:text-sm">Peer-to-peer encrypted communications</p>
        </div>

        <form onSubmit={handleJoin} className="space-y-4 sm:space-y-5 relative z-10">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs sm:text-sm p-3 rounded-lg flex items-center justify-center gap-2">
              <AlertTriangle size={16} /> {error}
            </div>
          )}
          
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Display Name</label>
            <input 
              type="text" 
              maxLength={16}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
              placeholder="e.g. Commander"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Shared Room Code</label>
            <div className="relative">
              <input 
                type="text" 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all uppercase tracking-widest font-mono text-sm"
                placeholder="SECRET-KEY-123"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              />
              <Key size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">Only users with this exact code can join.</p>
          </div>
          
          <button 
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.2)] hover:shadow-[0_0_25px_rgba(79,70,229,0.4)] active:scale-[0.98] text-sm"
          >
            Connect to Node
          </button>
        </form>
      </div>
    </div>
  );
}

function VoiceRoom({ user, username, roomCode, onLeave }) {
  const [participants, setParticipants] = useState({});
  const [isMuted, setIsMuted] = useState(false);
  const [isPTT, setIsPTT] = useState(false);
  const [isHoldingPTT, setIsHoldingPTT] = useState(false);
  const [mediaError, setMediaError] = useState('');
  
  const localStream = useRef(null);
  const remoteStreams = useRef({}); 
  const [, setRenderTrigger] = useState(0); 
  
  const pcs = useRef({}); 
  const iceQueues = useRef({}); 
  const joinTimestamp = useRef(Date.now());
  const hasJoinedPresence = useRef(false);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(true);

  const usersCollectionPath = `rooms/${roomCode}/users`;
  const signalsCollectionPath = `rooms/${roomCode}/signals`;
  const messagesCollectionPath = `rooms/${roomCode}/messages`;

  useEffect(() => {
    if (!user) return;

    const messagesRef = collection(db, messagesCollectionPath);
    const unsubMessages = onSnapshot(messagesRef, (snapshot) => {
      const chatList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      chatList.sort((a, b) => a.timestamp - b.timestamp);
      setMessages(chatList);
    });

    return () => unsubMessages();
  }, [user, roomCode, messagesCollectionPath]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const textToSend = newMessage.trim();
    setNewMessage('');

    await addDoc(collection(db, messagesCollectionPath), {
      senderUid: user.uid,
      username,
      text: textToSend,
      timestamp: Date.now(),
      pinned: false
    });
  };

  const handleDeleteMessage = async (msgId) => {
    const pwd = prompt("Enter admin password to delete message:");
    if (pwd === "admin") {
      await deleteDoc(doc(db, messagesCollectionPath, msgId)).catch((err) => console.error(err));
    } else if (pwd !== null) {
      alert("Incorrect password!");
    }
  };

  const handleTogglePin = async (msgId, currentPinnedState) => {
    const pwd = prompt(`Enter admin password to ${currentPinnedState ? 'unpin' : 'pin'} message:`);
    if (pwd === "admin") {
      await updateDoc(doc(db, messagesCollectionPath, msgId), {
        pinned: !currentPinnedState
      }).catch((err) => console.error(err));
    } else if (pwd !== null) {
      alert("Incorrect password!");
    }
  };

  const handleRemoveUser = async (targetUid) => {
    if (targetUid === user.uid) return;
    const pwd = prompt("Enter admin password to disconnect user:");
    if (pwd === "admin") {
      await deleteDoc(doc(db, usersCollectionPath, targetUid)).catch((err) => console.error(err));
    } else if (pwd !== null) {
      alert("Incorrect password!");
    }
  };

  useEffect(() => {
    let active = true;

    const setupMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        if (!active) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        localStream.current = stream;
        updateAudioTrackState();
        setRenderTrigger(prev => prev + 1);
        await joinRoomPresence();
      } catch (err) {
        console.error("Microphone Access Error:", err);
        setMediaError("Microphone access denied. Please allow permissions in your browser.");
      }
    };

    const joinRoomPresence = async () => {
      if (!user) return;
      const userRef = doc(db, usersCollectionPath, user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        username,
        joinedAt: Date.now()
      });
      hasJoinedPresence.current = true;
    };

    setupMedia();

    const cleanup = async () => {
      active = false;
      if (localStream.current) {
        localStream.current.getTracks().forEach(t => t.stop());
      }
      Object.values(pcs.current).forEach(pc => pc.close());
      if (user) {
        const userRef = doc(db, usersCollectionPath, user.uid);
        await deleteDoc(userRef).catch(() => {});
      }
    };

    window.addEventListener('beforeunload', cleanup);
    return () => {
      window.removeEventListener('beforeunload', cleanup);
      cleanup();
    };
  }, [user, roomCode, username, usersCollectionPath]);

  const updateAudioTrackState = useCallback(() => {
    if (!localStream.current) return;
    const audioTrack = localStream.current.getAudioTracks()[0];
    if (!audioTrack) return;

    if (isMuted) {
      audioTrack.enabled = false;
    } else if (isPTT) {
      audioTrack.enabled = isHoldingPTT;
    } else {
      audioTrack.enabled = true;
    }
  }, [isMuted, isPTT, isHoldingPTT]);

  useEffect(() => {
    updateAudioTrackState();
  }, [updateAudioTrackState]);

  useEffect(() => {
    if (!isPTT) return;

    const handleKeyDown = (e) => {
      if (e.code === 'Space' && !e.repeat) {
        if(document.activeElement?.tagName === 'INPUT') return;
        e.preventDefault();
        setIsHoldingPTT(true);
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsHoldingPTT(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPTT]);

  const sendSignal = async (targetUid, type, data) => {
    const signalsRef = collection(db, signalsCollectionPath);
    await addDoc(signalsRef, {
      sender: user.uid,
      target: targetUid,
      type,
      data,
      timestamp: Date.now()
    });
  };

  const getOrCreatePC = (targetUid) => {
    if (pcs.current[targetUid]) return pcs.current[targetUid];

    const pc = new RTCPeerConnection(rtcConfig);
    pcs.current[targetUid] = pc;

    if (localStream.current) {
      localStream.current.getTracks().forEach(track => {
        pc.addTrack(track, localStream.current);
      });
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal(targetUid, 'ice', JSON.parse(JSON.stringify(event.candidate)));
      }
    };

    pc.ontrack = (event) => {
      remoteStreams.current[targetUid] = event.streams[0];
      setRenderTrigger(prev => prev + 1);
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        delete remoteStreams.current[targetUid];
        setRenderTrigger(prev => prev + 1);
      }
    };

    return pc;
  };

  useEffect(() => {
    if (!user) return;

    const usersRef = collection(db, usersCollectionPath);
    const unsubUsers = onSnapshot(usersRef, (snapshot) => {
      const activeUsers = {};
      let amIInList = false;

      snapshot.docs.forEach(docSnap => {
        const data = docSnap.data();
        activeUsers[data.uid] = data;
        if (data.uid === user.uid) amIInList = true;
        
        if (data.uid !== user.uid && user.uid > data.uid && !pcs.current[data.uid]) {
          initiateOffer(data.uid);
        }
      });
      
      if (hasJoinedPresence.current && !amIInList) {
        onLeave();
        return;
      }

      Object.keys(pcs.current).forEach(uid => {
        if (!activeUsers[uid]) {
          pcs.current[uid].close();
          delete pcs.current[uid];
          delete remoteStreams.current[uid];
          setRenderTrigger(prev => prev + 1);
        }
      });
      
      setParticipants(activeUsers);
    }, (error) => console.error("Presence Error:", error));

    const signalsRef = collection(db, signalsCollectionPath);
    const unsubSignals = onSnapshot(signalsRef, async (snapshot) => {
      for (const change of snapshot.docChanges()) {
        if (change.type === 'added') {
          const signal = change.doc.data();
          if (signal.target === user.uid && signal.timestamp > joinTimestamp.current) {
            await handleSignal(signal.sender, signal.type, signal.data);
          }
        }
      }
    }, (error) => console.error("Signal Error:", error));

    return () => {
      unsubUsers();
      unsubSignals();
    };
  }, [user, usersCollectionPath, signalsCollectionPath, onLeave]);

  const initiateOffer = async (targetUid) => {
    try {
      const pc = getOrCreatePC(targetUid);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await sendSignal(targetUid, 'offer', { type: offer.type, sdp: offer.sdp });
    } catch (err) {
      console.error("Offer Error:", err);
    }
  };

  const handleSignal = async (senderUid, type, data) => {
    try {
      const pc = getOrCreatePC(senderUid);

      if (type === 'offer') {
        await pc.setRemoteDescription(new RTCSessionDescription(data));
        
        if (iceQueues.current[senderUid]) {
          for (const candidate of iceQueues.current[senderUid]) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(e=>console.warn(e));
          }
          iceQueues.current[senderUid] = [];
        }

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await sendSignal(senderUid, 'answer', { type: answer.type, sdp: answer.sdp });
        
      } else if (type === 'answer') {
        await pc.setRemoteDescription(new RTCSessionDescription(data));
        
      } else if (type === 'ice') {
        if (pc.remoteDescription) {
          await pc.addIceCandidate(new RTCIceCandidate(data)).catch(e=>console.warn(e));
        } else {
          if (!iceQueues.current[senderUid]) iceQueues.current[senderUid] = [];
          iceQueues.current[senderUid].push(data);
        }
      }
    } catch (err) {
      console.error("Signal Handling Error:", err);
    }
  };

  if (mediaError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] p-6 text-center bg-slate-950">
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-6 rounded-2xl max-w-lg shadow-xl w-full">
          <MicOff size={48} className="mx-auto mb-4 opacity-80" />
          <h2 className="text-xl font-bold mb-2">Hardware Error</h2>
          <p className="text-sm opacity-90">{mediaError}</p>
          <button 
            onClick={onLeave}
            className="mt-6 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors border border-slate-700 font-medium text-sm w-full sm:w-auto"
          >
            Return to Menu
          </button>
        </div>
      </div>
    );
  }

  const activeParticipantCount = Object.keys(participants).length;
  const pinnedMessages = messages.filter(m => m.pinned);

  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden max-w-7xl mx-auto bg-slate-950">
      <header className="flex-none p-3 sm:p-5 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md z-10">
        <div className="flex items-center gap-2 sm:gap-4">
          <div>
            <h2 className="text-base sm:text-xl font-bold text-white flex items-center gap-1.5 sm:gap-2 tracking-tight">
              <Radio className="text-emerald-400 shrink-0" size={18} /> 
              <span className="truncate">Secure Channel</span>
            </h2>
            <p className="text-slate-400 text-xs mt-0.5 flex items-center gap-1">
              <Key size={12} /> <span className="font-mono text-indigo-300">{roomCode}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl transition-all border text-xs sm:text-sm font-medium ${
              isChatOpen 
                ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30' 
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            <MessageSquare size={16} />
            <span className="hidden sm:inline">Chat</span>
            {messages.length > 0 && (
              <span className="bg-indigo-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {messages.length}
              </span>
            )}
          </button>
          
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-4 sm:py-2 bg-slate-900 border border-slate-800 rounded-xl">
            <Users size={15} className="text-slate-400" />
            <span className="text-xs sm:text-sm font-medium">
              <span className={activeParticipantCount === 5 ? "text-amber-400" : "text-white"}>{activeParticipantCount}</span>
              <span className="text-slate-500">/5</span>
            </span>
          </div>

          <button 
            onClick={onLeave}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-900 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all border border-slate-800 hover:border-red-500/30 text-xs sm:text-sm font-medium text-slate-300"
          >
            <LogOut size={16} /> <span className="hidden sm:inline">Disconnect</span>
          </button>
        </div>
      </header>

      <div className="flex-grow flex overflow-hidden relative">
        <main className="flex-grow p-3 sm:p-6 overflow-y-auto flex items-center justify-center">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6 w-full max-w-6xl">
            {Object.values(participants).map(p => (
              <UserAvatar 
                key={p.uid} 
                user={p} 
                isMe={p.uid === user.uid} 
                stream={p.uid === user.uid ? localStream.current : remoteStreams.current[p.uid]}
                onRemove={() => handleRemoveUser(p.uid)}
              />
            ))}
            {Array.from({ length: Math.max(0, 5 - activeParticipantCount) }).map((_, i) => (
              <div key={`empty-${i}`} className="border border-dashed border-slate-800/80 rounded-2xl flex flex-col items-center justify-center min-h-[140px] sm:min-h-[200px] bg-slate-900/10 opacity-40">
                <Users size={20} className="text-slate-700 mb-1.5" />
                <span className="text-slate-600 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Awaiting User</span>
              </div>
            ))}
          </div>
        </main>

        {isChatOpen && (
          <aside className="absolute inset-0 sm:relative sm:inset-auto sm:w-80 border-l border-slate-800 bg-slate-950/95 sm:bg-slate-900/80 flex flex-col justify-between backdrop-blur-lg z-30">
            <div className="p-3.5 border-b border-slate-800 font-bold text-white flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm"><MessageSquare size={16}/> Room Chat</span>
              <button onClick={() => setIsChatOpen(false)} className="p-1 text-slate-400 hover:text-white rounded-lg">
                <X size={18} />
              </button>
            </div>

{/* Pinned Messages Container */}
            {pinnedMessages.length > 0 && (
              <div className="p-2.5 px-3.5 bg-indigo-950/60 border-b border-indigo-500/30 flex flex-col gap-2 max-h-48 overflow-y-auto">
                <span className="text-[10px] font-bold text-indigo-400 flex items-center gap-1 uppercase tracking-wider sticky top-0 bg-indigo-950/90 py-0.5 z-10">
                  <Pin size={12} /> Pinned Messages ({pinnedMessages.length})
                </span>
                {pinnedMessages.map((pm) => (
                  <div key={`pinned-${pm.id}`} className="flex items-start justify-between gap-2 text-xs bg-indigo-900/40 p-2 rounded-lg border border-indigo-500/20">
                    <div className="overflow-hidden flex-grow">
                      <span className="text-[10px] text-indigo-300 font-semibold block mb-0.5">{pm.username}</span>
                      <p className="text-slate-200 font-medium break-words whitespace-pre-wrap">{pm.text}</p>
                    </div>
                    <button 
                      onClick={() => handleTogglePin(pm.id, true)} 
                      className="text-slate-400 hover:text-red-400 p-0.5 shrink-0 transition-colors" 
                      title="Unpin message (Admin)"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex-grow p-4 overflow-y-auto space-y-3">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-600 text-xs italic">
                  No messages yet. Say hello!
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={`flex flex-col group ${msg.senderUid === user.uid ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-1.5 px-1">
                      <span className="text-[10px] text-slate-500 font-medium">{msg.username}</span>
                      <button 
                        onClick={() => handleTogglePin(msg.id, msg.pinned)}
                        className={`transition-opacity p-0.5 ${msg.pinned ? 'text-indigo-400 opacity-100' : 'opacity-0 group-hover:opacity-100 text-slate-600 hover:text-indigo-400'}`}
                        title={msg.pinned ? "Unpin message (Admin)" : "Pin message (Admin)"}
                      >
                        <Pin size={12} />
                      </button>
                      <button 
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-opacity p-0.5"
                        title="Delete message (Requires Admin Password)"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <div className={`mt-0.5 px-3 py-2 rounded-xl text-xs sm:text-sm max-w-[85%] break-words ${
                      msg.senderUid === user.uid 
                        ? 'bg-indigo-600 text-white rounded-br-none' 
                        : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 flex gap-2 bg-slate-900/50">
              <input 
                type="text"
                placeholder="Send a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-grow bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button type="submit" className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors">
                <Send size={16} />
              </button>
            </form>
          </aside>
        )}
      </div>

      <footer className="flex-none p-3 sm:p-5 border-t border-slate-800 bg-slate-900/80 backdrop-blur-lg z-10">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-6">
          <div className="flex items-center justify-between w-full sm:w-auto gap-3">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className={`flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full transition-all shadow-lg shrink-0 ${
                isMuted 
                  ? 'bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20' 
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
              }`}
              title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
            >
              {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
            </button>

            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 shadow-inner flex-grow sm:flex-grow-0">
              <button 
                onClick={() => setIsPTT(false)}
                className={`flex-1 px-3 py-2 rounded-lg text-[10px] sm:text-xs font-semibold uppercase tracking-wider transition-all ${!isPTT ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Voice Activated Mic
              </button>
              <button 
                onClick={() => setIsPTT(true)}
                className={`flex-1 px-3 py-2 rounded-lg text-[10px] sm:text-xs font-semibold uppercase tracking-wider transition-all ${isPTT ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Push-to-Talk
              </button>
            </div>
          </div>

          <div className="w-full sm:w-auto flex justify-center">
            {isPTT ? (
              <button 
                className={`w-full sm:w-auto px-6 py-3.5 sm:px-10 sm:py-4 rounded-xl sm:rounded-2xl font-bold tracking-widest text-xs sm:text-sm uppercase transition-all select-none touch-none flex items-center justify-center gap-2 sm:gap-3 ${
                  isHoldingPTT 
                    ? 'bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)] scale-[1.02]' 
                    : 'bg-slate-900 border-2 border-slate-800 text-slate-400 active:border-slate-700'
                }`}
                onMouseDown={() => setIsHoldingPTT(true)}
                onMouseUp={() => setIsHoldingPTT(false)}
                onMouseLeave={() => setIsHoldingPTT(false)}
                onTouchStart={(e) => { e.preventDefault(); setIsHoldingPTT(true); }}
                onTouchEnd={(e) => { e.preventDefault(); setIsHoldingPTT(false); }}
              >
                <Radio size={16} className={isHoldingPTT ? 'animate-pulse' : ''}/>
                {isHoldingPTT ? 'Transmitting...' : 'Press & Hold to Talk'}
              </button>
            ) : (
              <div className="w-full sm:w-auto px-4 py-2.5 sm:px-10 sm:py-4 flex items-center justify-center gap-2 text-slate-500 text-[11px] sm:text-xs font-semibold uppercase tracking-widest bg-slate-900/50 rounded-xl sm:rounded-2xl border border-slate-800/50">
                <Mic size={15} /> Voice Activated Mic
              </div>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

function UserAvatar({ user, isMe, stream, onRemove }) {
  const [volumeLevel, setVolumeLevel] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!stream || stream.getAudioTracks().length === 0) return;

    if (!isMe && audioRef.current) {
      audioRef.current.srcObject = stream;
    }

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    let audioCtx, analyser, source, animationId;

    try {
      audioCtx = new AudioContext();
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.4;
      
      source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const checkVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        
        const normalized = Math.min(1, Math.max(0, (average - 15) / 50));
        setVolumeLevel(normalized);
        
        animationId = requestAnimationFrame(checkVolume);
      };

      checkVolume();

    } catch (err) {
      console.warn("Audio Context init error for indicator:", err);
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      if (source) source.disconnect();
      if (audioCtx && audioCtx.state !== 'closed') audioCtx.close();
    };
  }, [stream, isMe]);

  const isSpeaking = volumeLevel > 0.1;
  const initial = user.username.charAt(0).toUpperCase();

  return (
    <div className="flex flex-col items-center justify-center p-3 sm:p-6 bg-slate-900/80 rounded-2xl border border-slate-800 transition-all duration-300 relative group min-h-[140px] sm:min-h-[200px] shadow-xl overflow-hidden backdrop-blur-sm">
      {!isMe && <audio ref={audioRef} autoPlay playsInline hidden />}

      {!isMe && (
        <button 
          onClick={onRemove}
          className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/10 text-red-400 opacity-80 sm:opacity-0 group-hover:opacity-100 hover:bg-red-500/20 border border-red-500/20 transition-all z-20"
          title="Remove user from room (Requires Admin Password)"
        >
          <UserX size={14} />
        </button>
      )}

      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-150"
        style={{
          background: isSpeaking ? `radial-gradient(circle at center, rgba(16, 185, 129, ${volumeLevel * 0.2}) 0%, transparent 70%)` : 'transparent',
          opacity: isSpeaking ? 1 : 0
        }}
      />
      
      <div 
        className="absolute inset-0 rounded-2xl pointer-events-none transition-all duration-150"
        style={{
          border: isSpeaking ? `2px solid rgba(16, 185, 129, ${0.4 + volumeLevel * 0.6})` : '2px solid transparent'
        }}
      />

      <div className="relative mb-2 sm:mb-4">
        <div 
          className="w-14 h-14 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold bg-slate-800 text-white relative z-10 transition-transform duration-100 shadow-inner"
          style={{
            transform: isSpeaking ? `scale(${1 + volumeLevel * 0.12})` : 'scale(1)',
          }}
        >
          {initial}
        </div>
        <div className={`absolute inset-0 rounded-full border-2 transition-colors duration-200 ${isSpeaking ? 'border-emerald-500' : 'border-slate-700/50'}`}></div>
      </div>

      <span className="font-semibold text-white tracking-wide text-center truncate w-full px-1 text-xs sm:text-base">
        {user.username} 
      </span>
      {isMe && <span className="text-indigo-400 text-[10px] font-semibold uppercase tracking-wider mt-0.5">You</span>}
      
      <div className={`mt-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full transition-colors ${isSpeaking ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-950 text-slate-500'}`}>
        <div className={`w-1.5 h-1.5 rounded-full ${isSpeaking ? 'bg-emerald-400 animate-pulse' : 'bg-slate-700'}`}></div>
        {isSpeaking ? 'Active' : 'Standby'}
      </div>
    </div>
  );
}