'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Users, AlertTriangle, CheckCircle, Calendar } from 'lucide-react'

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-2">
              Демо дизайна
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Проверка Apple/Notion стиля
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="p-8 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-2xl">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Всего сотрудников
                  </p>
                  <p className="text-3xl font-semibold text-gray-900 dark:text-white">
                    45
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-8 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-2xl">
                  <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Требуют внимания
                  </p>
                  <p className="text-3xl font-semibold text-gray-900 dark:text-white">
                    12
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-8 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-2xl">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Отправлены
                  </p>
                  <p className="text-3xl font-semibold text-gray-900 dark:text-white">
                    8
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Employee Card Demo */}
          <Card className="shadow-sm hover:shadow-md transition-all duration-200 border-0 bg-white dark:bg-gray-900">
            <CardHeader className="pb-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-14 w-14 ring-2 ring-gray-100 dark:ring-gray-800">
                    <AvatarFallback className="bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-semibold text-lg">
                      ИИ
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <CardTitle className="text-xl text-gray-900 dark:text-white">
                      Иванов Иван Иванович
                    </CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Производство
                    </p>
                  </div>
                </div>
                
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 border-green-200 dark:border-green-800">
                  В порядке
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Document Status Demo */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  Статусы документов
                </h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="p-4 rounded-xl border bg-red-50 text-red-800 border-red-200 dark:bg-red-950/20 dark:text-red-200 dark:border-red-800 text-center font-medium">
                    Паспорт просрочен
                  </div>
                  <div className="p-4 rounded-xl border bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-200 dark:border-yellow-800 text-center font-medium">
                    Патент истекает скоро
                  </div>
                  <div className="p-4 rounded-xl border bg-green-50 text-green-800 border-green-200 dark:bg-green-950/20 dark:text-green-200 dark:border-green-800 text-center font-medium">
                    Регистрация в порядке
                  </div>
                  <div className="p-4 rounded-xl border bg-green-50 text-green-800 border-green-200 dark:bg-green-950/20 dark:text-green-200 dark:border-green-800 text-center font-medium">
                    Чек в порядке
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button className="flex-1">WhatsApp</Button>
                <Button variant="secondary" className="flex-1">Telegram</Button>
                <Button variant="outline">Отправлено</Button>
              </div>
            </CardContent>
          </Card>

          {/* Typography Demo */}
          <Card className="p-8 shadow-sm">
            <CardContent className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Типографика
              </h2>
              <div className="space-y-4">
                <p className="text-lg text-gray-900 dark:text-white">Заголовок H2 - text-lg</p>
                <p className="text-base text-gray-700 dark:text-gray-300">Основной текст - text-base</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Вторичный текст - text-sm</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">Мелкий текст - text-xs</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}