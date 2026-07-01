import React, { useState, useCallback, useRef, useEffect } from 'react'

export type CommandItem = {
  id: string
  label: string
  category: string
  action: () => void
  shortcut?: string
  icon?: string
}

interface CommandPaletteProps {
  commands: CommandItem[]
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ commands }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = commands.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(search.toLowerCase()) ||
      cmd.category.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(!isOpen)
        setSearch('')
        setSelectedIndex(0)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    }
  }, [isOpen])

  const handleSelect = useCallback(
    (cmd: CommandItem) => {
      cmd.action()
      setIsOpen(false)
      setSearch('')
    },
    []
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(Math.min(selectedIndex + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(Math.max(selectedIndex - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filtered[selectedIndex]) {
        handleSelect(filtered[selectedIndex])
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        paddingTop: '100px',
        zIndex: 1000
      }}
      onClick={() => setIsOpen(false)}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '8px',
          width: '90%',
          maxWidth: '500px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          type="text"
          placeholder="Type a command or search..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setSelectedIndex(0)
          }}
          onKeyDown={handleKeyDown}
          style={{
            width: '100%',
            padding: '12px 16px',
            border: 'none',
            outline: 'none',
            fontSize: '14px',
            borderBottom: '1px solid #e5e7eb'
          }}
        />

        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
              No commands found.
            </div>
          ) : (
            filtered.map((cmd, idx) => (
              <div
                key={cmd.id}
                onClick={() => handleSelect(cmd)}
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #f3f4f6',
                  background: idx === selectedIndex ? '#f3f4f6' : 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {cmd.icon && <span>{cmd.icon}</span>}
                  <div>
                    <div style={{ fontWeight: '500', color: '#1f2937' }}>{cmd.label}</div>
                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>{cmd.category}</div>
                  </div>
                </div>
                {cmd.shortcut && (
                  <div style={{ fontSize: '12px', color: '#9ca3af', background: '#f0f0f0', padding: '2px 6px', borderRadius: '3px' }}>
                    {cmd.shortcut}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
