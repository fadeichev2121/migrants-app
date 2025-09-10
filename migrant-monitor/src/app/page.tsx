'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import EmployeeList from '@/components/employees/employee-list'
import PWAInstaller from '@/components/pwa/pwa-installer'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Plus, Settings } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const [showOnlyUrgent, setShowOnlyUrgent] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Clean Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Монитор мигрантов
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Управление документами и уведомлениями
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/settings')}
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button onClick={() => router.push('/employees/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Добавить сотрудника
              </Button>
            </div>
          </div>
          
          {/* Filters */}
          <div className="mt-8 flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="urgent-filter"
                checked={showOnlyUrgent}
                onCheckedChange={setShowOnlyUrgent}
              />
              <Label htmlFor="urgent-filter" className="text-sm font-medium">
                Только срочные
              </Label>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <EmployeeList showOnlyUrgent={showOnlyUrgent} />
      </main>

      {/* PWA Installer */}
      <PWAInstaller />
    </div>
  )
}