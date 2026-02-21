
import React from 'react';
import { VoiceOption } from '../types';

interface VoiceCardProps {
  voice: VoiceOption;
  selected: boolean;
  onClick: () => void;
}

export const VoiceCard: React.FC<VoiceCardProps> = ({ voice, selected, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-xl border transition-all text-left flex flex-col gap-1 w-full ${
        selected
          ? 'bg-blue-600/10 border-blue-500 ring-2 ring-blue-500/20'
          : 'bg-zinc-900 border-zinc-800 hover:border-zinc-600'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="font-bold text-lg">{voice.name}</span>
        <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${
          voice.gender === 'Female' ? 'bg-pink-500/20 text-pink-300' : 
          voice.gender === 'Male' ? 'bg-blue-500/20 text-blue-300' : 'bg-zinc-700 text-zinc-300'
        }`}>
          {voice.gender}
        </span>
      </div>
      <p className="text-zinc-400 text-sm leading-tight">{voice.description}</p>
    </button>
  );
};
