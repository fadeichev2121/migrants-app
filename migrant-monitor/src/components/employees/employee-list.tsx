'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import EmployeeCard from './employee-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  Send, 
  AlertTriangle, 
  CheckCircle, 
  Coffee,
  Plus,
  TrendingUp,
  Clock
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

  // Loading State
  if (loading) {
    return (
      <div className="space-y-12">
        {/* Stats Cards Skeleton */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-8">
              <div className="space-y-4">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            </Card>
          ))}
        </div>
        
        {/* List Skeleton */}
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-8">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <Skeleton className="h-20 w-full" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-12">
      {/* Clean Stats Cards */}
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
                {employees.length}
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
                {activeEmployees.length}
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
                Уведомления отправлены
              </p>
              <p className="text-3xl font-semibold text-gray-900 dark:text-white">
                {sentEmployees.length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Clean Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'active' | 'sent')}>
        <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-800">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Активные ({activeEmployees.length})
          </TabsTrigger>
          <TabsTrigger value="sent" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Отправленные ({sentEmployees.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6 mt-8">
          {activeEmployees.length === 0 ? (
            <Card className="p-16">
              <CardContent className="text-center space-y-4">
                <Coffee className="h-16 w-16 text-gray-400 mx-auto" />
                <CardTitle className="text-xl text-gray-900 dark:text-white">
                  Всё под контролем!
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                  Нет сотрудников с проблемными документами. Все документы в порядке.
                </p>
                <Button onClick={() => router.push('/employees/new')} className="mt-6">
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить сотрудника
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
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

        <TabsContent value="sent" className="space-y-6 mt-8">
          {sentEmployees.length === 0 ? (
            <Card className="p-16">
              <CardContent className="text-center space-y-4">
                <Send className="h-16 w-16 text-gray-400 mx-auto" />
                <CardTitle className="text-xl text-gray-900 dark:text-white">
                  Готовы к отправке
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                  Сотрудники с отправленными уведомлениями появятся здесь
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
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
  )
}