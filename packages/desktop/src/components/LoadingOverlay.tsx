import React, { useState } from 'react'
import { useDesktopStore } from '../store/DesktopStore'

interface LoadingOverlayProps {
  show: boolean
  progress?: number
  message?: string
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ show, progress, message }) => {
  if (!show) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '8px',
          padding: '32px',
          textAlign: 'center',
          minWidth: '300px'
        }}
      >
        <div
          style={{
            fontSize: '32px',
            marginBottom: '16px',
            animation: 'spin 1s linear infinite'
          }}
        >
          ⏳
        </div>
        {message && <div style={{ marginBottom: '16px', fontWeight: '500' }}>{message}</div>}
        {typeof progress === 'number' && (
          <div>
            <div
              style={{
                height: '8px',
                background: '#e5e7eb',
                borderRadius: '4px',
                overflow: 'hidden',
                marginBottom: '8px'
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${progress}%`,
                  background: '#10b981',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>{Math.round(progress)}%</div>
          </div>
        )}
      </div>
    </div>
  )
}
