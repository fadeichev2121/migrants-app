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
    <>
      {/* КАРДИНАЛЬНО НОВЫЙ ДИЗАЙН */}
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
      }}>
        {/* Современный Header */}
        <header style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          padding: '24px 0'
        }}>
        <div className="mobile-container" style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
            <div>
              <h1 style={{
                fontSize: '32px',
                fontWeight: '700',
                color: '#1f2937',
                margin: '0 0 8px 0'
              }}>
                Монитор мигрантов
              </h1>
              <p style={{
                fontSize: '16px',
                color: '#6b7280',
                margin: 0
              }}>
                Современная система управления документами
              </p>
            </div>
            
            <div style={{ 
              display: 'flex', 
              gap: '16px', 
              alignItems: 'center',
              flexWrap: 'wrap'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: 'rgba(255, 255, 255, 0.8)',
                padding: '12px 20px',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}>
                <Switch
                  id="urgent-filter"
                  checked={showOnlyUrgent}
                  onCheckedChange={setShowOnlyUrgent}
                />
                <Label htmlFor="urgent-filter" style={{ fontSize: '14px', fontWeight: '500' }}>
                  Только срочные
                </Label>
              </div>
              
              <ThemeToggle />
              
              <Button
                onClick={() => router.push('/settings')}
                variant="ghost"
                size="sm"
                style={{
                  background: 'rgba(255, 255, 255, 0.8)',
                  borderRadius: '12px',
                  padding: '12px'
                }}
              >
                <Settings className="h-5 w-5" />
              </Button>
              
              <Button
                onClick={() => router.push('/employees/new')}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '16px',
                  padding: '16px 24px',
                  fontSize: '16px',
                  fontWeight: '600',
                  boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)',
                  transition: 'all 0.3s ease'
                }}
              >
                <Plus className="h-5 w-5 mr-2" />
                Добавить сотрудника
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="mobile-container" style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '48px 32px'
        }}>
          <EmployeeList showOnlyUrgent={showOnlyUrgent} />
        </main>

        <PWAInstaller />
      </div>
    </>
  )
}