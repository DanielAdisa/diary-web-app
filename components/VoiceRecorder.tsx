'use client';

import { useState, useRef, useEffect } from 'react';
import { fileToBase64 } from '../lib/utils';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RiRecordCircleFill, 
  RiStopCircleFill, 
  RiDeleteBin6Line, 
  RiPlayFill,
  RiPauseFill,
  RiMicLine
} from "react-icons/ri";

interface VoiceRecorderProps {
  onAudioReady: (audio: string) => void;
  onRecordingStateChange?: (isRecording: boolean) => void;
}

export default function VoiceRecorder({ onAudioReady, onRecordingStateChange }: VoiceRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const chunks = useRef<Blob[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = async () => {
    setError(null);
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        chunks.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        
        // Create URL for playback
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        chunks.current = [];

        // Convert to Base64 for storage
        const base64Audio = await fileToBase64(new File([blob], 'recording.webm', { type: 'audio/webm' }));
        onAudioReady(base64Audio);

        stopVisualizer();
        clearInterval(timerRef.current!);
        
        if (onRecordingStateChange) {
          onRecordingStateChange(false);
        }
      };

      mediaRecorder.start();
      setRecording(true);
      
      if (onRecordingStateChange) {
        onRecordingStateChange(true);
      }

      // Setup visualizer
      setupAudioVisualizer(stream);

      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      setError('Microphone access is required. Please enable microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const deleteRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    onAudioReady(''); // Clear the audio data
    
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    }
  };

  const togglePlayback = () => {
    if (audioPlayerRef.current) {
      if (isPlaying) {
        audioPlayerRef.current.pause();
      } else {
        audioPlayerRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const setupAudioVisualizer = (stream: MediaStream) => {
    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;

    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256; // Lower for more responsive visualization
    analyserRef.current = analyser;

    const source = audioContext.createMediaStreamSource(stream);
    sourceRef.current = source;
    source.connect(analyser);

    visualizeWaveform();
  };

  const visualizeWaveform = () => {
    if (!canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      analyser.getByteFrequencyData(dataArray);

      // Clear canvas with a transparent background
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw the frequency bars
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        
        // Create gradient for bars
        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        gradient.addColorStop(0, 'hsl(var(--primary))');
        gradient.addColorStop(1, 'hsl(var(--accent))');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        
        x += barWidth + 1; // Add small gap between bars
      }

      animationIdRef.current = requestAnimationFrame(draw);
    };

    draw();
  };

  const stopVisualizer = () => {
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
      animationIdRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopVisualizer();
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  useEffect(() => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.onended = () => setIsPlaying(false);
    }
  }, [audioUrl]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className="flex flex-col w-full">
      <div className={`relative w-full overflow-hidden bg-black/5 rounded-lg transition-all duration-300 ${recording ? 'h-40' : 'h-24'}`}>
        {/* Canvas for visualization */}
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          width={600}
          height={recording ? 160 : 96}
        />
        
        {/* Overlay elements */}
        <div className="absolute inset-0 flex items-center justify-center">
          {!recording && !audioBlob && (
            <div className="flex flex-col items-center text-muted-foreground">
              <RiMicLine size={24} className="mb-2 opacity-70" />
              <span className="text-sm">No recording yet</span>
            </div>
          )}
        </div>
        
        {/* Recording indicator */}
        <AnimatePresence>
          {recording && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute flex items-center px-3 py-1 text-white rounded-md top-3 left-3 bg-primary"
            >
              <motion.div 
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-2 h-2 mr-2 bg-white rounded-full"
              />
              <span className="text-xs font-medium">Recording {formatTime(recordingTime)}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex gap-2">
          {!audioBlob ? (
            <>
              <Button
                onClick={startRecording}
                disabled={recording}
                variant={recording ? "outline" : "default"}
                size="icon"
                className={recording ? "bg-transparent" : "bg-primary/90 hover:bg-primary"}
              >
                <RiRecordCircleFill size={20} className={recording ? "text-primary animate-pulse" : ""} />
              </Button>
              
              <Button
                onClick={stopRecording}
                disabled={!recording}
                variant="outline"
                size="icon"
              >
                <RiStopCircleFill size={20} className="text-muted-foreground" />
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={togglePlayback}
                variant="outline"
                size="icon"
              >
                {isPlaying ? <RiPauseFill size={20} /> : <RiPlayFill size={20} />}
              </Button>
              
              <Button
                onClick={deleteRecording}
                variant="outline"
                size="icon"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <RiDeleteBin6Line size={18} />
              </Button>
            </>
          )}
        </div>
        
        {audioBlob && (
          <span className="text-xs text-muted-foreground">
            Recording saved
          </span>
        )}
        
        {error && (
          <span className="text-sm text-destructive">
            {error}
          </span>
        )}
      </div>

      {/* Hidden audio player */}
      {audioUrl && (
        <audio ref={audioPlayerRef} src={audioUrl} className="hidden" />
      )}
    </div>
  );
}
