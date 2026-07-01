import React, { useEffect, useState } from 'react'
import { useSettingsStore } from '../store/SettingsStore'

interface SettingsPageProps {}

export const SettingsPage: React.FC<SettingsPageProps> = () => {
  const {
    theme,
    setTheme,
    language,
    setLanguage,
    notifications,
    setNotifications,
    autoSave,
    setAutoSave,
    featureFlags,
    setFeatureFlag
  } = useSettingsStore()

  const [exportedSettings, setExportedSettings] = useState<string>('')

  const handleExportSettings = async () => {
    // In real implementation, this would call SettingsManager.exportSettings()
    const settings = JSON.stringify({ theme, language, notifications, autoSave, featureFlags }, null, 2)
    setExportedSettings(settings)
  }

  const handleImportSettings = async (file: File) => {
    // In real implementation, this would call SettingsManager.importSettings()
    const content = await file.text()
    try {
      const settings = JSON.parse(content)
      setTheme(settings.theme || theme)
      setLanguage(settings.language || language)
      setNotifications(settings.notifications !== undefined ? settings.notifications : notifications)
      setAutoSave(settings.autoSave !== undefined ? settings.autoSave : autoSave)
    } catch (error) {
      console.error('Failed to import settings:', error)
    }
  }

  return (
    <div style={{ padding: '32px' }}>
      <h1 style={{ marginBottom: '32px' }}>Settings</h1>

      {/* Appearance */}
      <div style={{ marginBottom: '32px', paddingBottom: '32px', borderBottom: '1px solid #e5e7eb' }}>
        <h2 style={{ marginBottom: '16px' }}>Appearance</h2>
        <div style={{ display: 'grid', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Theme</label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
              style={{
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #d1d5db',
                width: '200px'
              }}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #d1d5db',
                width: '200px'
              }}
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div style={{ marginBottom: '32px', paddingBottom: '32px', borderBottom: '1px solid #e5e7eb' }}>
        <h2 style={{ marginBottom: '16px' }}>Notifications</h2>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={notifications}
            onChange={(e) => setNotifications(e.target.checked)}
          />
          <span>Enable notifications</span>
        </label>
      </div>

      {/* Auto-Save */}
      <div style={{ marginBottom: '32px', paddingBottom: '32px', borderBottom: '1px solid #e5e7eb' }}>
        <h2 style={{ marginBottom: '16px' }}>Auto-Save</h2>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input type="checkbox" checked={autoSave} onChange={(e) => setAutoSave(e.target.checked)} />
          <span>Automatically save workflows</span>
        </label>
      </div>

      {/* Feature Flags */}
      <div style={{ marginBottom: '32px', paddingBottom: '32px', borderBottom: '1px solid #e5e7eb' }}>
        <h2 style={{ marginBottom: '16px' }}>Features</h2>
        <div style={{ display: 'grid', gap: '12px' }}>
          {Object.entries(featureFlags).map(([feature, enabled]) => (
            <label key={feature} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setFeatureFlag(feature, e.target.checked)}
              />
              <span>{feature}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Import/Export */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ marginBottom: '16px' }}>Import/Export</h2>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button
            onClick={handleExportSettings}
            style={{
              padding: '8px 16px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Export Settings
          </button>
          <label style={{ cursor: 'pointer' }}>
            <input
              type="file"
              accept=".json"
              onChange={(e) => e.target.files && handleImportSettings(e.target.files[0])}
              style={{ display: 'none' }}
            />
            <span
              style={{
                padding: '8px 16px',
                background: '#10b981',
                color: 'white',
                borderRadius: '4px',
                display: 'inline-block',
                cursor: 'pointer'
              }}
            >
              Import Settings
            </span>
          </label>
        </div>
      </div>

      {/* Export Preview */}
      {exportedSettings && (
        <div style={{ marginTop: '16px', padding: '16px', background: '#f9fafb', borderRadius: '4px' }}>
          <h3 style={{ marginBottom: '8px' }}>Exported Settings:</h3>
          <pre
            style={{
              background: '#fff',
              padding: '12px',
              borderRadius: '4px',
              overflow: 'auto',
              maxHeight: '300px',
              fontSize: '12px'
            }}
          >
            {exportedSettings}
          </pre>
        </div>
      )}
    </div>
  )
}
