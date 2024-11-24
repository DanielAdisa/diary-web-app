'use client';

import { useState, useRef, useEffect } from 'react';
import { fileToBase64 } from '../lib/utils'; // Base64 utility
import { FaPlay } from "react-icons/fa6";
import { FaRegCirclePause } from "react-icons/fa6";
import { FaPause } from "react-icons/fa6";
import { Button } from './ui/button';
import { FaRecordVinyl } from "react-icons/fa6";




export default function VoiceRecorder({ onAudioReady }: { onAudioReady: (audio: string) => void }) {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState<number>(0); // Time in seconds

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const chunks = useRef<Blob[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  const startRecording = async () => {
    setError(null);
    setAudioBlob(null);
    setRecordingTime(0); // Reset timer

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Setup MediaRecorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        chunks.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        chunks.current = []; // Clear the chunks

        // Convert the audio Blob to Base64
        const base64Audio = await fileToBase64(new File([blob], 'recording.webm', { type: 'audio/webm' }));
        onAudioReady(base64Audio); // Pass the Base64 audio back to the parent component

        stopVisualizer(); // Stop waveform visualization
        clearInterval(timerRef.current!); // Stop timer
      };

      mediaRecorder.start();
      setRecording(true);

      // Setup Web Audio API for waveform visualization
      setupAudioVisualizer(stream);

      // Start the timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      setError('Failed to access microphone. Please allow microphone access.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const setupAudioVisualizer = (stream: MediaStream) => {
    // Create AudioContext and AnalyserNode
    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;

    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048; // Set the FFT size for waveform detail
    analyserRef.current = analyser;

    // Connect the stream to the analyser
    const source = audioContext.createMediaStreamSource(stream);
    sourceRef.current = source;
    source.connect(analyser);

    // Start visualizing
    visualizeWaveform();
  };

  const visualizeWaveform = () => {
    if (!canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const analyser = analyserRef.current;
    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      analyser.getByteTimeDomainData(dataArray);

      ctx.fillStyle = '#f3f4f6'; // Background color
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = '#2563eb'; // Waveform color

      ctx.beginPath();
      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();

      // Schedule next animation frame
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
    // Cleanup on component unmount
    return () => {
      stopVisualizer();
      clearInterval(timerRef.current!);
    };
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="mb-4 text-xl font-bold">Voice Recorder</h2>

      {/* Canvas for Waveform Visualization */}
      <canvas
        ref={canvasRef}
        className="w-full h-40 mb-4 bg-gray-100 border rounded-md"
        width={600}
        height={200}
      ></canvas>

      {/* Recording Duration */}
      {recording && (
        <p className="mb-4 text-lg font-bold text-blue-600">
          Recording Time: {formatTime(recordingTime)}
        </p>
      )}

      <div className="flex gap-4">
        <Button
          onClick={startRecording}
          disabled={recording}
          className="px-4 py-2 bg-red-500 rounded-sm text-stone-50"
        >
          
          <FaRecordVinyl />
        </Button>
        <Button
          onClick={stopRecording}
          disabled={!recording}
          className="px-4 py-2 bg-yellow-600 rounded-sm text-stone-50"
        >
          <FaPause />
        </Button>
      </div>

      {error && <p className="mt-4 text-red-500">{error}</p>}
    </div>
  );
}
