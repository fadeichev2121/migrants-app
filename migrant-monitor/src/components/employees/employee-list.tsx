'use client'

import { useEffect, useState } from 'react'
import { Status } from '@prisma/client'
import EmployeeCard from './employee-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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

  useEffect(() => {
    fetchEmployees()
  }, [showOnlyUrgent])

  const fetchEmployees = async () => {
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
  }

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
      <div className="flex items-center justify-center py-12">
        <div className="text-lg text-gray-600 dark:text-gray-400">Загрузка сотрудников...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'active' | 'sent')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active" className="flex items-center gap-2">
            Активные ({activeEmployees.length})
          </TabsTrigger>
          <TabsTrigger value="sent" className="flex items-center gap-2">
            Отправленные ({sentEmployees.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4 mt-6">
          {activeEmployees.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">✅</div>
              <div className="text-lg text-gray-600 dark:text-gray-400">Всё в порядке</div>
              <div className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                Нет сотрудников с проблемными документами
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {activeEmployees.map(employee => (
                <EmployeeCard
                  key={employee.id}
                  employee={employee}
                  onUpdate={handleEmployeeUpdate}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sent" className="space-y-4 mt-6">
          {sentEmployees.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">✉️</div>
              <div className="text-lg text-gray-600 dark:text-gray-400">Пока ничего не отправлено</div>
              <div className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                Сотрудники с отправленными уведомлениями появятся здесь
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {sentEmployees.map(employee => (
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
  )
}