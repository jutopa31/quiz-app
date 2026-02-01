import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './components/auth/AuthProvider'
import { Header } from './components/layout/Header'
import { BottomNav } from './components/layout/BottomNav'
import { HomePage } from './pages/HomePage'
import { QuizPage } from './pages/QuizPage'
import { ResultsPage } from './pages/ResultsPage'
import { HistoryPage } from './pages/HistoryPage'
import { LoginPage } from './pages/LoginPage'
import { PageLoader } from './components/ui/Spinner'
import { AdminPage } from './pages/admin/AdminPage'
import { QuizListPage } from './pages/admin/QuizListPage'
import { QuizEditorPage } from './pages/admin/QuizEditorPage'
import { RankingPage } from './pages/admin/RankingPage'
import { AdminRoute } from './components/admin/AdminRoute'
import type { ReactNode } from 'react'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PageLoader />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {children}
      <BottomNav />
    </div>
  )
}

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PageLoader />
      </div>
    )
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout>
              <HomePage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/quiz/:quizId"
        element={
          <ProtectedRoute>
            <AppLayout>
              <QuizPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/results/:attemptId"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ResultsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <AppLayout>
              <HistoryPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AppLayout>
              <AdminPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/quizzes"
        element={
          <ProtectedRoute>
            <AppLayout>
              <QuizListPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/quiz/new"
        element={
          <ProtectedRoute>
            <AppLayout>
              <QuizEditorPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/quiz/:quizId"
        element={
          <ProtectedRoute>
            <AppLayout>
              <QuizEditorPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/ranking"
        element={
          <AdminRoute>
            <AppLayout>
              <RankingPage />
            </AppLayout>
          </AdminRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
