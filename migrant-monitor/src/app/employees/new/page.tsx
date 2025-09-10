'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, User, Phone, Building2, Calendar, MessageSquare, Save, AlertCircle, Loader2 } from 'lucide-react'
import { capitalizeFullName, normalizePhone } from '@/lib/utils'

export default function NewEmployeePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    department: '',
    patentDate: '',
    registrationDate: '',
    passportDate: '',
    checkDate: '',
    comment: ''
  })

  const handleInputChange = (field: string, value: string) => {
    let processedValue = value

    if (field === 'fullName') {
      processedValue = capitalizeFullName(value)
    }

    if (field === 'phone') {
      processedValue = value.replace(/\D/g, '')
    }

    setFormData(prev => ({ ...prev, [field]: processedValue }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      if (!formData.fullName.trim()) {
        throw new Error('ФИО обязательно для заполнения')
      }

      if (formData.phone && normalizePhone(formData.phone).length < 10) {
        throw new Error('Телефон должен содержать минимум 10 цифр')
      }

      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          phone: formData.phone || null,
          department: formData.department || null,
          patentDate: formData.patentDate || null,
          registrationDate: formData.registrationDate || null,
          passportDate: formData.passportDate || null,
          checkDate: formData.checkDate || null,
          comment: formData.comment.trim() || null,
          sent: false
        })
      })

      if (response.ok) {
        router.push('/')
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Ошибка при создании сотрудника')
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Произошла ошибка')
    } finally {
      setIsSubmitting(false)
    }
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
              <User className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Добавить сотрудника</h1>
              <p className="text-sm text-muted-foreground">Создание новой записи</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Новый сотрудник</CardTitle>
              <CardDescription>
                Заполните информацию о сотруднике и датах документов
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium">Основная информация</h3>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="fullName">ФИО *</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      placeholder="Иванов Иван Иванович"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Телефон</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="79001234567"
                      type="tel"
                    />
                    <p className="text-xs text-muted-foreground">
                      Только цифры, минимум 10 символов
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Отдел/Локация</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      placeholder="Производство"
                    />
                  </div>
                </div>

                <Separator />

                {/* Document Dates */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium">Даты документов</h3>
                  </div>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="patentDate">Патент</Label>
                      <Input
                        id="patentDate"
                        type="date"
                        value={formData.patentDate}
                        onChange={(e) => handleInputChange('patentDate', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="registrationDate">Регистрация</Label>
                      <Input
                        id="registrationDate"
                        type="date"
                        value={formData.registrationDate}
                        onChange={(e) => handleInputChange('registrationDate', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="passportDate">Паспорт</Label>
                      <Input
                        id="passportDate"
                        type="date"
                        value={formData.passportDate}
                        onChange={(e) => handleInputChange('passportDate', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="checkDate">Чек</Label>
                      <Input
                        id="checkDate"
                        type="date"
                        value={formData.checkDate}
                        onChange={(e) => handleInputChange('checkDate', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Comment */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium">Комментарий</h3>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="comment">Дополнительная информация</Label>
                    <Textarea
                      id="comment"
                      value={formData.comment}
                      onChange={(e) => handleInputChange('comment', e.target.value)}
                      placeholder="Дополнительная информация о сотруднике..."
                      className="min-h-[100px]"
                    />
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Submit */}
                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 gap-2"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {isSubmitting ? 'Создание...' : 'Создать сотрудника'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                  >
                    Отмена
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}