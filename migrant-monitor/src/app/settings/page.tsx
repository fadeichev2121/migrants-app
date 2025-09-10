'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-6xl mx-auto px-6 py-6">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-8 w-48" />
            </div>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-6 py-12">
          <div className="space-y-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-8">
                <div className="space-y-4">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-32 w-full" />
                </div>
              </Card>
            ))}
          </div>
        </main>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <Card className="p-8">
          <CardContent className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-xl mb-2">Ошибка загрузки</CardTitle>
            <p className="text-gray-600 dark:text-gray-400">
              Не удалось загрузить настройки
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Настройки
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Пороги срочности и шаблоны уведомлений
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="space-y-8">
          {/* General Settings */}
          <Card className="shadow-sm border-0">
            <CardHeader>
              <CardTitle>Общие пороги срочности</CardTitle>
              <CardDescription>
                Настройки по умолчанию для всех типов документов
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="urgent">Срочно (дней)</Label>
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
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="warn">Предупреждение (дней)</Label>
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
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* WhatsApp Template */}
          <Card className="shadow-sm border-0">
            <CardHeader>
              <CardTitle>Шаблон сообщения WhatsApp</CardTitle>
              <CardDescription>
                Используйте {'{name}'} для имени и {'{problems}'} для списка проблем
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="template">Шаблон сообщения</Label>
                <Textarea
                  id="template"
                  value={settings.whatsappTemplate}
                  onChange={(e) => setSettings({
                    ...settings,
                    whatsappTemplate: e.target.value
                  })}
                  className="min-h-[100px]"
                  placeholder="Здравствуйте, {name}! {problems}. Пожалуйста, пришлите сканы."
                />
              </div>

              {/* Preview */}
              <Card className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TestTube className="h-4 w-4" />
                    Предпросмотр
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {settings.whatsappTemplate
                      .replace('{name}', 'Иван Иванович')
                      .replace('{problems}', 'Патент истекает 15.10.2024, Регистрация просрочена 01.09.2024')}
                  </p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 gap-2"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isSaving ? 'Сохранение...' : 'Сохранить настройки'}
            </Button>

            <Button
              onClick={handleReset}
              variant="outline"
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Сбросить
            </Button>
          </div>

          {/* Messages */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-xl">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  Настройки сохранены успешно!
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}