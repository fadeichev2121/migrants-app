'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import EmployeeCard from './employee-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  Send, 
  AlertTriangle, 
  CheckCircle, 
  Coffee,
  Plus,
  TrendingUp
} from 'lucide-react'

interface Employee {
  id: string
  number: number | null
  fullName: string
  phone: string | null
  department: string | null
  patentDate: Date | null
  registrationDate: Date | null
  passportDate: Date | null
  checkDate: Date | null
  comment: string | null
  sent: boolean
  createdAt: Date
  updatedAt: Date
}

interface EmployeeListProps {
  showOnlyUrgent: boolean
}

export default function EmployeeList({ showOnlyUrgent }: EmployeeListProps) {
  const router = useRouter()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'active' | 'sent'>('active')

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (showOnlyUrgent) {
        params.set('urgent', 'true')
      }

      const response = await fetch(`/api/employees?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setEmployees(data)
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
    } finally {
      setLoading(false)
    }
  }, [showOnlyUrgent])

  useEffect(() => {
    fetchEmployees()
  }, [showOnlyUrgent, fetchEmployees])

  const handleEmployeeUpdate = (updatedEmployee: Employee) => {
    setEmployees(prev => 
      prev.map(emp => 
        emp.id === updatedEmployee.id ? updatedEmployee : emp
      )
    )
  }

  const activeEmployees = employees.filter(emp => !emp.sent)
  const sentEmployees = employees.filter(emp => emp.sent)

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid #f3f4f6',
          borderTop: '4px solid #667eea',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
      {/* НОВЫЕ СТАТИСТИЧЕСКИЕ КАРТЫ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '32px'
      }}>
        {/* Всего сотрудников */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '32px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Users style={{ width: '32px', height: '32px', color: 'white' }} />
            </div>
            <div>
              <p style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#6b7280',
                margin: '0 0 8px 0',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Всего сотрудников
              </p>
              <p style={{
                fontSize: '36px',
                fontWeight: '700',
                color: '#1f2937',
                margin: 0
              }}>
                {employees.length}
              </p>
            </div>
          </div>
        </div>

        {/* Требуют внимания */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '32px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertTriangle style={{ width: '32px', height: '32px', color: 'white' }} />
            </div>
            <div>
              <p style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#6b7280',
                margin: '0 0 8px 0',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Требуют внимания
              </p>
              <p style={{
                fontSize: '36px',
                fontWeight: '700',
                color: '#1f2937',
                margin: 0
              }}>
                {activeEmployees.length}
              </p>
            </div>
          </div>
        </div>

        {/* Отправлены */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '32px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CheckCircle style={{ width: '32px', height: '32px', color: 'white' }} />
            </div>
            <div>
              <p style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#6b7280',
                margin: '0 0 8px 0',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Уведомления отправлены
              </p>
              <p style={{
                fontSize: '36px',
                fontWeight: '700',
                color: '#1f2937',
                margin: 0
              }}>
                {sentEmployees.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* НОВЫЕ ТАБЫ */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '8px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'active' | 'sent')}>
          <TabsList style={{
            background: 'transparent',
            border: 'none',
            width: '100%',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px'
          }}>
            <TabsTrigger 
              value="active"
              style={{
                background: activeTab === 'active' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'transparent',
                color: activeTab === 'active' ? 'white' : '#6b7280',
                borderRadius: '16px',
                padding: '16px 24px',
                fontWeight: '600',
                border: 'none',
                transition: 'all 0.3s ease'
              }}
            >
              <AlertTriangle className="h-5 w-5 mr-2" />
              Активные ({activeEmployees.length})
            </TabsTrigger>
            <TabsTrigger 
              value="sent"
              style={{
                background: activeTab === 'sent' ? 'linear-gradient(135deg, #10b981, #059669)' : 'transparent',
                color: activeTab === 'sent' ? 'white' : '#6b7280',
                borderRadius: '16px',
                padding: '16px 24px',
                fontWeight: '600',
                border: 'none',
                transition: 'all 0.3s ease'
              }}
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              Отправленные ({sentEmployees.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" style={{ marginTop: '32px' }}>
            {activeEmployees.length === 0 ? (
              <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '24px',
                padding: '64px 32px',
                textAlign: 'center',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
              }}>
                <Coffee style={{ width: '64px', height: '64px', color: '#6b7280', margin: '0 auto 24px' }} />
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#1f2937',
                  margin: '0 0 16px 0'
                }}>
                  Всё под контролем! ✨
                </h3>
                <p style={{
                  fontSize: '16px',
                  color: '#6b7280',
                  margin: '0 0 32px 0',
                  maxWidth: '400px',
                  marginLeft: 'auto',
                  marginRight: 'auto'
                }}>
                  Нет сотрудников с проблемными документами
                </p>
                <Button 
                  onClick={() => router.push('/employees/new')}
                  style={{
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    color: 'white',
                    borderRadius: '16px',
                    padding: '16px 32px',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Добавить сотрудника
                </Button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {activeEmployees.map((employee) => (
                  <EmployeeCard
                    key={employee.id}
                    employee={employee}
                    onUpdate={handleEmployeeUpdate}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sent" style={{ marginTop: '32px' }}>
            {sentEmployees.length === 0 ? (
              <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '24px',
                padding: '64px 32px',
                textAlign: 'center',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
              }}>
                <Send style={{ width: '64px', height: '64px', color: '#6b7280', margin: '0 auto 24px' }} />
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#1f2937',
                  margin: '0 0 16px 0'
                }}>
                  Готовы к отправке 🚀
                </h3>
                <p style={{
                  fontSize: '16px',
                  color: '#6b7280',
                  margin: 0
                }}>
                  Сотрудники с отправленными уведомлениями появятся здесь
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {sentEmployees.map((employee) => (
                  <EmployeeCard
                    key={employee.id}
                    employee={employee}
                    onUpdate={handleEmployeeUpdate}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}