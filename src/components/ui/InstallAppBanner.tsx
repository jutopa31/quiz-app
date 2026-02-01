import { useState } from 'react'
import { usePWAInstall } from '../../hooks/usePWAInstall'

export function InstallAppBanner() {
  const { canInstall, install } = usePWAInstall()
  const [dismissed, setDismissed] = useState(() => {
    return sessionStorage.getItem('install-banner-dismissed') === 'true'
  })

  if (!canInstall || dismissed) return null

  const handleInstall = async () => {
    await install()
  }

  const handleDismiss = () => {
    setDismissed(true)
    sessionStorage.setItem('install-banner-dismissed', 'true')
  }

  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-emerald-900">Instalar Quiz Academia</p>
          <p className="text-sm text-emerald-700 mt-0.5">
            Accede mas rapido desde tu pantalla de inicio
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="text-emerald-400 hover:text-emerald-600 p-1"
          aria-label="Cerrar"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <button
        onClick={handleInstall}
        className="w-full mt-3 bg-emerald-500 text-white font-medium py-2.5 px-4 rounded-lg active:bg-emerald-600 transition-colors"
      >
        Instalar app
      </button>
    </div>
  )
}
