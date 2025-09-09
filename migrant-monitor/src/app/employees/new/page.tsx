'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { capitalizeFullName, normalizePhone } from '@/lib/utils'

export default function NewEmployeePage() {
  const { data: session, status } = useSession()
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

  // Проверка доступа
  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>
  }

  if (!session) {
    router.push('/auth/signin')
    return null
  }

  if (!['OWNER', 'HR_ADMIN', 'HR'].includes(session.user.role)) {
    router.push('/')
    return null
  }

  const handleInputChange = (field: string, value: string) => {
    let processedValue = value

    // Автокапитализация для ФИО
    if (field === 'fullName') {
      processedValue = capitalizeFullName(value)
    }

    // Нормализация телефона при вводе
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
      // Валидация
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
          comment: formData.comment.trim() || null
        })
      })

      if (response.ok) {
        router.push('/')
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Ошибка при создании сотрудника')
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">
              Добавить сотрудника
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Новый сотрудник</CardTitle>
            <CardDescription>
              Заполните информацию о сотруднике и датах документов
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Основная информация */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Основная информация</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ФИО *
                  </label>
                  <Input
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="Иванов Иван Иванович"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Телефон
                  </label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="79001234567"
                    type="tel"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Только цифры, минимум 10 символов
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Отдел/Локация
                  </label>
                  <Input
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    placeholder="Производство"
                  />
                </div>
              </div>

              {/* Даты документов */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Даты документов</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Патент
                    </label>
                    <Input
                      type="date"
                      value={formData.patentDate}
                      onChange={(e) => handleInputChange('patentDate', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Регистрация
                    </label>
                    <Input
                      type="date"
                      value={formData.registrationDate}
                      onChange={(e) => handleInputChange('registrationDate', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Паспорт
                    </label>
                    <Input
                      type="date"
                      value={formData.passportDate}
                      onChange={(e) => handleInputChange('passportDate', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Чек
                    </label>
                    <Input
                      type="date"
                      value={formData.checkDate}
                      onChange={(e) => handleInputChange('checkDate', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Комментарий */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Комментарий
                </label>
                <Textarea
                  value={formData.comment}
                  onChange={(e) => handleInputChange('comment', e.target.value)}
                  placeholder="Дополнительная информация..."
                  rows={3}
                />
              </div>

              {/* Ошибка */}
              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}

              {/* Кнопки */}
              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
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
      </main>
    </div>
  )
}