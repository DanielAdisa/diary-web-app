'use client';

import { useState, useRef } from 'react';
import { fileToBase64 } from '../lib/utils'; // Base64 utility

export default function VoiceRecorder({ onAudioReady }: { onAudioReady: (audio: string) => void }) {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  const startRecording = async () => {
    setError(null);
    setAudioBlob(null);

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
        chunks.current = []; // Clear the chunks

        // Convert the audio Blob to Base64
        const base64Audio = await fileToBase64(new File([blob], 'recording.webm', { type: 'audio/webm' }));
        onAudioReady(base64Audio); // Pass the Base64 audio back to the parent component
      };

      mediaRecorder.start();
      setRecording(true);
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

  return (
    <div>
      <div className="mb-4">
        <button
          onClick={startRecording}
          disabled={recording}
          className="px-4 py-2 mr-2 text-white bg-green-500 rounded disabled:opacity-50"
        >
          Start Recording
        </button>
        <button
          onClick={stopRecording}
          disabled={!recording}
          className="px-4 py-2 text-white bg-red-500 rounded disabled:opacity-50"
        >
          Stop Recording
        </button>
      </div>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
