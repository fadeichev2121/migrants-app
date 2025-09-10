'use client'

import { useState, useEffect } from 'react'
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
  Paperclip,
  Loader2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Crown,
  Target,
  Flame
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
  const [isExpanded, setIsExpanded] = useState(false)
  
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
  const urgentProblems = problems.filter(p => p.status === 'expired' || p.status === 'urgent')
  const warningProblems = problems.filter(p => p.status === 'warning')

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
    if (!settings || !date) return 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600'
    
    const problem = calculateEmployeeProblems({ ...employee, [field + 'Date']: date }, settings)
      .find(p => p.field === field)
    
    if (!problem) return 'bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-950/30 dark:to-green-900/30 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-700'
    
    switch (problem.status) {
      case 'expired':
        return 'bg-gradient-to-br from-red-50 via-red-100 to-pink-100 dark:from-red-950/40 dark:via-red-900/30 dark:to-pink-900/30 text-red-900 dark:text-red-200 border-red-300 dark:border-red-700 animate-pulse-soft'
      case 'urgent':
        return 'bg-gradient-to-br from-orange-50 via-amber-100 to-yellow-100 dark:from-orange-950/40 dark:via-amber-900/30 dark:to-yellow-900/30 text-orange-900 dark:text-orange-200 border-orange-300 dark:border-orange-700'
      case 'warning':
        return 'bg-gradient-to-br from-amber-50 to-yellow-100 dark:from-amber-950/30 dark:to-yellow-900/30 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-700'
      default:
        return 'bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-950/30 dark:to-green-900/30 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-700'
    }
  }

  const getStatusIcon = (field: 'patent' | 'registration' | 'passport' | 'check', date: Date | null) => {
    if (!settings || !date) return <CheckCircle2 className="w-4 h-4 text-gray-500" />
    
    const problem = calculateEmployeeProblems({ ...employee, [field + 'Date']: date }, settings)
      .find(p => p.field === field)
    
    if (!problem) return <CheckCircle2 className="w-4 h-4 text-emerald-500 animate-pulse" />
    
    switch (problem.status) {
      case 'expired':
        return <AlertCircle className="w-4 h-4 text-red-500 animate-pulse" />
      case 'urgent':
        return <Flame className="w-4 h-4 text-orange-500 animate-bounce" />
      case 'warning':
        return <Clock className="w-4 h-4 text-amber-500" />
      default:
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />
    }
  }

  const getPriorityGradient = () => {
    if (urgentProblems.length > 0) {
      return 'from-red-500/10 via-orange-500/10 to-pink-500/10'
    } else if (warningProblems.length > 0) {
      return 'from-amber-500/10 via-yellow-500/10 to-orange-500/10'
    } else {
      return 'from-emerald-500/10 via-green-500/10 to-blue-500/10'
    }
  }

  const getPriorityIcon = () => {
    if (urgentProblems.length > 0) {
      return <Flame className="w-5 h-5 text-red-500 animate-bounce" />
    } else if (warningProblems.length > 0) {
      return <Target className="w-5 h-5 text-amber-500 animate-pulse" />
    } else {
      return <Crown className="w-5 h-5 text-emerald-500 animate-float" />
    }
  }

  return (
    <Card className="group relative overflow-hidden bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-white/30 dark:border-gray-700/50 shadow-2xl hover:shadow-3xl transition-all duration-500 hover-lift mobile-card">
      {/* Dynamic gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getPriorityGradient()} opacity-50 group-hover:opacity-70 transition-opacity duration-300 animate-gradient`}></div>
      
      {/* Animated border */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-gradient"></div>
      
      <CardContent className="relative p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative group/avatar">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl blur-lg opacity-60 group-hover/avatar:opacity-100 transition-opacity animate-pulse-soft"></div>
              <div className="relative flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white font-black text-xl shadow-2xl hover-lift">
                <span className="animate-bounce-gentle">{employee.number || '?'}</span>
                <div className="absolute -top-1 -right-1">
                  {getPriorityIcon()}
                </div>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 truncate">
                {employee.fullName}
              </h3>
              {employee.department && (
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  <Building2 className="w-4 h-4" />
                  <span className="glass dark:glass-dark px-3 py-1 rounded-full">{employee.department}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {employee.sent && (
              <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white border-0 shadow-lg shadow-emerald-500/30 rounded-full px-4 py-2 animate-glow">
                <CheckCircle2 className="w-4 h-4 mr-2 animate-pulse" />
                Отправлено
              </Badge>
            )}
          </div>
        </div>

        {/* Problems Alert */}
        {urgentProblems.length > 0 && (
          <div className="mb-6 p-6 rounded-3xl bg-gradient-to-r from-red-50 via-orange-50 to-pink-50 dark:from-red-950/40 dark:via-orange-950/40 dark:to-pink-950/40 border-2 border-red-200 dark:border-red-800 shadow-xl animate-wiggle">
            <div className="flex items-start gap-4">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center shadow-lg animate-pulse">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div className="absolute inset-0 bg-red-400 rounded-2xl blur-lg opacity-30 animate-ping"></div>
              </div>
              <div className="space-y-3 flex-1">
                <h4 className="text-lg font-black text-red-900 dark:text-red-200 flex items-center gap-2">
                  <Flame className="w-5 h-5 animate-bounce" />
                  Требует немедленного внимания!
                </h4>
                {urgentProblems.map((problem, index) => (
                  <div key={index} className="text-red-800 dark:text-red-300 font-semibold flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    {problem.message}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Warning Problems */}
        {warningProblems.length > 0 && urgentProblems.length === 0 && (
          <div className="mb-6 p-6 rounded-3xl bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 border-2 border-amber-200 dark:border-amber-800 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 flex items-center justify-center shadow-lg">
                <Clock className="w-6 h-6 text-white animate-pulse" />
              </div>
              <div className="space-y-2 flex-1">
                <h4 className="text-lg font-black text-amber-900 dark:text-amber-200 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Обратите внимание
                </h4>
                {warningProblems.map((problem, index) => (
                  <div key={index} className="text-amber-800 dark:text-amber-300 font-semibold flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    {problem.message}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Success State */}
        {problems.length === 0 && (
          <div className="mb-6 p-6 rounded-3xl bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 border-2 border-emerald-200 dark:border-emerald-800 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 flex items-center justify-center shadow-lg animate-glow">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-black text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                  <Crown className="w-5 h-5 text-emerald-600 animate-bounce-gentle" />
                  Все документы в порядке!
                </h4>
                <p className="text-emerald-700 dark:text-emerald-300 font-medium">Никаких проблем не обнаружено</p>
              </div>
            </div>
          </div>
        )}

        {/* Compact/Expanded View Toggle */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full rounded-2xl border-2 glass dark:glass-dark hover:bg-purple-50 dark:hover:bg-purple-950/30 hover:border-purple-300 transition-all duration-300 hover-lift"
          >
            <Sparkles className="w-5 h-5 mr-3 text-purple-500" />
            <span className="font-bold">{isExpanded ? 'Свернуть детали' : 'Развернуть детали'}</span>
            {isExpanded ? <ChevronUp className="w-5 h-5 ml-3" /> : <ChevronDown className="w-5 h-5 ml-3" />}
          </Button>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="space-y-6 animate-slide-up">
            {/* Document Dates Grid */}
            <div className="grid grid-cols-2 gap-4">
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
            <CommentEditor
              comment={employee.comment || ''}
              onUpdate={handleCommentUpdate}
            />

            {/* Documents Section */}
            <div>
              <Button
                variant="outline"
                onClick={() => setShowDocuments(!showDocuments)}
                className="w-full rounded-2xl border-2 glass dark:glass-dark hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-300 transition-all duration-300 hover-lift mb-4"
              >
                <Paperclip className="w-5 h-5 mr-3 text-blue-500" />
                <span className="font-bold">{showDocuments ? 'Скрыть документы' : 'Управление документами'}</span>
                {showDocuments ? <ChevronUp className="w-5 h-5 ml-3" /> : <ChevronDown className="w-5 h-5 ml-3" />}
              </Button>
              
              {showDocuments && (
                <div className="animate-slide-up">
                  <DocumentManager employeeId={employee.id} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contact Info */}
        {employee.phone && (
          <div className="mb-6 p-6 rounded-3xl bg-gradient-to-r from-blue-50 via-cyan-50 to-purple-50 dark:from-blue-950/30 dark:via-cyan-950/30 dark:to-purple-950/30 border-2 border-blue-200/50 dark:border-blue-700/50 shadow-xl hover-lift">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div className="absolute inset-0 bg-blue-400 rounded-2xl blur-lg opacity-30 animate-pulse-soft"></div>
              </div>
              <div>
                <p className="text-sm font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider">Контакт</p>
                <p className="text-xl font-black text-blue-900 dark:text-blue-100">{formatPhone(employee.phone)}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3">
          {hasValidPhone && whatsappMessage && (
            <>
              <Button
                size="sm"
                onClick={() => window.open(generateWhatsAppLink(employee.phone!, whatsappMessage), '_blank')}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 shadow-xl shadow-green-500/30 rounded-2xl font-bold transition-all duration-300 hover:scale-105 hover-glow flex-1 sm:flex-none"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
              
              <Button
                size="sm"
                onClick={() => window.open(generateTelegramLink(employee.phone!), '_blank')}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 shadow-xl shadow-blue-500/30 rounded-2xl font-bold transition-all duration-300 hover:scale-105 hover-glow flex-1 sm:flex-none"
              >
                <Send className="w-4 h-4 mr-2" />
                Telegram
              </Button>
              
              <Button
                size="sm"
                onClick={() => window.open(generateCallLink(employee.phone!), '_blank')}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-xl shadow-purple-500/30 rounded-2xl font-bold transition-all duration-300 hover:scale-105 hover-glow col-span-2 sm:col-span-1 sm:flex-none"
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
                ? 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 shadow-red-500/30' 
                : 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 shadow-emerald-500/30'
              } 
              text-white border-0 shadow-xl rounded-2xl font-bold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:transform-none hover-glow
              ${hasValidPhone ? 'col-span-2 sm:col-span-1' : 'col-span-2'}
            `}
          >
            {isUpdating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : employee.sent ? (
              <X className="w-4 h-4 mr-2" />
            ) : (
              <Zap className="w-4 h-4 mr-2 animate-bounce" />
            )}
            <span>{employee.sent ? 'Отменить' : 'Отправлено'}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}