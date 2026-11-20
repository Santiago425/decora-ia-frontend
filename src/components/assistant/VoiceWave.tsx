import { useEffect, useRef, useState } from 'react';

const BARS = [0.45, 0.75, 1, 0.75, 0.45];

/**
 * Bars that follow the microphone volume while Lumi listens.
 * If the browser does not share the audio level, the bars fall back to a gentle CSS animation.
 */
export function VoiceWave() {
  const [live, setLive] = useState(false);
  const bars = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    let frame = 0;
    let stream: MediaStream | null = null;
    let context: AudioContext | null = null;
    let cancelled = false;

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) return;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelled) return;
        context = new AudioContext();
        const analyser = context.createAnalyser();
        analyser.fftSize = 256;
        context.createMediaStreamSource(stream).connect(analyser);
        const samples = new Uint8Array(analyser.fftSize);
        setLive(true);
        const tick = () => {
          analyser.getByteTimeDomainData(samples);
          let sum = 0;
          for (const sample of samples) sum += ((sample - 128) / 128) ** 2;
          const level = Math.min(1, Math.sqrt(sum / samples.length) * 4);
          bars.current.forEach((bar, index) => {
            if (bar) bar.style.transform = `scaleY(${0.2 + level * BARS[index] * 0.8})`;
          });
          frame = requestAnimationFrame(tick);
        };
        tick();
      } catch {
        setLive(false);
      }
    }

    void start();
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      stream?.getTracks().forEach((track) => track.stop());
      void context?.close();
    };
  }, []);

  return (
    <span className={`voice-wave ${live ? 'live' : ''}`} aria-hidden="true">
      {BARS.map((_, index) => (
        <span
          key={index}
          ref={(element) => {
            bars.current[index] = element;
          }}
        />
      ))}
    </span>
  );
}
