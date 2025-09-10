'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, X, Smartphone, Sparkles, Zap, Crown, Rocket } from 'lucide-react'

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
    // Регистрируем Service Worker
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

    // Обработчик события beforeinstallprompt
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
    
    // Type assertion для BeforeInstallPromptEvent
    const promptEvent = deferredPrompt as BeforeInstallPromptEvent
    promptEvent.prompt()
    const { outcome } = await promptEvent.userChoice

    if (outcome === 'accepted') {
      console.log('PWA установлено')
    } else {
      console.log('Установка PWA отклонена')
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
    <div className="fixed bottom-6 left-4 right-4 z-50 animate-slide-up">
      <div className="max-w-sm mx-auto relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl animate-gradient opacity-90"></div>
        <div className="absolute inset-0 bg-white/10 backdrop-blur-xl rounded-3xl"></div>
        
        {/* Content */}
        <div className="relative p-6 text-white">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl animate-float">
                  <Smartphone className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center animate-ping">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-black flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-300 animate-bounce" />
                  Установить приложение
                </h3>
                <p className="text-white/80 text-sm font-semibold">
                  Премиум опыт на вашем устройстве
                </p>
              </div>
            </div>
            
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={handleDismiss}
              className="rounded-2xl w-8 h-8 p-0 hover:bg-white/20 text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mx-auto">
                <Zap className="w-6 h-6 text-yellow-300 animate-bounce" />
              </div>
              <p className="text-xs font-bold">Мгновенный доступ</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mx-auto">
                <Rocket className="w-6 h-6 text-blue-300 animate-float" />
              </div>
              <p className="text-xs font-bold">Офлайн режим</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mx-auto">
                <Crown className="w-6 h-6 text-purple-300 animate-glow" />
              </div>
              <p className="text-xs font-bold">Премиум UI</p>
            </div>
          </div>

          {/* Install Button */}
          <Button
            onClick={handleInstallClick}
            disabled={isInstalling}
            className="w-full bg-white/20 hover:bg-white/30 text-white border-2 border-white/30 hover:border-white/50 shadow-xl rounded-2xl py-4 font-black text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none backdrop-blur-sm"
          >
            {isInstalling ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                Установка...
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-3 animate-bounce" />
                Установить сейчас
                <Sparkles className="w-5 h-5 ml-3 animate-pulse" />
              </>
            )}
          </Button>
          
          <p className="text-white/70 text-xs text-center mt-3 font-medium">
            ✨ Добавится на домашний экран как нативное приложение
          </p>
        </div>
      </div>
    </div>
  )
}