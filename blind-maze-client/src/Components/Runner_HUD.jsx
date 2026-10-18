import React from 'react';
import VoiceChat from './VoiceChat';

export default function RunnerHUD({ roomId, role, socket }) {
  return (
    <div className="absolute inset-0 z-10 w-full h-full flex flex-col justify-between p-6 md:p-8 pointer-events-none">
      
      {/* --- الشريط العلوي --- */}
      <div className="w-full flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-3.5 px-4 py-2 rounded-xl bg-gray-900/80 backdrop-blur-md shadow-lg border border-white/10">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5 tracking-wider font-bold text-lg uppercase text-white">
              <span>FOREST</span>
              <span className="text-emerald-400">MAZE</span>
            </div>
            <span className="text-[10px] text-gray-300 tracking-[0.2em] -mt-1">DAYLIGHT EDITION</span>
          </div>
        </div>

        {/* --- أداة الدردشة الصوتية --- */}
        <VoiceChat socket={socket} roomId={roomId} role={role} />

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gray-900/80 backdrop-blur-md shadow-sm text-white border border-white/10">
            <span className="text-xs text-gray-400">ROOM</span>
            <span className="font-mono text-sm tracking-widest font-bold text-emerald-400">{roomId}</span>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 backdrop-blur-md border border-emerald-500/40">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span className="text-xs text-emerald-300 tracking-wider uppercase font-bold">
              {role === 'Guide' ? 'The Guide' : 'The Runner'}
            </span>
          </div>
        </div>
      </div>

      {/* --- الشريط السفلي --- */}
      <div className="w-full flex items-end justify-between gap-4 pointer-events-auto">
        <div className="p-4 rounded-xl bg-gray-900/80 backdrop-blur-md shadow-2xl border border-white/10 max-w-sm text-white">
          <span className="text-[11px] text-emerald-400 tracking-widest font-bold uppercase">Current Objective</span>
          <div className="text-sm font-semibold text-white mt-0.5">
            Find the Glowing Green Portal
          </div>
          <div className="text-xs text-gray-300 mt-1">
            Use Arrow Keys or W,A,S,D to run and talk to your partner via Voice Chat!
          </div>
        </div>
      </div>
    </div>
  );
}