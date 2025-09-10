'use client'

import { useEffect, useState, useCallback } from 'react'
import EmployeeCard from './employee-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, 
  Send, 
  Coffee, 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Zap,
  Crown,
  Target,
  Rocket
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

  const activeEmployees = employees.filter(emp => !emp.sent)
  const sentEmployees = employees.filter(emp => emp.sent)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-purple-200 dark:border-purple-800"></div>
            <div className="absolute top-0 left-0 w-20 h-20 rounded-full border-4 border-purple-600 border-t-transparent animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-purple-500 animate-pulse" />
            </div>
          </div>
          <p className="text-xl font-bold text-gray-600 dark:text-gray-400">Загрузка данных...</p>
          <div className="flex gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Futuristic Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="group relative overflow-hidden glass dark:glass-dark rounded-3xl p-8 border border-white/30 dark:border-gray-700/50 shadow-2xl hover-lift">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 animate-gradient"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-blue-600 dark:text-blue-400 text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <Users className="w-4 h-4" />
                Всего сотрудников
              </p>
              <p className="text-4xl font-black text-blue-900 dark:text-blue-100 mt-2 animate-scale-in">
                {employees.length}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Активная база</span>
              </div>
            </div>
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-xl animate-float">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="absolute inset-0 bg-blue-400 rounded-2xl blur-xl opacity-30 animate-pulse-soft"></div>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden glass dark:glass-dark rounded-3xl p-8 border border-white/30 dark:border-gray-700/50 shadow-2xl hover-lift">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 animate-gradient"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-amber-600 dark:text-amber-400 text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 animate-pulse" />
                Требуют внимания
              </p>
              <p className="text-4xl font-black text-amber-900 dark:text-amber-100 mt-2 animate-scale-in">
                {activeEmployees.length}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Target className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">Активные задачи</span>
              </div>
            </div>
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-xl animate-bounce-gentle">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div className="absolute inset-0 bg-amber-400 rounded-2xl blur-xl opacity-30 animate-ping"></div>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden glass dark:glass-dark rounded-3xl p-8 border border-white/30 dark:border-gray-700/50 shadow-2xl hover-lift">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-green-500/10 animate-gradient"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-emerald-600 dark:text-emerald-400 text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Уведомления отправлены
              </p>
              <p className="text-4xl font-black text-emerald-900 dark:text-emerald-100 mt-2 animate-scale-in">
                {sentEmployees.length}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Crown className="w-4 h-4 text-emerald-500 animate-bounce-gentle" />
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Завершено</span>
              </div>
            </div>
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center shadow-xl animate-glow">
                <Send className="w-8 h-8 text-white" />
              </div>
              <div className="absolute inset-0 bg-emerald-400 rounded-2xl blur-xl opacity-30 animate-pulse-soft"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'active' | 'sent')} className="w-full">
        <TabsList className="grid w-full grid-cols-2 glass dark:glass-dark rounded-3xl p-2 border border-white/30 dark:border-gray-700/50 shadow-xl">
          <TabsTrigger 
            value="active" 
            className="flex items-center gap-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white rounded-2xl font-black transition-all duration-300 hover:scale-105"
          >
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              <span>Активные</span>
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-black">
                {activeEmployees.length}
              </div>
            </div>
          </TabsTrigger>
          <TabsTrigger 
            value="sent"
            className="flex items-center gap-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-green-500 data-[state=active]:text-white rounded-2xl font-black transition-all duration-300 hover:scale-105"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>Отправленные</span>
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-black">
                {sentEmployees.length}
              </div>
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6 mt-8">
          {activeEmployees.length === 0 ? (
            <div className="text-center py-20 animate-scale-in">
              <div className="relative mb-8">
                <div className="w-32 h-32 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center mx-auto shadow-2xl animate-float">
                  <Coffee className="w-16 h-16 text-white" />
                </div>
                <div className="absolute inset-0 bg-emerald-400 rounded-full blur-2xl opacity-30 animate-pulse-soft"></div>
                <Sparkles className="absolute top-4 right-4 w-8 h-8 text-emerald-300 animate-bounce" />
              </div>
              <h3 className="text-3xl font-black bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-4">
                Идеальный порядок! ✨
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto text-lg leading-relaxed">
                Все документы в порядке, можно расслабиться и насладиться кофе ☕
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {activeEmployees.map((employee, index) => (
                <div
                  key={employee.id}
                  className="animate-slide-up"
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
            <div className="text-center py-20 animate-scale-in">
              <div className="relative mb-8">
                <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto shadow-2xl animate-float">
                  <Rocket className="w-16 h-16 text-white" />
                </div>
                <div className="absolute inset-0 bg-blue-400 rounded-full blur-2xl opacity-30 animate-pulse-soft"></div>
                <Sparkles className="absolute top-4 left-4 w-6 h-6 text-blue-300 animate-ping" />
                <Target className="absolute bottom-4 right-4 w-6 h-6 text-purple-300 animate-bounce" />
              </div>
              <h3 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                Готовы к запуску! 🚀
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto text-lg leading-relaxed">
                Уведомления будут отправлены и сотрудники появятся здесь
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {sentEmployees.map((employee, index) => (
                <div
                  key={employee.id}
                  className="animate-slide-up"
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