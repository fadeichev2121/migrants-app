'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-4 md:px-6 py-8">
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Ошибка загрузки настроек</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад
            </Button>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Settings className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Настройки</h1>
              <p className="text-sm text-muted-foreground">Пороги срочности и шаблоны</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <div className="space-y-8">
          {/* Page Header */}
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold mb-2">Настройки системы</h1>
            <p className="text-muted-foreground mb-6">
              Настройте пороги срочности и шаблоны уведомлений
            </p>
          </div>

          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Общие пороги срочности</CardTitle>
              <CardDescription>
                Настройки по умолчанию для всех типов документов
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
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
                  <p className="text-xs text-muted-foreground">
                    Документы с истечением ≤ этого количества дней считаются срочными
                  </p>
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
                  <p className="text-xs text-muted-foreground">
                    Документы с истечением ≤ этого количества дней показываются как предупреждение
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Field Overrides */}
          <Card>
            <CardHeader>
              <CardTitle>Индивидуальные настройки по документам</CardTitle>
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
                    <h4 className="font-medium">{fieldNames[field]}</h4>
                    <div className="grid gap-4 sm:grid-cols-2 pl-4">
                      <div className="space-y-2">
                        <Label htmlFor={`${field}-urgent`}>Срочно (дней)</Label>
                        <Input
                          id={`${field}-urgent`}
                          type="number"
                          value={override.urgent || ''}
                          onChange={(e) => updateFieldOverride(field, 'urgent', e.target.value)}
                          placeholder={settings.urgentDaysDefault.toString()}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`${field}-warn`}>Предупреждение (дней)</Label>
                        <Input
                          id={`${field}-warn`}
                          type="number"
                          value={override.warn || ''}
                          onChange={(e) => updateFieldOverride(field, 'warn', e.target.value)}
                          placeholder={settings.warnDaysDefault.toString()}
                        />
                      </div>
                    </div>
                    {field !== 'check' && <Separator />}
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* WhatsApp Template */}
          <Card>
            <CardHeader>
              <CardTitle>Шаблон сообщения WhatsApp</CardTitle>
              <CardDescription>
                Используйте {'{name}'} для имени и {'{problems}'} для списка проблем
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
              <Card className="bg-muted/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TestTube className="h-4 w-4" />
                    Предпросмотр сообщения
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">
                    {settings.whatsappTemplate
                      .replace('{name}', 'Иван Иванович')
                      .replace('{problems}', 'Патент истекает через 3 дн. (15.10.2024), Регистрация просрочена 01.09.2024')}
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
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>Настройки сохранены успешно!</AlertDescription>
            </Alert>
          )}
        </div>
      </main>
    </div>
  )
}