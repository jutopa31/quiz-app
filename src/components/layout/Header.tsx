import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'

export function Header() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="font-semibold text-gray-900">Quiz Academia</span>
        </div>

        {user && (
          <button
            onClick={handleBack}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Volver
          </button>
        )}
      </div>
    </header>
  )
}
