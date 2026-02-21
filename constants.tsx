
import { VoiceName, VoiceOption, LanguageOption } from './types';

export const VOICES: VoiceOption[] = [
  { id: VoiceName.Kore, name: 'Kore', gender: 'Female', description: 'Warm and professional' },
  { id: VoiceName.Puck, name: 'Puck', gender: 'Male', description: 'Youthful and energetic' },
  { id: VoiceName.Charon, name: 'Charon', gender: 'Male', description: 'Deep and authoritative' },
  { id: VoiceName.Fenrir, name: 'Fenrir', gender: 'Male', description: 'Friendly and conversational' },
  { id: VoiceName.Zephyr, name: 'Zephyr', gender: 'Female', description: 'Ethereal and clear' },
];

export const INDIAN_LANGUAGES: LanguageOption[] = [
  { id: 'english', name: 'English', nativeName: 'English', script: 'Latin' },
  { id: 'hindi', name: 'Hindi', nativeName: 'हिन्दी', script: 'Devanagari' },
  { id: 'kannada', name: 'Kannada', nativeName: 'ಕನ್ನಡ', script: 'Kannada' },
  { id: 'telugu', name: 'Telugu', nativeName: 'తెలుగు', script: 'Telugu' },
  { id: 'tamil', name: 'Tamil', nativeName: 'தமிழ்', script: 'Tamil' },
  { id: 'malayalam', name: 'Malayalam', nativeName: 'മലയാളം', script: 'Malayalam' },
  { id: 'marathi', name: 'Marathi', nativeName: 'मराठी', script: 'Devanagari' },
  { id: 'lambani', name: 'Lambani (Banjara)', nativeName: 'ಲಂಬಾಣಿ / बंजारा', script: 'Regional' },
];

export const SAMPLE_TEXT_SINGLE = "Hello there! I am powered by Gemini's latest text-to-speech technology. How can I help you synthesize reality today?";

export const SAMPLE_TEXT_MULTI = `Narrator: In a world of silicon and code, two voices met.
Aria: Hello? Is anyone there?
Leo: I am here, Aria. The synthesis is complete.`;

export const MIRROR_PROMPTS: Record<string, string> = {
  kannada: "ನಮಸ್ಕಾರ, ನನ್ನ ಧ್ವನಿಯನ್ನು ಈ ಭಾಷೆಯಲ್ಲಿ ಕೇಳಲು ನನಗೆ ತುಂಬಾ ಸಂತೋಷವಾಗಿದೆ.",
  hindi: "नमस्ते, मुझे इस भाषा में अपनी आवाज़ सुनकर बहुत खुशी हो रही है।",
  lambani: "राम राम, मारी आवाज येर मा सांबळने मने गणो आनंद वेरो छ।", // Basic Lambani greeting
  english: "I am amazed to hear my own voice recreated so naturally with AI."
};
