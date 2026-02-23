'use client';

import React from 'react';

interface InfoScreenProps {
  onFinish: () => void;
}

export default function InfoScreen({ onFinish }: InfoScreenProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        fontFamily: 'Tahoma, "MS Sans Serif", sans-serif',
      }}
    >
      {/* Window */}
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          background: '#ece9d8',
          border: '2px outset #ffffff',
          boxShadow: '4px 4px 20px rgba(0,0,0,0.6)',
        }}
      >
        {/* Title bar */}
        <div
          style={{
            height: '28px',
            background: 'linear-gradient(to bottom, #0058e6, #2d8ae6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 6px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '14px' }}>⚠️</span>
            <span style={{ color: 'white', fontSize: '12px', fontWeight: 'bold' }}>
              System Recovery — Notice
            </span>
          </div>
          <button
            onClick={onFinish}
            style={{
              width: '21px',
              height: '21px',
              background: 'linear-gradient(to bottom, #e05050, #c02020)',
              border: '1px outset #ff8080',
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px 28px 20px', background: 'white' }}>
          {/* Icon + heading */}
          <div
            style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}
          >
            <span style={{ fontSize: '48px', lineHeight: 1 }}>🐸</span>
            <div>
              <div
                style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#003399',
                  marginBottom: '4px',
                }}
              >
                Whoops — you were supposed to explore my projects!
              </div>
              <div style={{ fontSize: '12px', color: '#555' }}>
                Originally there was a full interactive folder system here... but honestly, let's
                keep it simple. 😄
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px solid #ccc', marginBottom: '16px' }} />

          {/* Projects links */}
          <div style={{ marginBottom: '18px' }}>
            <div
              style={{ fontSize: '12px', fontWeight: 'bold', color: '#333', marginBottom: '10px' }}
            >
              📁 All my projects &amp; source code are available here:
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a
                href="https://github.com/Goniek94"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 12px',
                  background: '#f0f0f0',
                  border: '1px solid #aaa',
                  color: '#003399',
                  textDecoration: 'none',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#ddeeff';
                  e.currentTarget.style.borderColor = '#0055cc';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f0f0f0';
                  e.currentTarget.style.borderColor = '#aaa';
                }}
              >
                <span style={{ fontSize: '20px' }}>🐙</span>
                <span>GitHub — github.com/Goniek94</span>
              </a>
            </div>
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px solid #ccc', marginBottom: '16px' }} />

          {/* Desktop hint */}
          <div style={{ marginBottom: '20px' }}>
            <div
              style={{ fontSize: '12px', fontWeight: 'bold', color: '#333', marginBottom: '8px' }}
            >
              🎮 Meanwhile, enjoy some nostalgia on the desktop:
            </div>
            <div style={{ fontSize: '12px', color: '#444', lineHeight: '1.8', paddingLeft: '8px' }}>
              🎵 &nbsp;<strong>Winamp</strong> — listen to 2000s hits
              <br />
              💬 &nbsp;<strong>Gadu-Gadu</strong> — relive the old messenger vibes
            </div>
          </div>

          {/* WIP note */}
          <div
            style={{
              padding: '8px 12px',
              background: '#fffbe6',
              border: '1px solid #e6cc00',
              fontSize: '11px',
              color: '#665500',
              marginBottom: '20px',
            }}
          >
            🚧 &nbsp;This portfolio is still a work in progress — more content coming soon! I'm
            currently open to work, so feel free to reach out. 🚀
          </div>

          {/* Button */}
          <div style={{ textAlign: 'right' }}>
            <button
              onClick={onFinish}
              style={{
                padding: '6px 28px',
                background: 'linear-gradient(to bottom, #f0f0f0, #d8d8d8)',
                border: '2px outset #ffffff',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer',
                color: '#000',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(to bottom, #e0e8ff, #c8d4f0)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(to bottom, #f0f0f0, #d8d8d8)';
              }}
            >
              OK — Let me in! →
            </button>
          </div>
        </div>

        {/* Status bar */}
        <div
          style={{
            height: '22px',
            background: '#ece9d8',
            borderTop: '1px solid #aaa',
            display: 'flex',
            alignItems: 'center',
            padding: '0 8px',
            fontSize: '11px',
            color: '#666',
          }}
        >
          System recovery complete. Welcome back to 2000. 🖥️
        </div>
      </div>
    </div>
  );
}
