
export enum VoiceName {
  Kore = 'Kore',
  Puck = 'Puck',
  Charon = 'Charon',
  Fenrir = 'Fenrir',
  Zephyr = 'Zephyr',
}

export interface VoiceOption {
  id: VoiceName;
  name: string;
  gender: 'Male' | 'Female' | 'Neutral';
  description: string;
}

export interface SpeakerConfig {
  speakerName: string;
  voice: VoiceName;
}

export enum AppMode {
  SINGLE = 'single',
  MULTI = 'multi',
  MIRROR = 'mirror',
}

export interface LanguageOption {
  id: string;
  name: string;
  nativeName: string;
  script: string;
}
