import AppRoutes from './routes/AppRoutes'
import ToastProvider from './components/Toast'
import ErrorBoundary from './components/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </ErrorBoundary>
  )
}

export default App
