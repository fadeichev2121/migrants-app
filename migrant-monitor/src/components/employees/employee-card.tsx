'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { 
  Phone, 
  MessageCircle, 
  Send,
  Check,
  X,
  Building2,
  Calendar,
  MessageSquare,
  FileText,
  Loader2,
  Edit,
  ChevronRight
} from 'lucide-react'
import { 
  formatPhone, 
  generateWhatsAppLink, 
  generateTelegramLink, 
  generateCallLink,
  normalizePhone
} from '@/lib/utils'
import { 
  getDocumentStatus,
  getStatusClasses,
  formatDate,
  getEmployeeProblems,
  generateWhatsAppMessage
} from '@/lib/document-status'
import DateEditor from './date-editor'
import CommentEditor from './comment-editor'
import DocumentManager from './document-manager'

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

interface EmployeeCardProps {
  employee: Employee
  onUpdate: (employee: Employee) => void
}

export default function EmployeeCard({ employee, onUpdate }: EmployeeCardProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [showDocuments, setShowDocuments] = useState(false)
  
  const problems = getEmployeeProblems(employee)
  const hasValidPhone = employee.phone && normalizePhone(employee.phone).length >= 10
  const whatsappMessage = generateWhatsAppMessage(employee)

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

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  }

  const documentFields = [
    { key: 'patentDate', label: 'Патент', date: employee.patentDate },
    { key: 'registrationDate', label: 'Регистрация', date: employee.registrationDate },
    { key: 'passportDate', label: 'Паспорт', date: employee.passportDate },
    { key: 'checkDate', label: 'Чек', date: employee.checkDate }
  ]

  return (
    <Card className="shadow-sm hover:shadow-md transition-all duration-200 border-0 bg-white dark:bg-gray-900">
      <CardHeader className="pb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-14 w-14 ring-2 ring-gray-100 dark:ring-gray-800">
              <AvatarFallback className="bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-semibold text-lg">
                {getInitials(employee.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <CardTitle className="text-xl text-gray-900 dark:text-white">
                {employee.fullName}
              </CardTitle>
              {employee.department && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Building2 className="h-4 w-4" />
                  {employee.department}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {employee.sent && (
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 border-green-200 dark:border-green-800">
                <Check className="h-3 w-3 mr-1" />
                Отправлено
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Problems Alert */}
        {problems.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar className="h-4 w-4 text-red-500" />
              Проблемы с документами
            </h4>
            <div className="space-y-2">
              {problems.map((problem, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl border text-sm font-medium ${getStatusClasses(problem.status)}`}
                >
                  {problem.message}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Document Dates */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            Даты документов
          </h4>
          <div className="grid gap-4 sm:grid-cols-2">
            {documentFields.map(({ key, label, date }) => {
              const status = getDocumentStatus(date)
              return (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {label}
                    </span>
                    <DateEditor
                      field={key}
                      date={date}
                      onUpdate={(newDate) => {
                        // Handle date update
                        fetch(`/api/employees/${employee.id}`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ [key]: newDate?.toISOString() })
                        }).then(res => res.json()).then(onUpdate)
                      }}
                    />
                  </div>
                  <div className={`p-3 rounded-xl border text-center text-sm font-medium ${getStatusClasses(status)}`}>
                    {date ? formatDate(date) : 'Не указано'}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Comment */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-gray-500" />
              Комментарий
            </h4>
            <CommentEditor
              comment={employee.comment || ''}
              onUpdate={(comment) => {
                fetch(`/api/employees/${employee.id}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ comment })
                }).then(res => res.json()).then(onUpdate)
              }}
            />
          </div>
          {employee.comment && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {employee.comment}
              </p>
            </div>
          )}
        </div>

        {/* Contact */}
        {employee.phone && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-500" />
              Контакт
            </h4>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl">
              <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                {formatPhone(employee.phone)}
              </p>
            </div>
          </div>
        )}

        <Separator />

        {/* Actions */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            {hasValidPhone && whatsappMessage && (
              <>
                <Button 
                  size="sm"
                  onClick={() => window.open(generateWhatsAppLink(employee.phone!, whatsappMessage), '_blank')}
                  className="flex-1 sm:flex-none gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </Button>
                
                <Button 
                  size="sm"
                  variant="secondary"
                  onClick={() => window.open(generateTelegramLink(employee.phone!), '_blank')}
                  className="flex-1 sm:flex-none gap-2"
                >
                  <Send className="h-4 w-4" />
                  Telegram
                </Button>
                
                <Button 
                  size="sm"
                  variant="secondary"
                  onClick={() => window.open(generateCallLink(employee.phone!), '_blank')}
                  className="flex-1 sm:flex-none gap-2"
                >
                  <Phone className="h-4 w-4" />
                  Позвонить
                </Button>
              </>
            )}
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowDocuments(!showDocuments)}
              className="flex-1 gap-2"
            >
              <FileText className="h-4 w-4" />
              {showDocuments ? 'Скрыть документы' : 'Управление документами'}
              <ChevronRight className={`h-4 w-4 ml-auto transition-transform ${showDocuments ? 'rotate-90' : ''}`} />
            </Button>
            
            <Button
              size="sm"
              variant={employee.sent ? "destructive" : "default"}
              onClick={handleStatusToggle}
              disabled={isUpdating}
              className="gap-2"
            >
              {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : employee.sent ? (
                <X className="h-4 w-4" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              {employee.sent ? 'Отменить' : 'Отправлено'}
            </Button>
          </div>
        </div>

        {/* Documents Section */}
        {showDocuments && (
          <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
            <DocumentManager employeeId={employee.id} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}