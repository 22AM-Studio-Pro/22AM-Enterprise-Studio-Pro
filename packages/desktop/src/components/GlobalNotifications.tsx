import React from 'react'
import { useDesktopStore } from '../store/DesktopStore'

interface NotificationProps {
  notification: any
  onDismiss: (id: string) => void
}

const Notification: React.FC<NotificationProps> = ({ notification, onDismiss }) => {
  const bgColor = {
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6'
  }[notification.type]

  const bgLight = {
    success: '#ecfdf5',
    error: '#fef2f2',
    warning: '#fffbeb',
    info: '#eff6ff'
  }[notification.type]

  return (
    <div
      style={{
        background: bgLight,
        borderLeft: `4px solid ${bgColor}`,
        padding: '16px',
        marginBottom: '8px',
        borderRadius: '4px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}
    >
      <div style={{ color: bgColor, fontWeight: '500' }}>{notification.message}</div>
      <button
        onClick={() => onDismiss(notification.id)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: bgColor,
          fontSize: '20px'
        }}
      >
        ×
      </button>
    </div>
  )
}

export const GlobalNotifications: React.FC = () => {
  const { notifications, dismissNotification } = useDesktopStore()

  return (
    <div
      style={{
        position: 'fixed',
        top: '16px',
        right: '16px',
        maxWidth: '400px',
        zIndex: 1000
      }}
    >
      {notifications.map((notif) => (
        <Notification key={notif.id} notification={notif} onDismiss={dismissNotification} />
      ))}
    </div>
  )
}
