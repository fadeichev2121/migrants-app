'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  Phone, 
  MessageCircle, 
  Send,
  Check,
  X,
  Building2,
  Clock,
  AlertTriangle,
  CheckCircle,
  FileText,
  Calendar,
  MessageSquare,
  Loader2
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

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  }

  const getPriorityBadge = () => {
    if (urgentProblems.length > 0) {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertTriangle className="h-3 w-3" />
          Срочно
        </Badge>
      )
    } else if (warningProblems.length > 0) {
      return (
        <Badge variant="secondary" className="gap-1">
          <Clock className="h-3 w-3" />
          Внимание
        </Badge>
      )
    } else {
      return (
        <Badge variant="outline" className="gap-1">
          <CheckCircle className="h-3 w-3" />
          В порядке
        </Badge>
      )
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                {employee.number || getInitials(employee.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <CardTitle className="text-lg">{employee.fullName}</CardTitle>
              {employee.department && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  {employee.department}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {employee.sent && (
              <Badge className="gap-1">
                <Check className="h-3 w-3" />
                Отправлено
              </Badge>
            )}
            {getPriorityBadge()}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Problems Section */}
        {urgentProblems.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Требует немедленного внимания</AlertTitle>
            <AlertDescription>
              <ul className="mt-2 space-y-1">
                {urgentProblems.map((problem, index) => (
                  <li key={index} className="text-sm">• {problem.message}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {warningProblems.length > 0 && urgentProblems.length === 0 && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertTitle>Обратите внимание</AlertTitle>
            <AlertDescription>
              <ul className="mt-2 space-y-1">
                {warningProblems.map((problem, index) => (
                  <li key={index} className="text-sm">• {problem.message}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Document Dates */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-sm font-medium">Даты документов</h4>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <DateEditor
              label="Патент"
              date={employee.patentDate}
              onUpdate={(date) => {
                // Handle date update
              }}
            />
            <DateEditor
              label="Регистрация"
              date={employee.registrationDate}
              onUpdate={(date) => {
                // Handle date update
              }}
            />
            <DateEditor
              label="Паспорт"
              date={employee.passportDate}
              onUpdate={(date) => {
                // Handle date update
              }}
            />
            <DateEditor
              label="Чек"
              date={employee.checkDate}
              onUpdate={(date) => {
                // Handle date update
              }}
            />
          </div>
        </div>

        {/* Comment */}
        {employee.comment && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-medium">Комментарий</h4>
            </div>
            <p className="text-sm text-muted-foreground bg-muted rounded-lg p-3">
              {employee.comment}
            </p>
          </div>
        )}

        {/* Contact Info */}
        {employee.phone && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-medium">Контакт</h4>
            </div>
            <p className="text-sm font-mono">{formatPhone(employee.phone)}</p>
          </div>
        )}

        <Separator />

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          {hasValidPhone && whatsappMessage && (
            <>
              <Button 
                size="sm"
                onClick={() => window.open(generateWhatsAppLink(employee.phone!, whatsappMessage), '_blank')}
                className="gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </Button>
              
              <Button 
                size="sm"
                variant="secondary"
                onClick={() => window.open(generateTelegramLink(employee.phone!), '_blank')}
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                Telegram
              </Button>
              
              <Button 
                size="sm"
                variant="secondary"
                onClick={() => window.open(generateCallLink(employee.phone!), '_blank')}
                className="gap-2"
              >
                <Phone className="h-4 w-4" />
                Позвонить
              </Button>
            </>
          )}
          
          <Button
            size="sm"
            variant={employee.sent ? "destructive" : "default"}
            onClick={handleStatusToggle}
            disabled={isUpdating}
            className="gap-2 ml-auto"
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

        {/* Documents Toggle */}
        <div className="space-y-4">
          <Button
            variant="outline"
            onClick={() => setShowDocuments(!showDocuments)}
            className="w-full gap-2"
          >
            <FileText className="h-4 w-4" />
            {showDocuments ? 'Скрыть документы' : 'Показать документы'}
          </Button>
          
          {showDocuments && (
            <DocumentManager employeeId={employee.id} />
          )}
        </div>
      </CardContent>
    </Card>
  )
}