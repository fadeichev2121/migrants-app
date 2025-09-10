'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import EmployeeList from '@/components/employees/employee-list'
import PWAInstaller from '@/components/pwa/pwa-installer'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Plus, Settings, Users, AlertTriangle, CheckCircle } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const [showOnlyUrgent, setShowOnlyUrgent] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Users className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Монитор мигрантов</h1>
                <p className="text-sm text-muted-foreground">Управление документами</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/settings')}
              >
                <Settings className="h-4 w-4" />
              </Button>
              <ThemeToggle />
              <Button onClick={() => router.push('/employees/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Добавить сотрудника
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-semibold mb-2">Уведомления WhatsApp</h1>
          <p className="text-muted-foreground mb-6">
            Отслеживайте сроки документов и отправляйте автоматические уведомления
          </p>
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="urgent-filter"
                checked={showOnlyUrgent}
                onCheckedChange={setShowOnlyUrgent}
              />
              <Label htmlFor="urgent-filter" className="text-sm font-medium">
                Показать только срочные
              </Label>
            </div>
          </div>
        </div>

        {/* Employee List */}
        <EmployeeList showOnlyUrgent={showOnlyUrgent} />
      </main>

      {/* PWA Installer */}
      <PWAInstaller />
    </div>
  )
}