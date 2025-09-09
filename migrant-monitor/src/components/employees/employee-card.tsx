'use client'

import { useState } from 'react'
import { Status, UserRole } from '@prisma/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Phone, 
  MessageCircle, 
  Send,
  Check,
  X,
  Calendar,
  MessageSquare,
  Paperclip
} from 'lucide-react'
import { 
  formatPhone, 
  generateWhatsAppLink, 
  generateTelegramLink, 
  generateCallLink,
  getEmployeeProblems,
  generateWhatsAppMessage,
  isDateExpired,
  isDateExpiringSoon,
  normalizePhone
} from '@/lib/utils'
import DateEditor from './date-editor'
import CommentEditor from './comment-editor'

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

interface EmployeeCardProps {
  employee: Employee
  onUpdate: (employee: Employee) => void
  userRole: UserRole
}

export default function EmployeeCard({ employee, onUpdate, userRole }: EmployeeCardProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  
  const problems = getEmployeeProblems(employee)
  const hasValidPhone = employee.phone && normalizePhone(employee.phone).length >= 10
  const whatsappMessage = generateWhatsAppMessage(employee)

  const handleStatusToggle = async () => {
    setIsUpdating(true)
    try {
      const newStatus = employee.status === Status.ACTIVE ? Status.SENT : Status.ACTIVE
      
      const response = await fetch(`/api/employees/${employee.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
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

  const getDateStatus = (date: Date | null) => {
    if (!date) return 'normal'
    if (isDateExpired(date)) return 'expired'
    if (isDateExpiringSoon(date)) return 'expiring'
    return 'normal'
  }

  const getDateClassName = (status: string) => {
    switch (status) {
      case 'expired':
        return 'bg-red-100 text-red-900 border-red-200'
      case 'expiring':
        return 'bg-yellow-100 text-yellow-900 border-yellow-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {employee.number && (
              <span className="text-sm text-gray-500 font-mono">
                №{employee.number}
              </span>
            )}
            <h3 className="text-lg font-bold text-gray-900">
              {employee.fullName}
            </h3>
            {employee.status === Status.SENT && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Check className="w-3 h-3" />
                Отправлено
              </Badge>
            )}
          </div>
          
          {employee.department && (
            <Badge variant="outline">{employee.department}</Badge>
          )}
        </div>

        {/* Проблемы */}
        {problems.length > 0 && (
          <div className="mb-4">
            <div className="space-y-2">
              {problems.map((problem, index) => (
                <div key={index} className="text-red-600 text-sm">
                  {problem}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Даты документов */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <DateEditor
            label="Патент"
            date={employee.patentDate}
            onUpdate={(date) => handleDateUpdate('patentDate', date)}
            className={getDateClassName(getDateStatus(employee.patentDate))}
            disabled={!['OWNER', 'HR_ADMIN', 'HR'].includes(userRole)}
          />
          
          <DateEditor
            label="Регистрация"
            date={employee.registrationDate}
            onUpdate={(date) => handleDateUpdate('registrationDate', date)}
            className={getDateClassName(getDateStatus(employee.registrationDate))}
            disabled={!['OWNER', 'HR_ADMIN', 'HR'].includes(userRole)}
          />
          
          <DateEditor
            label="Паспорт"
            date={employee.passportDate}
            onUpdate={(date) => handleDateUpdate('passportDate', date)}
            className={getDateClassName(getDateStatus(employee.passportDate))}
            disabled={!['OWNER', 'HR_ADMIN', 'HR'].includes(userRole)}
          />
          
          <DateEditor
            label="Чек"
            date={employee.checkDate}
            onUpdate={(date) => handleDateUpdate('checkDate', date)}
            className={getDateClassName(getDateStatus(employee.checkDate))}
            disabled={!['OWNER', 'HR_ADMIN', 'HR'].includes(userRole)}
          />
        </div>

        {/* Комментарий */}
        <div className="mb-4">
          <CommentEditor
            comment={employee.comment || ''}
            onUpdate={handleCommentUpdate}
            disabled={!['OWNER', 'HR_ADMIN', 'HR', 'MANAGER'].includes(userRole)}
          />
        </div>

        {/* Телефон и действия */}
        <div className="space-y-3">
          {employee.phone && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Телефон:</span> {formatPhone(employee.phone)}
            </div>
          )}
          
          {/* Кнопки действий */}
          <div className="flex flex-wrap gap-2">
            {hasValidPhone && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(generateWhatsAppLink(employee.phone!, whatsappMessage), '_blank')}
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(generateTelegramLink(employee.phone!), '_blank')}
                  className="flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Telegram
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(generateCallLink(employee.phone!), '_blank')}
                  className="flex items-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  Позвонить
                </Button>
              </>
            )}
            
            {/* Кнопка отправлено/отменить */}
            {['OWNER', 'HR_ADMIN', 'HR', 'MANAGER'].includes(userRole) && (
              <Button
                size="sm"
                variant={employee.status === Status.SENT ? "destructive" : "default"}
                onClick={handleStatusToggle}
                disabled={isUpdating}
                className="flex items-center gap-2"
              >
                {employee.status === Status.SENT ? (
                  <>
                    <X className="w-4 h-4" />
                    Отменить
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Отправлено
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}