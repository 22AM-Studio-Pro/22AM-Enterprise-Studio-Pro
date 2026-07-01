import React from 'react'

type Props = { children: React.ReactNode }

export class ErrorBoundary extends React.Component<Props, { hasError: boolean; error?: Error }> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: any) {
    // Send to telemetry later
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught', error, info)
    this.setState({ error })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="max-w-xl text-center p-6 rounded-lg bg-slate-800 text-slate-100 shadow">
            <h2 className="text-xl font-semibold">Something went wrong</h2>
            <p className="mt-2 text-sm text-slate-300">An unexpected error occurred. Please restart the application or contact support.</p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
