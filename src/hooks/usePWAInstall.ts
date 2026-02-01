import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
}

function isAndroid(): boolean {
  return /Android/.test(navigator.userAgent)
}

function isMobile(): boolean {
  return isIOS() || isAndroid() || /webOS|BlackBerry|Opera Mini|IEMobile/i.test(navigator.userAgent)
}

function isInStandaloneMode(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
}

export function usePWAInstall() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [platform, setPlatform] = useState<'ios' | 'android' | 'other'>('other')
  const [isMobileDevice, setIsMobileDevice] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (isInStandaloneMode()) {
      setIsInstalled(true)
      return
    }

    // Detect platform
    if (isIOS()) {
      setPlatform('ios')
    } else if (isAndroid()) {
      setPlatform('android')
    }

    setIsMobileDevice(isMobile())

    const handler = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Listen for successful install
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setInstallPrompt(null)
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const install = async () => {
    if (!installPrompt) return false

    await installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice

    if (outcome === 'accepted') {
      setInstallPrompt(null)
      return true
    }
    return false
  }

  return {
    // Show on any mobile device that's not already installed
    canInstall: isMobileDevice && !isInstalled,
    // Can use native prompt (Chrome/Edge Android)
    hasNativePrompt: !!installPrompt,
    isInstalled,
    platform,
    install
  }
}
