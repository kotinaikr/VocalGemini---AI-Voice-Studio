
import React, { useState, useRef, useEffect } from 'react';

interface VoiceRecorderProps {
  onRecorded: (blob: Blob) => void;
  isProcessing: boolean;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onRecorded, isProcessing }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Setup Visualizer
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);
      draw();

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        onRecorded(blob);
        stopVisualizer();
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Could not access microphone. Please ensure permissions are granted.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      streamRef.current?.getTracks().forEach(track => track.stop());
    }
  };

  const stopVisualizer = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    audioContextRef.current?.close();
  };

  const draw = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const renderFrame = () => {
      animationFrameRef.current = requestAnimationFrame(renderFrame);
      analyserRef.current!.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2;
        ctx.fillStyle = `rgb(59, 130, 246, ${barHeight / 100})`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };
    renderFrame();
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="relative w-full h-24 bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800">
        <canvas ref={canvasRef} className="w-full h-full" width={400} height={100} />
        {!isRecording && !isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center text-zinc-600 text-xs font-medium uppercase tracking-widest">
            Microphone Ready
          </div>
        )}
        {isRecording && (
          <div className="absolute top-2 right-3 flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-bold text-red-500 tabular-nums">
              0:0{recordingTime} / 0:10
            </span>
          </div>
        )}
      </div>

      <button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isProcessing}
        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-xl ${
          isRecording 
            ? 'bg-red-500 hover:bg-red-400 ring-4 ring-red-500/20' 
            : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
        } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isRecording ? (
          <div className="w-6 h-6 bg-white rounded-sm" />
        ) : (
          <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4z" />
            <path d="M4 10a1 1 0 001 1h12a1 1 0 100-2H5a1 1 0 00-1 1z" />
          </svg>
        )}
      </button>
      
      <p className="text-center text-xs text-zinc-500">
        {isRecording 
          ? "Stop when you've finished speaking" 
          : "Record a 5-10s sample of your voice for cloning"}
      </p>
    </div>
  );
};
