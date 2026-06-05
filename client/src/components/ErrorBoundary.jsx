import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '600px', margin: '2rem auto' }}>
          <h1 style={{ color: '#dc2626' }}>Something went wrong</h1>
          <p style={{ color: '#555' }}>{this.state.error?.message}</p>
          <p style={{ marginTop: '1rem', color: '#888', fontSize: '14px' }}>
            Make sure you run the app with <code>npm run dev</code> inside the <code>client</code> folder,
            then open <strong>http://localhost:5173</strong> — do not open index.html directly.
          </p>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
