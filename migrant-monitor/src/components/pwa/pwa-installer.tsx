'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, X, Smartphone, Wifi, Zap, Loader2 } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
}

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration)
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError)
        })
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    setIsInstalling(true)
    
    const promptEvent = deferredPrompt as BeforeInstallPromptEvent
    promptEvent.prompt()
    const { outcome } = await promptEvent.userChoice

    if (outcome === 'accepted') {
      console.log('PWA установлено')
    }

    setDeferredPrompt(null)
    setShowInstallPrompt(false)
    setIsInstalling(false)
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    setDeferredPrompt(null)
  }

  if (!showInstallPrompt) return null

  return (
    <div className="fixed bottom-6 left-6 right-6 z-50 max-w-sm mx-auto">
      <Card className="shadow-lg border-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                <Smartphone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-base">Установить приложение</CardTitle>
                <CardDescription className="text-sm">
                  Быстрый доступ с домашнего экрана
                </CardDescription>
              </div>
            </div>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={handleDismiss}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Features */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="space-y-2">
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg mx-auto w-fit">
                <Wifi className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Офлайн</p>
            </div>
            <div className="space-y-2">
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg mx-auto w-fit">
                <Zap className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Быстро</p>
            </div>
            <div className="space-y-2">
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg mx-auto w-fit">
                <Smartphone className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Удобно</p>
            </div>
          </div>

          <Button
            onClick={handleInstallClick}
            disabled={isInstalling}
            className="w-full gap-2"
          >
            {isInstalling ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {isInstalling ? 'Установка...' : 'Установить'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}