'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import EmployeeList from '@/components/employees/employee-list'
import PWAInstaller from '@/components/pwa/pwa-installer'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { Button } from '@/components/ui/button'
import { Plus, Users, AlertTriangle, CheckCircle2, Settings, Sparkles, Zap, Rocket } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const [showOnlyUrgent, setShowOnlyUrgent] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-purple-950/30 dark:to-pink-950/30 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-pink-400/20 to-red-600/20 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-gradient-to-r from-green-400/20 to-blue-600/20 rounded-full blur-3xl animate-float" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Futuristic Header */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-white/70 dark:bg-gray-950/70 border-b border-white/20 dark:border-gray-800/50 shadow-2xl shadow-purple-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur-lg opacity-60 group-hover:opacity-100 animate-pulse-soft"></div>
                <div className="relative flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-2xl shadow-purple-500/30 hover-lift">
                  <Users className="w-8 h-8 text-white animate-bounce-gentle" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent animate-gradient">
                  Монитор мигрантов
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-500 animate-pulse" />
                  Управление документами нового поколения
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Futuristic Filter Toggle */}
              <div className="glass dark:glass-dark rounded-3xl px-6 py-3 border border-white/30 dark:border-gray-700/50 shadow-xl hover-lift">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <AlertTriangle className="w-5 h-5 text-amber-500 animate-pulse" />
                    <div className="absolute inset-0 bg-amber-400 rounded-full blur-md opacity-30 animate-ping"></div>
                  </div>
                  <input
                    type="checkbox"
                    checked={showOnlyUrgent}
                    onChange={(e) => setShowOnlyUrgent(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`relative w-12 h-6 rounded-full transition-all duration-300 ${showOnlyUrgent ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-lg transition-all duration-300 ${showOnlyUrgent ? 'translate-x-6' : 'translate-x-0'}`}>
                      {showOnlyUrgent && <Zap className="w-3 h-3 text-orange-500 m-1" />}
                    </div>
                  </div>
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Только срочные</span>
                </label>
              </div>
              
              {/* Settings and Theme */}
              <div className="flex items-center gap-3 glass dark:glass-dark rounded-3xl p-2 border border-white/30 dark:border-gray-700/50 shadow-xl">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/settings')}
                  className="h-10 w-10 p-0 rounded-2xl hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all duration-300 hover:scale-110"
                >
                  <Settings className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </Button>
                <ThemeToggle />
              </div>
              
              {/* Futuristic Add Button */}
              <Button
                onClick={() => router.push('/employees/new')}
                className="relative group bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-2xl shadow-purple-500/30 rounded-3xl px-8 py-4 font-black text-lg transition-all duration-300 transform hover:scale-105 hover-glow overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center gap-3">
                  <div className="relative">
                    <Plus className="w-6 h-6 transition-transform duration-300 group-hover:rotate-90" />
                    <div className="absolute inset-0 bg-white rounded-full blur-sm opacity-0 group-hover:opacity-50 animate-ping"></div>
                  </div>
                  <span>Добавить сотрудника</span>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-3 glass dark:glass-dark text-purple-700 dark:text-purple-300 px-6 py-3 rounded-full text-sm font-bold mb-8 hover-lift animate-scale-in">
            <Rocket className="w-5 h-5 animate-bounce" />
            <span>Система мониторинга активна</span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-6 animate-gradient leading-tight">
            Мониторинг документов<br />
            <span className="text-3xl md:text-5xl">в реальном времени</span>
          </h2>
          
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed animate-slide-up">
            Автоматические уведомления, умная аналитика и современный интерфейс 
            для эффективного управления документами мигрантов
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <EmployeeList showOnlyUrgent={showOnlyUrgent} />
      </main>

      {/* PWA Installer */}
      <PWAInstaller />
    </div>
  )
}