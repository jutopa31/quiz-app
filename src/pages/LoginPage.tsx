import { useNavigate } from 'react-router-dom'
import { Container } from '../components/layout/Container'
import { LoginForm } from '../components/auth/LoginForm'

export function LoginPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Container className="flex-1 flex flex-col justify-center py-12">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Quiz Academia</h1>
          <p className="text-gray-500 mt-2">Ingresa para acceder a los quizzes</p>
        </div>

        <LoginForm onSuccess={() => navigate('/')} />
      </Container>
    </div>
  )
}
