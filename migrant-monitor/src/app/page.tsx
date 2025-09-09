'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import EmployeeList from '@/components/employees/employee-list'
import PWAInstaller from '@/components/pwa/pwa-installer'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [showOnlyUrgent, setShowOnlyUrgent] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Загрузка...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Уведомления WhatsApp
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Добро пожаловать, {session.user.name || session.user.email}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Фильтр "только срочные" */}
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showOnlyUrgent}
                  onChange={(e) => setShowOnlyUrgent(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Показать только просроченные или 7 дней</span>
              </label>
              
              {/* Переключатель темы */}
              <ThemeToggle />
              
              {/* Кнопка добавления сотрудника */}
              {(session.user.role === 'OWNER' || session.user.role === 'HR_ADMIN' || session.user.role === 'HR') && (
                <Button
                  onClick={() => router.push('/employees/new')}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Добавить сотрудника
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EmployeeList 
          showOnlyUrgent={showOnlyUrgent}
          userRole={session.user.role}
          userDepartment={session.user.department}
        />
      </main>

      {/* PWA Installer */}
      <PWAInstaller />
    </div>
  )
}