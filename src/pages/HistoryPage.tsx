import { useAttempts } from '../hooks/useAttempts'
import { Container } from '../components/layout/Container'
import { AttemptCard } from '../components/history/AttemptCard'
import { PageLoader } from '../components/ui/Spinner'

export function HistoryPage() {
  const { attempts, loading, error } = useAttempts()

  if (loading) {
    return (
      <Container>
        <PageLoader />
      </Container>
    )
  }

  if (error) {
    return (
      <Container>
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
        </div>
      </Container>
    )
  }

  return (
    <Container>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Historial</h1>

      {attempts.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-500">No hay intentos todavía</p>
          <p className="text-sm text-gray-400 mt-1">Completa un quiz para ver tu historial</p>
        </div>
      ) : (
        <div className="space-y-3">
          {attempts.map(attempt => (
            <AttemptCard key={attempt.id} attempt={attempt} />
          ))}
        </div>
      )}
    </Container>
  )
}
