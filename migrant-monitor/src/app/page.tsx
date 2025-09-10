'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import EmployeeList from '@/components/employees/employee-list'
import PWAInstaller from '@/components/pwa/pwa-installer'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { Button } from '@/components/ui/button'
import { Plus, Users, AlertTriangle, CheckCircle2, Settings } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const [showOnlyUrgent, setShowOnlyUrgent] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/30">
      {/* Modern Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-white/20 dark:border-gray-700/50 shadow-lg shadow-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Монитор мигрантов
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
                  Управление документами и уведомлениями
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Modern Filter Toggle */}
              <div className="flex items-center space-x-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl px-4 py-2 border border-white/20 dark:border-gray-700/50">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showOnlyUrgent}
                    onChange={(e) => setShowOnlyUrgent(e.target.checked)}
                    className="w-4 h-4 rounded border-2 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 transition-all"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Только срочные</span>
                </label>
              </div>
              
              {/* Settings and Theme */}
              <div className="flex items-center gap-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-2 border border-white/20 dark:border-gray-700/50">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/settings')}
                  className="h-8 w-8 p-0 hover:bg-white/60 dark:hover:bg-gray-700/60"
                >
                  <Settings className="h-4 w-4" />
                </Button>
                <ThemeToggle />
              </div>
              
              {/* Add Employee Button */}
              <Button
                onClick={() => router.push('/employees/new')}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 rounded-2xl px-6 py-3 font-semibold transition-all duration-200 transform hover:scale-105 hover:shadow-xl hover:shadow-blue-500/30"
              >
                <Plus className="w-5 h-5 mr-2" />
                Добавить сотрудника
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 dark:from-blue-400/5 dark:to-indigo-400/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <CheckCircle2 className="w-4 h-4" />
              <span>Система уведомлений активна</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Отслеживание документов в реальном времени
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Автоматические уведомления через WhatsApp и Telegram о просроченных и истекающих документах
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <EmployeeList 
          showOnlyUrgent={showOnlyUrgent}
        />
      </main>

      {/* PWA Installer */}
      <PWAInstaller />
    </div>
  )
}