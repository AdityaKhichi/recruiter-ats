import React from 'react'
import SectionCard from './ui/SectionCard'
import Button from './ui/Button'

type State = { hasError: boolean }

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(_error: any, _info: any) {
    // Could log to external service here
    // console.error(error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <SectionCard className="max-w-lg w-full text-center">
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-sm text-slate-600 mb-4">An unexpected error occurred. Please refresh the page or contact support if the problem persists.</p>
            <div className="flex items-center justify-center space-x-2">
              <Button onClick={() => window.location.reload()} variant="primary">Reload</Button>
              <a href="/" className="px-4 py-2 border rounded">Home</a>
            </div>
          </SectionCard>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
