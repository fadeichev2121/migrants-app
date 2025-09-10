'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Settings, Save, RotateCcw, TestTube } from 'lucide-react'
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

  const updateFieldOverride = (field: string, type: 'urgent' | 'warn', value: string) => {
    if (!settings) return
    
    const numValue = parseInt(value) || undefined
    const newOverrides = { ...settings.perFieldOverrides }
    
    if (!newOverrides[field as keyof typeof newOverrides]) {
      newOverrides[field as keyof typeof newOverrides] = {}
    }
    
    newOverrides[field as keyof typeof newOverrides]![type] = numValue
    
    setSettings({
      ...settings,
      perFieldOverrides: newOverrides
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/30">
        <div className="text-lg text-gray-600 dark:text-gray-400">Загрузка настроек...</div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/30">
        <div className="text-lg text-red-600 dark:text-red-400">Ошибка загрузки настроек</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-purple-950/30 dark:to-pink-950/30 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-white/20 dark:border-gray-700/50 shadow-lg shadow-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="mr-4 rounded-2xl hover:bg-white/60 dark:hover:bg-gray-800/60"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg shadow-purple-500/25">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Настройки
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
                  Пороги срочности и шаблоны сообщений
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {/* Общие настройки */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                Общие пороги срочности
              </CardTitle>
              <CardDescription>
                Настройки по умолчанию для всех типов документов
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="urgent">Срочно (дней)</Label>
                  <Input
                    id="urgent"
                    type="number"
                    value={settings.urgentDaysDefault}
                    onChange={(e) => setSettings({
                      ...settings,
                      urgentDaysDefault: parseInt(e.target.value) || 7
                    })}
                    className="mt-2"
                    min="1"
                    max="365"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Документы с истечением ≤ этого количества дней считаются срочными
                  </p>
                </div>

                <div>
                  <Label htmlFor="warn">Предупреждение (дней)</Label>
                  <Input
                    id="warn"
                    type="number"
                    value={settings.warnDaysDefault}
                    onChange={(e) => setSettings({
                      ...settings,
                      warnDaysDefault: parseInt(e.target.value) || 30
                    })}
                    className="mt-2"
                    min="1"
                    max="365"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Документы с истечением ≤ этого количества дней показываются как предупреждение
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Переопределения по полям */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                Индивидуальные настройки по документам
              </CardTitle>
              <CardDescription>
                Переопределите пороги для конкретных типов документов
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {(['patent', 'registration', 'passport', 'check'] as const).map((field) => {
                const fieldNames = {
                  patent: 'Патент',
                  registration: 'Регистрация',
                  passport: 'Паспорт',
                  check: 'Чек'
                }
                
                const override = settings.perFieldOverrides?.[field] || {}
                
                return (
                  <div key={field} className="space-y-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {fieldNames[field]}
                    </h4>
                    <div className="grid grid-cols-2 gap-4 pl-4">
                      <div>
                        <Label htmlFor={`${field}-urgent`}>Срочно (дней)</Label>
                        <Input
                          id={`${field}-urgent`}
                          type="number"
                          value={override.urgent || ''}
                          onChange={(e) => updateFieldOverride(field, 'urgent', e.target.value)}
                          placeholder={settings.urgentDaysDefault.toString()}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`${field}-warn`}>Предупреждение (дней)</Label>
                        <Input
                          id={`${field}-warn`}
                          type="number"
                          value={override.warn || ''}
                          onChange={(e) => updateFieldOverride(field, 'warn', e.target.value)}
                          placeholder={settings.warnDaysDefault.toString()}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <Separator />
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Шаблон WhatsApp */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                Шаблон сообщения WhatsApp
              </CardTitle>
              <CardDescription>
                Используйте {'{name}'} для имени и {'{problems}'} для списка проблем
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="template">Шаблон сообщения</Label>
                <Textarea
                  id="template"
                  value={settings.whatsappTemplate}
                  onChange={(e) => setSettings({
                    ...settings,
                    whatsappTemplate: e.target.value
                  })}
                  className="mt-2"
                  rows={4}
                  placeholder="Здравствуйте, {name}! {problems}. Пожалуйста, пришлите сканы."
                />
              </div>

              {/* Предпросмотр */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                <h5 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <TestTube className="w-4 h-4" />
                  Предпросмотр сообщения
                </h5>
                <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {settings.whatsappTemplate
                    .replace('{name}', 'Иван Иванович')
                    .replace('{problems}', 'Патент истекает через 3 дн. (15.10.2024), Регистрация просрочена 01.09.2024')}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Кнопки управления */}
          <div className="flex gap-4">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-lg shadow-emerald-500/25 rounded-2xl px-8 py-3 font-bold transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none flex-1"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Сохранение...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Сохранить настройки
                </>
              )}
            </Button>

            <Button
              onClick={handleReset}
              variant="outline"
              className="rounded-2xl px-6 py-3 font-bold border-2"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Сбросить
            </Button>
          </div>

          {/* Сообщения */}
          {error && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 border-2 border-red-200 dark:border-red-700/50 text-red-800 dark:text-red-200">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-green-100 dark:from-emerald-900/30 dark:to-green-800/30 border-2 border-emerald-200 dark:border-emerald-700/50 text-emerald-800 dark:text-emerald-200">
              ✅ Настройки сохранены успешно!
            </div>
          )}
        </div>
      </main>
    </div>
  )
}