'use client'

import { useState, useEffect } from 'react'
// Убираем неиспользуемый импорт Status
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Phone, 
  MessageCircle, 
  Send,
  Check,
  X,
  Building2,
  Clock,
  AlertCircle,
  CheckCircle2,
  Zap,
  Paperclip
} from 'lucide-react'
import { 
  formatPhone, 
  generateWhatsAppLink, 
  generateTelegramLink, 
  generateCallLink,
  normalizePhone
} from '@/lib/utils'
import { 
  calculateEmployeeProblems,
  generateWhatsAppMessage,
  type UrgencySettings,
  type EmployeeUrgencyData
} from '@/lib/urgency'
import DateEditor from './date-editor'
import CommentEditor from './comment-editor'
import DocumentManager from './document-manager'

interface Employee extends EmployeeUrgencyData {
  number: number | null
  phone: string | null
  department: string | null
  comment: string | null
  sent: boolean
  createdAt: Date
  updatedAt: Date
}

interface EmployeeCardProps {
  employee: Employee
  onUpdate: (employee: Employee) => void
}

export default function EmployeeCard({ employee, onUpdate }: EmployeeCardProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [settings, setSettings] = useState<UrgencySettings | null>(null)
  const [showDocuments, setShowDocuments] = useState(false)
  
  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings({
          urgentDaysDefault: data.urgentDaysDefault,
          warnDaysDefault: data.warnDaysDefault,
          whatsappTemplate: data.whatsappTemplate,
          perFieldOverrides: data.perFieldOverrides || {}
        })
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
  }

  const problems = settings ? calculateEmployeeProblems(employee, settings) : []
  const hasValidPhone = employee.phone && normalizePhone(employee.phone).length >= 10
  const whatsappMessage = settings ? generateWhatsAppMessage(employee, settings) : ''

  const handleStatusToggle = async () => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/employees/${employee.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sent: !employee.sent })
      })

      if (response.ok) {
        const updatedEmployee = await response.json()
        onUpdate(updatedEmployee)
      }
    } catch (error) {
      console.error('Error updating status:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDateUpdate = async (field: string, date: Date | null) => {
    try {
      const response = await fetch(`/api/employees/${employee.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: date?.toISOString() })
      })

      if (response.ok) {
        const updatedEmployee = await response.json()
        onUpdate(updatedEmployee)
      }
    } catch (error) {
      console.error('Error updating date:', error)
    }
  }

  const handleCommentUpdate = async (comment: string) => {
    try {
      const response = await fetch(`/api/employees/${employee.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment })
      })

      if (response.ok) {
        const updatedEmployee = await response.json()
        onUpdate(updatedEmployee)
      }
    } catch (error) {
      console.error('Error updating comment:', error)
    }
  }

  const getDateStatusClass = (field: 'patent' | 'registration' | 'passport' | 'check', date: Date | null) => {
    if (!settings || !date) return 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600'
    
    const problem = calculateEmployeeProblems({ ...employee, [field + 'Date']: date }, settings)
      .find(p => p.field === field)
    
    if (!problem) return 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600'
    
    switch (problem.status) {
      case 'expired':
        return 'bg-gradient-to-br from-red-50 to-red-100 text-red-800 border-red-200 dark:from-red-900/30 dark:to-red-800/30 dark:text-red-200 dark:border-red-700/50'
      case 'urgent':
        return 'bg-gradient-to-br from-orange-50 to-red-100 text-orange-800 border-orange-200 dark:from-orange-900/30 dark:to-red-800/30 dark:text-orange-200 dark:border-orange-700/50'
      case 'warning':
        return 'bg-gradient-to-br from-amber-50 to-yellow-100 text-amber-800 border-amber-200 dark:from-amber-900/30 dark:to-yellow-800/30 dark:text-amber-200 dark:border-amber-700/50'
      default:
        return 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600'
    }
  }

  const getStatusIcon = (field: 'patent' | 'registration' | 'passport' | 'check', date: Date | null) => {
    if (!settings || !date) return <CheckCircle2 className="w-3 h-3 text-gray-500" />
    
    const problem = calculateEmployeeProblems({ ...employee, [field + 'Date']: date }, settings)
      .find(p => p.field === field)
    
    if (!problem) return <CheckCircle2 className="w-3 h-3 text-green-500" />
    
    switch (problem.status) {
      case 'expired':
        return <AlertCircle className="w-3 h-3 text-red-500" />
      case 'urgent':
        return <AlertCircle className="w-3 h-3 text-orange-500" />
      case 'warning':
        return <Clock className="w-3 h-3 text-amber-500" />
      default:
        return <CheckCircle2 className="w-3 h-3 text-green-500" />
    }
  }

  return (
    <Card className="group relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 dark:from-blue-400/5 dark:to-indigo-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <CardContent className="relative p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-lg shadow-lg shadow-blue-500/25">
              {employee.number || '?'}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                {employee.fullName}
              </h3>
              {employee.department && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Building2 className="w-4 h-4" />
                  {employee.department}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {employee.sent && (
              <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white border-0 shadow-lg shadow-emerald-500/25">
                <Check className="w-3 h-3 mr-1" />
                Отправлено
              </Badge>
            )}
          </div>
        </div>

        {/* Problems Alert */}
        {problems.length > 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 border border-red-200 dark:border-red-700/50">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertCircle className="w-4 h-4 text-white" />
              </div>
              <div className="space-y-2">
                {problems.map((problem, index) => (
                  <div key={index} className="text-red-800 dark:text-red-200 text-sm font-medium">
                    {problem.message}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Document Dates Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <DateEditor
            label="Патент"
            date={employee.patentDate}
            onUpdate={(date) => handleDateUpdate('patentDate', date)}
            className={getDateStatusClass('patent', employee.patentDate)}
            icon={getStatusIcon('patent', employee.patentDate)}
          />
          
          <DateEditor
            label="Регистрация"
            date={employee.registrationDate}
            onUpdate={(date) => handleDateUpdate('registrationDate', date)}
            className={getDateStatusClass('registration', employee.registrationDate)}
            icon={getStatusIcon('registration', employee.registrationDate)}
          />
          
          <DateEditor
            label="Паспорт"
            date={employee.passportDate}
            onUpdate={(date) => handleDateUpdate('passportDate', date)}
            className={getDateStatusClass('passport', employee.passportDate)}
            icon={getStatusIcon('passport', employee.passportDate)}
          />
          
          <DateEditor
            label="Чек"
            date={employee.checkDate}
            onUpdate={(date) => handleDateUpdate('checkDate', date)}
            className={getDateStatusClass('check', employee.checkDate)}
            icon={getStatusIcon('check', employee.checkDate)}
          />
        </div>

        {/* Comment */}
        <div className="mb-6">
          <CommentEditor
            comment={employee.comment || ''}
            onUpdate={handleCommentUpdate}
          />
        </div>

        {/* Documents Section */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => setShowDocuments(!showDocuments)}
            className="w-full rounded-2xl border-2 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <Paperclip className="w-4 h-4 mr-2" />
            {showDocuments ? 'Скрыть документы' : 'Показать документы'}
          </Button>
          
          {showDocuments && (
            <div className="mt-4">
              <DocumentManager employeeId={employee.id} />
            </div>
          )}
        </div>

        {/* Contact Info */}
        {employee.phone && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-800/30 border border-blue-200/50 dark:border-blue-700/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-500 flex items-center justify-center">
                <Phone className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">Телефон</p>
                <p className="text-lg font-bold text-blue-900 dark:text-blue-100">{formatPhone(employee.phone)}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          {hasValidPhone && whatsappMessage && (
            <>
              <Button
                size="sm"
                onClick={() => window.open(generateWhatsAppLink(employee.phone!, whatsappMessage), '_blank')}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 shadow-lg shadow-green-500/25 rounded-xl transition-all duration-200 transform hover:scale-105"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
              
              <Button
                size="sm"
                onClick={() => window.open(generateTelegramLink(employee.phone!), '_blank')}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 shadow-lg shadow-blue-500/25 rounded-xl transition-all duration-200 transform hover:scale-105"
              >
                <Send className="w-4 h-4 mr-2" />
                Telegram
              </Button>
              
              <Button
                size="sm"
                onClick={() => window.open(generateCallLink(employee.phone!), '_blank')}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg shadow-purple-500/25 rounded-xl transition-all duration-200 transform hover:scale-105"
              >
                <Phone className="w-4 h-4 mr-2" />
                Позвонить
              </Button>
            </>
          )}
          
          {/* Status Toggle */}
          <Button
            size="sm"
            onClick={handleStatusToggle}
            disabled={isUpdating}
            className={`
              ${employee.sent 
                ? 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600' 
                : 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600'
              } 
              text-white border-0 shadow-lg rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none
            `}
          >
            {isUpdating ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            ) : employee.sent ? (
              <X className="w-4 h-4 mr-2" />
            ) : (
              <Zap className="w-4 h-4 mr-2" />
            )}
            {employee.sent ? 'Отменить' : 'Отправлено'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}