import React from 'react'

export type ErrorBoundaryProps = {
  children: React.ReactNode
  fallback?: (error: Error, reset: () => void) => React.ReactNode
}

export type ErrorBoundaryState = {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Error caught by boundary:', error, errorInfo)
    this.setState({ error, errorInfo })
  }

  resetError = (): void => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback?.(this.state.error!, this.resetError) || (
          <div
            style={{
              padding: '32px',
              textAlign: 'center',
              background: '#fef2f2',
              borderRadius: '8px',
              color: '#991b1b'
            }}
          >
            <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>⚠️ Something went wrong</div>
            <div style={{ marginBottom: '16px' }}>{this.state.error?.message}</div>
            {process.env.NODE_ENV === 'development' && (
              <div
                style={{
                  background: '#fff',
                  padding: '16px',
                  borderRadius: '4px',
                  textAlign: 'left',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  overflow: 'auto',
                  maxHeight: '300px'
                }}
              >
                {this.state.errorInfo?.componentStack}
              </div>
            )}
            <button
              onClick={this.resetError}
              style={{
                marginTop: '16px',
                padding: '8px 16px',
                background: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
          </div>
        )
      )
    }

    return this.props.children
  }
}
