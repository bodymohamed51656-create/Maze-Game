import React, { useEffect, useRef, useState } from 'react';

export default function VoiceChat({ socket, roomId, role }) {
  const [isMuted, setIsMuted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const audioRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);

  const rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  useEffect(() => {
    let isMounted = true;

    async function initAudio() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        if (!isMounted) return;
        localStreamRef.current = stream;

        const pc = new RTCPeerConnection(rtcConfig);
        peerConnectionRef.current = pc;

        stream.getTracks().forEach(track => pc.addTrack(track, stream));

        pc.ontrack = (event) => {
          if (audioRef.current && event.streams[0]) {
            audioRef.current.srcObject = event.streams[0];
            audioRef.current.play().catch(e => console.log("Audio play error:", e));
            if (isMounted) setIsConnected(true);
          }
        };

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit('ice_candidate', { roomId, candidate: event.candidate });
          }
        };

        socket.on('voice_offer', async (offer) => {
          if (!peerConnectionRef.current) return;
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await peerConnectionRef.current.createAnswer();
          await peerConnectionRef.current.setLocalDescription(answer);
          socket.emit('voice_answer', { roomId, answer });
          if (isMounted) setIsConnected(true);
        });

        socket.on('voice_answer', async (answer) => {
          if (!peerConnectionRef.current) return;
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
          if (isMounted) setIsConnected(true);
        });

        socket.on('ice_candidate', async (candidate) => {
          if (!peerConnectionRef.current) return;
          try {
            await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (e) {
            console.error('ICE Error:', e);
          }
        });

        socket.on('voice_ready', async () => {
          if (role === 'Runner' && peerConnectionRef.current) {
            const offer = await peerConnectionRef.current.createOffer();
            await peerConnectionRef.current.setLocalDescription(offer);
            socket.emit('voice_offer', { roomId, offer });
          }
        });

        socket.emit('voice_ready', { roomId });

        if (role === 'Runner') {
          setTimeout(async () => {
            if (peerConnectionRef.current && peerConnectionRef.current.signalingState === 'stable') {
              const offer = await peerConnectionRef.current.createOffer();
              await peerConnectionRef.current.setLocalDescription(offer);
              socket.emit('voice_offer', { roomId, offer });
            }
          }, 1000);
        }

      } catch (err) {
        console.error('Microphone error:', err);
      }
    }

    initAudio();

    return () => {
      isMounted = false;
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      socket.off('voice_ready');
      socket.off('voice_offer');
      socket.off('voice_answer');
      socket.off('ice_candidate');
    };
  }, [socket, roomId, role]);

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  return (
    <div className="flex items-center gap-2 bg-gray-900/90 px-3 py-1.5 rounded-full border border-white/10 shadow-lg pointer-events-auto">
      <audio ref={audioRef} autoPlay playsInline />
      <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
      <span className="text-xs text-gray-300 font-medium">
        {isConnected ? 'VOICE: LIVE' : 'CONNECTING MIC...'}
      </span>
      <button 
        onClick={toggleMute} 
        className={`ml-2 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
          isMuted ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-gray-800 hover:bg-gray-700 text-emerald-400'
        }`}
      >
        {isMuted ? 'UNMUTE' : 'MUTE'}
      </button>
    </div>
  );
}