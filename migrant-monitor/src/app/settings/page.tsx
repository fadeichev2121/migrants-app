'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Settings, Save, RotateCcw, TestTube, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { UrgencySettings } from '@/lib/urgency'

export default function SettingsPage() {
  const router = useRouter()
  const [settings, setSettings] = useState<UrgencySettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings({
          urgentDaysDefault: data.urgentDaysDefault,
          warnDaysDefault: data.warnDaysDefault,
          whatsappTemplate: data.whatsappTemplate,
          perFieldOverrides: data.perFieldOverrides || {}
        })
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      setError('Ошибка загрузки настроек')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!settings) return

    try {
      setIsSaving(true)
      setError('')
      setSuccess(false)

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      } else {
        throw new Error('Ошибка сохранения')
      }
    } catch (error) {
      setError('Ошибка при сохранении настроек')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    if (settings) {
      setSettings({
        urgentDaysDefault: 7,
        warnDaysDefault: 30,
        whatsappTemplate: 'Здравствуйте, {name}! {problems}. Пожалуйста, пришлите сканы.',
        perFieldOverrides: {}
      })
    }
  }

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          border: '4px solid rgba(255, 255, 255, 0.3)',
          borderTop: '4px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (!settings) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '24px',
          padding: '48px',
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <AlertCircle style={{ width: '48px', height: '48px', color: '#ef4444', margin: '0 auto 24px' }} />
          <h2 style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 16px 0' }}>
            Ошибка загрузки
          </h2>
          <p style={{ color: '#6b7280', margin: 0 }}>
            Не удалось загрузить настройки
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        padding: '24px 0'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 32px',
          display: 'flex',
          alignItems: 'center',
          gap: '20px'
        }}>
          <Button
            variant="ghost"
            onClick={() => router.back()}
            style={{
              background: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '12px',
              padding: '12px 16px'
            }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
          <div>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#1f2937',
              margin: '0 0 8px 0'
            }}>
              Настройки
            </h1>
            <p style={{
              fontSize: '16px',
              color: '#6b7280',
              margin: 0
            }}>
              Пороги срочности и шаблоны уведомлений
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '48px 32px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* General Settings */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '32px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#1f2937',
              margin: '0 0 8px 0'
            }}>
              Общие пороги срочности
            </h2>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: '0 0 24px 0'
            }}>
              Настройки по умолчанию для всех типов документов
            </p>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '24px'
            }}>
              <div>
                <Label htmlFor="urgent" style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                  Срочно (дней)
                </Label>
                <Input
                  id="urgent"
                  type="number"
                  value={settings.urgentDaysDefault}
                  onChange={(e) => setSettings({
                    ...settings,
                    urgentDaysDefault: parseInt(e.target.value) || 7
                  })}
                  min="1"
                  max="365"
                  style={{
                    marginTop: '8px',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    padding: '12px 16px',
                    fontSize: '16px'
                  }}
                />
              </div>

              <div>
                <Label htmlFor="warn" style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                  Предупреждение (дней)
                </Label>
                <Input
                  id="warn"
                  type="number"
                  value={settings.warnDaysDefault}
                  onChange={(e) => setSettings({
                    ...settings,
                    warnDaysDefault: parseInt(e.target.value) || 30
                  })}
                  min="1"
                  max="365"
                  style={{
                    marginTop: '8px',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    padding: '12px 16px',
                    fontSize: '16px'
                  }}
                />
              </div>
            </div>
          </div>

          {/* WhatsApp Template */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '32px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#1f2937',
              margin: '0 0 8px 0'
            }}>
              Шаблон сообщения WhatsApp
            </h2>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: '0 0 24px 0'
            }}>
              Используйте {'{name}'} для имени и {'{problems}'} для списка проблем
            </p>
            
            <div style={{ marginBottom: '24px' }}>
              <Label htmlFor="template" style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                Шаблон сообщения
              </Label>
              <Textarea
                id="template"
                value={settings.whatsappTemplate}
                onChange={(e) => setSettings({
                  ...settings,
                  whatsappTemplate: e.target.value
                })}
                style={{
                  marginTop: '8px',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  padding: '16px',
                  fontSize: '14px',
                  minHeight: '120px',
                  fontFamily: 'Inter, sans-serif'
                }}
                placeholder="Здравствуйте, {name}! {problems}. Пожалуйста, пришлите сканы."
              />
            </div>

            {/* Preview */}
            <div style={{
              background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid #bae6fd'
            }}>
              <h4 style={{
                fontSize: '14px',
                fontWeight: '700',
                color: '#0c4a6e',
                margin: '0 0 12px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <TestTube style={{ width: '16px', height: '16px' }} />
                Предпросмотр
              </h4>
              <p style={{
                fontSize: '14px',
                color: '#0c4a6e',
                margin: 0,
                lineHeight: '1.5',
                whiteSpace: 'pre-wrap'
              }}>
                {settings.whatsappTemplate
                  .replace('{name}', 'Иван Иванович')
                  .replace('{problems}', 'Патент истекает 15.10.2024, Регистрация просрочена 01.09.2024')}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div style={{
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap'
          }}>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              style={{
                background: isSaving 
                  ? '#9ca3af' 
                  : 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                border: 'none',
                borderRadius: '16px',
                padding: '16px 32px',
                fontSize: '16px',
                fontWeight: '600',
                flex: '1',
                minWidth: '200px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: isSaving ? 'not-allowed' : 'pointer'
              }}
            >
              {isSaving ? (
                <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
              ) : (
                <Save style={{ width: '16px', height: '16px' }} />
              )}
              {isSaving ? 'Сохранение...' : 'Сохранить настройки'}
            </Button>

            <Button
              onClick={handleReset}
              style={{
                background: 'rgba(255, 255, 255, 0.8)',
                color: '#374151',
                border: '1px solid #e5e7eb',
                borderRadius: '16px',
                padding: '16px 24px',
                fontSize: '16px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <RotateCcw style={{ width: '16px', height: '16px' }} />
              Сбросить
            </Button>
          </div>

          {/* Messages */}
          {error && (
            <div style={{
              background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid #fecaca'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <AlertCircle style={{ width: '20px', height: '20px', color: '#dc2626' }} />
                <p style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#991b1b',
                  margin: 0
                }}>
                  {error}
                </p>
              </div>
            </div>
          )}

          {success && (
            <div style={{
              background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid #bbf7d0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CheckCircle style={{ width: '20px', height: '20px', color: '#16a34a' }} />
                <p style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#166534',
                  margin: 0
                }}>
                  Настройки сохранены успешно! ✨
                </p>
              </div>
            </div>
          )}
        </div>

        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </main>
    </div>
  )
}