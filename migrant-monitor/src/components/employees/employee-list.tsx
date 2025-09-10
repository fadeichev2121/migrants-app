'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import EmployeeCard from './employee-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  Send, 
  AlertTriangle, 
  CheckCircle, 
  Coffee,
  Plus,
  RefreshCw
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
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'active' | 'sent'>('active')

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams()
      
      if (showOnlyUrgent) {
        params.set('urgent', 'true')
      }

      const response = await fetch(`/api/employees?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setEmployees(data)
      } else {
        throw new Error('Failed to fetch employees')
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
      setError('Ошибка загрузки данных')
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
      <div className="space-y-8">
        {/* Stats Cards Skeleton */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </CardHeader>
            </Card>
          ))}
        </div>
        
        {/* List Skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Error State
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Ошибка загрузки</AlertTitle>
        <AlertDescription className="mt-2">
          {error}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchEmployees}
            className="mt-3"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Повторить
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего сотрудников</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}</div>
            <p className="text-xs text-muted-foreground">В системе</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Требуют внимания</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeEmployees.length}</div>
            <p className="text-xs text-muted-foreground">Активные задачи</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Уведомления отправлены</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sentEmployees.length}</div>
            <p className="text-xs text-muted-foreground">Завершено</p>
          </CardContent>
        </Card>
      </div>

      {/* Employee Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'active' | 'sent')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Активные ({activeEmployees.length})
          </TabsTrigger>
          <TabsTrigger value="sent" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Отправленные ({sentEmployees.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4 mt-6">
          {activeEmployees.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Coffee className="h-12 w-12 text-muted-foreground mb-4" />
                <CardTitle className="text-xl mb-2">Всё под контролем!</CardTitle>
                <CardDescription className="text-center mb-6">
                  Нет сотрудников с проблемными документами
                </CardDescription>
                <Button onClick={() => router.push('/employees/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить сотрудника
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
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

        <TabsContent value="sent" className="space-y-4 mt-6">
          {sentEmployees.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Send className="h-12 w-12 text-muted-foreground mb-4" />
                <CardTitle className="text-xl mb-2">Готовы к отправке</CardTitle>
                <CardDescription className="text-center">
                  Сотрудники с отправленными уведомлениями появятся здесь
                </CardDescription>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
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