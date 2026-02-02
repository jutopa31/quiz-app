import { useEffect, useState } from 'react'
import { registerSW } from 'virtual:pwa-register'
import { Button } from './Button'

export function PWAUpdatePrompt() {
  const [needRefresh, setNeedRefresh] = useState(false)
  const [updateServiceWorker, setUpdateServiceWorker] = useState<null | ((reload?: boolean) => Promise<void>)>(null)

  useEffect(() => {
    const update = registerSW({
      onNeedRefresh() {
        setNeedRefresh(true)
      }
    })
    setUpdateServiceWorker(() => update)
  }, [])

  if (!needRefresh) return null

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md">
      <div className="bg-gray-900 text-white rounded-xl shadow-lg p-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">Hay una nueva version disponible</p>
          <p className="text-xs text-gray-300">Actualiza para ver los ultimos cambios.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setNeedRefresh(false)}
          >
            Luego
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => updateServiceWorker?.(true)}
          >
            Actualizar
          </Button>
        </div>
      </div>
    </div>
  )
}
