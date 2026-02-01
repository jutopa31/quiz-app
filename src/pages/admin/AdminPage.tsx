import { Link } from 'react-router-dom'
import { Container } from '../../components/layout/Container'
import { Card } from '../../components/ui/Card'
import { useAdmin } from '../../hooks/useAdmin'

export function AdminPage() {
  const { isAdmin } = useAdmin()

  return (
    <Container>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Panel de administracion</h1>

        <div className="grid gap-4">
          <Link to="/admin/quizzes">
            <Card className="hover:shadow-md transition-shadow">
              <h2 className="text-lg font-semibold text-gray-900">Quiz Creator</h2>
              <p className="text-sm text-gray-500 mt-1">
                Crea, edita y publica quizzes con imagenes.
              </p>
            </Card>
          </Link>

          {isAdmin ? (
            <Link to="/admin/ranking">
              <Card className="hover:shadow-md transition-shadow">
                <h2 className="text-lg font-semibold text-gray-900">Ranking</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Consulta el ranking general y por quiz.
                </p>
              </Card>
            </Link>
          ) : null}
        </div>
      </div>
    </Container>
  )
}
