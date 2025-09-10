'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, X, Smartphone, Wifi, Zap, Loader2, Sparkles, Rocket } from 'lucide-react'

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
    <div style={{
      position: 'fixed',
      bottom: '24px',
      left: '24px',
      right: '24px',
      zIndex: 50,
      maxWidth: '400px',
      margin: '0 auto'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '32px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 20px 64px rgba(0, 0, 0, 0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated background */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #667eea, #764ba2, #667eea)',
          backgroundSize: '200% 100%',
          animation: 'gradient-move 3s ease infinite'
        }}></div>

        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              <Smartphone style={{ width: '28px', height: '28px', color: 'white' }} />
              <Sparkles style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                width: '16px',
                height: '16px',
                color: '#fbbf24'
              }} />
            </div>
            <div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#1f2937',
                margin: '0 0 4px 0'
              }}>
                Установить приложение
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                margin: 0
              }}>
                Премиум опыт на вашем устройстве
              </p>
            </div>
          </div>
          
          <Button 
            onClick={handleDismiss}
            style={{
              background: 'rgba(107, 114, 128, 0.1)',
              border: 'none',
              borderRadius: '12px',
              padding: '8px',
              cursor: 'pointer'
            }}
          >
            <X style={{ width: '16px', height: '16px', color: '#6b7280' }} />
          </Button>
        </div>

        {/* Features */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px'
            }}>
              <Wifi style={{ width: '24px', height: '24px', color: 'white' }} />
            </div>
            <p style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#1f2937',
              margin: 0
            }}>
              Работает офлайн
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px'
            }}>
              <Zap style={{ width: '24px', height: '24px', color: 'white' }} />
            </div>
            <p style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#1f2937',
              margin: 0
            }}>
              Молниеносно
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px'
            }}>
              <Rocket style={{ width: '24px', height: '24px', color: 'white' }} />
            </div>
            <p style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#1f2937',
              margin: 0
            }}>
              Как нативное
            </p>
          </div>
        </div>

        {/* Install Button */}
        <Button
          onClick={handleInstallClick}
          disabled={isInstalling}
          style={{
            background: isInstalling 
              ? '#9ca3af' 
              : 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white',
            border: 'none',
            borderRadius: '16px',
            padding: '20px',
            fontSize: '18px',
            fontWeight: '700',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            cursor: isInstalling ? 'not-allowed' : 'pointer',
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)'
          }}
        >
          {isInstalling ? (
            <Loader2 style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} />
          ) : (
            <Download style={{ width: '20px', height: '20px' }} />
          )}
          {isInstalling ? 'Установка...' : 'Установить сейчас'}
          {!isInstalling && <Sparkles style={{ width: '16px', height: '16px' }} />}
        </Button>
        
        <p style={{
          fontSize: '12px',
          color: '#6b7280',
          textAlign: 'center',
          margin: '16px 0 0 0'
        }}>
          ✨ Будет добавлено на домашний экран
        </p>

        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes gradient-move {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}</style>
      </div>
    </div>
  )
}