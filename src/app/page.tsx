'use client';

import React, { useState, useCallback, useEffect } from 'react';
import BootScreen from '@/components/boot/BootScreen';
import WelcomeScreen from '@/components/boot/WelcomeScreen';
import GlitchOverlay from '@/components/DesktopXP/Glitch';
import DesktopXP from '@/components/DesktopXP/Desktop';
import Warning from '@/components/DesktopXP/Warning';
import InfoScreen from '@/components/DesktopXP/Desktop/components/InfoScreen';

type AppPhase = 'boot' | 'welcome' | 'desktop' | 'glitch' | 'warning' | 'info';

interface AppState {
  currentPhase: AppPhase;
  glitchCompleted: boolean;
}

export default function Home() {
  const [state, setState] = useState<AppState>({
    currentPhase: 'boot',
    glitchCompleted: false,
  });

  const [transitionAudio, setTransitionAudio] = useState<HTMLAudioElement | null>(null);

  /* ---------- phase handlers ---------- */
  const handleBootFinish = useCallback(() => {
    setState((prev) => ({ ...prev, currentPhase: 'welcome' }));
  }, []);

  const handleWelcomeFinish = useCallback(() => {
    setState((prev) => ({ ...prev, currentPhase: 'desktop' }));

    const possiblePaths = [
      '/sound/Microsoft Windows XP Startup Sound.mp3',
      '/audio/Microsoft Windows XP Startup Sound.mp3',
      '/sound/windows-startup.mp3',
      '/sound/startup.mp3',
    ];

    (async () => {
      for (const path of possiblePaths) {
        try {
          const audio = new Audio(path);
          audio.volume = 0.7;

          await new Promise((res, rej) => {
            audio.addEventListener('canplaythrough', res as EventListener, { once: true });
            audio.addEventListener('error', rej as EventListener, { once: true });
            audio.load();
          });

          setTransitionAudio(audio);
          audio.play().catch(() => {});
          break;
        } catch {
          /* try next file */
        }
      }
    })();
  }, []);

  const handleGlitchTrigger = useCallback(() => {
    if (!state.glitchCompleted) {
      setState((prev) => ({ ...prev, currentPhase: 'glitch' }));
    }
  }, [state.glitchCompleted]);

  const handleGlitchFinish = useCallback(() => {
    setState((prev) => ({ ...prev, currentPhase: 'warning' }));
  }, []);

  // Warning -> Info
  const handleWarningFinish = useCallback(() => {
    setState((prev) => ({ ...prev, currentPhase: 'info' }));
  }, []);

  // Info -> Desktop
  const handleInfoFinish = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentPhase: 'desktop',
      glitchCompleted: true,
    }));
  }, []);

  /* ---------- cleanup ---------- */
  useEffect(
    () => () => {
      transitionAudio?.pause();
    },
    [transitionAudio]
  );

  /* ---------- render ---------- */
  return (
    <div className="w-full h-screen overflow-hidden relative bg-black">
      {state.currentPhase === 'boot' && (
        <div className="absolute inset-0" style={{ zIndex: 30, pointerEvents: 'auto' }}>
          <BootScreen onFinish={handleBootFinish} />
        </div>
      )}

      {state.currentPhase === 'welcome' && (
        <div className="absolute inset-0" style={{ zIndex: 30, pointerEvents: 'auto' }}>
          <WelcomeScreen onFinish={handleWelcomeFinish} />
        </div>
      )}

      {state.currentPhase === 'desktop' && (
        <div className="absolute inset-0" style={{ zIndex: 30 }}>
          <DesktopXP showAdditionalIcons={false} onGlitchTrigger={handleGlitchTrigger} />
        </div>
      )}

      {state.currentPhase === 'glitch' && (
        <div className="absolute inset-0 z-40">
          <GlitchOverlay onFinish={handleGlitchFinish} />
        </div>
      )}

      {state.currentPhase === 'warning' && (
        <div className="absolute inset-0 z-40">
          <Warning onFinish={handleWarningFinish} />
        </div>
      )}

      {state.currentPhase === 'info' && (
        <div className="absolute inset-0 z-40">
          <InfoScreen onFinish={handleInfoFinish} />
        </div>
      )}
    </div>
  );
}
