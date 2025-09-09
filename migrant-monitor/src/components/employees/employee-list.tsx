'use client'

import { useEffect, useState, useCallback } from 'react'
import { Status } from '@prisma/client'
import EmployeeCard from './employee-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, Send, Sparkles, Coffee } from 'lucide-react'

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
  status: Status
  createdAt: Date
  updatedAt: Date
}

interface EmployeeListProps {
  showOnlyUrgent: boolean
}

export default function EmployeeList({ showOnlyUrgent }: EmployeeListProps) {
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
      } else {
        console.error('Failed to fetch employees')
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

  const activeEmployees = employees.filter(emp => emp.status === Status.ACTIVE)
  const sentEmployees = employees.filter(emp => emp.status === Status.SENT)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-blue-200 dark:border-blue-800"></div>
            <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-lg font-medium text-gray-600 dark:text-gray-400">Загрузка сотрудников...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Modern Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-3xl p-6 border border-blue-200/50 dark:border-blue-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 dark:text-blue-400 text-sm font-semibold uppercase tracking-wide">Всего сотрудников</p>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-1">{employees.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-900/30 dark:to-orange-800/30 rounded-3xl p-6 border border-amber-200/50 dark:border-amber-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-600 dark:text-amber-400 text-sm font-semibold uppercase tracking-wide">Требуют внимания</p>
              <p className="text-3xl font-bold text-amber-900 dark:text-amber-100 mt-1">{activeEmployees.length}</p>
            </div>
            <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-900/30 dark:to-green-800/30 rounded-3xl p-6 border border-emerald-200/50 dark:border-emerald-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-600 dark:text-emerald-400 text-sm font-semibold uppercase tracking-wide">Уведомления отправлены</p>
              <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100 mt-1">{sentEmployees.length}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center">
              <Send className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Modern Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'active' | 'sent')} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-1 border border-gray-200/50 dark:border-gray-700/50">
          <TabsTrigger 
            value="active" 
            className="flex items-center gap-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white rounded-xl font-semibold transition-all duration-200"
          >
            <Users className="w-4 h-4" />
            Активные ({activeEmployees.length})
          </TabsTrigger>
          <TabsTrigger 
            value="sent"
            className="flex items-center gap-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-green-500 data-[state=active]:text-white rounded-xl font-semibold transition-all duration-200"
          >
            <Send className="w-4 h-4" />
            Отправленные ({sentEmployees.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6 mt-8">
          {activeEmployees.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-green-200 dark:from-emerald-900/30 dark:to-green-800/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <Coffee className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Всё под контролем!</h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                Нет сотрудников с проблемными документами. Можно расслабиться и выпить кофе ☕
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {activeEmployees.map((employee, index) => (
                <div
                  key={employee.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <EmployeeCard
                    employee={employee}
                    onUpdate={handleEmployeeUpdate}
                  />
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sent" className="space-y-6 mt-8">
          {sentEmployees.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-900/30 dark:to-indigo-800/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <Send className="w-12 h-12 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Готовы к отправке</h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                Сотрудники с отправленными уведомлениями появятся здесь
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {sentEmployees.map((employee, index) => (
                <div
                  key={employee.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <EmployeeCard
                    employee={employee}
                    onUpdate={handleEmployeeUpdate}
                  />
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}