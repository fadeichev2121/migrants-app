'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
  formatDate,
  getEmployeeProblems,
  generateWhatsAppMessage
} from '@/lib/document-status'
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

  const getStatusStyle = (date: Date | null) => {
    const status = getDocumentStatus(date)
    switch (status) {
      case 'expired':
        return {
          background: '#fef2f2',
          color: '#991b1b',
          border: '1px solid #fecaca'
        }
      case 'warning':
        return {
          background: '#fffbeb',
          color: '#92400e',
          border: '1px solid #fde68a'
        }
      case 'success':
        return {
          background: '#f0fdf4',
          color: '#166534',
          border: '1px solid #bbf7d0'
        }
      default:
        return {
          background: '#f9fafb',
          color: '#6b7280',
          border: '1px solid #e5e7eb'
        }
    }
  }

  const documentFields = [
    { key: 'patentDate', label: 'Патент', date: employee.patentDate },
    { key: 'registrationDate', label: 'Регистрация', date: employee.registrationDate },
    { key: 'passportDate', label: 'Паспорт', date: employee.passportDate },
    { key: 'checkDate', label: 'Чек', date: employee.checkDate }
  ]

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRadius: '24px',
      padding: '32px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s ease'
    }}>
      {/* НОВЫЙ HEADER */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '32px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Avatar style={{ width: '64px', height: '64px' }}>
            <AvatarFallback style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              fontSize: '20px',
              fontWeight: '700'
            }}>
              {getInitials(employee.fullName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#1f2937',
              margin: '0 0 8px 0'
            }}>
              {employee.fullName}
            </h3>
            {employee.department && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                color: '#6b7280'
              }}>
                <Building2 style={{ width: '16px', height: '16px' }} />
                {employee.department}
              </div>
            )}
          </div>
        </div>
        
        {employee.sent && (
          <Badge style={{
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '8px 16px',
            fontSize: '12px',
            fontWeight: '600'
          }}>
            <Check style={{ width: '12px', height: '12px', marginRight: '4px' }} />
            Отправлено
          </Badge>
        )}
      </div>

      {/* ПРОБЛЕМЫ */}
      {problems.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
          borderRadius: '20px',
          padding: '24px',
          marginBottom: '32px',
          border: '1px solid #fecaca'
        }}>
          <h4 style={{
            fontSize: '16px',
            fontWeight: '700',
            color: '#991b1b',
            margin: '0 0 16px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Calendar style={{ width: '16px', height: '16px' }} />
            Требует внимания
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {problems.map((problem, index) => (
              <div key={index} style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#991b1b'
              }}>
                • {problem.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ДАТЫ ДОКУМЕНТОВ */}
      <div style={{ marginBottom: '32px' }}>
        <h4 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: '#1f2937',
          margin: '0 0 20px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Calendar style={{ width: '16px', height: '16px', color: '#6b7280' }} />
          Документы
        </h4>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          {documentFields.map(({ key, label, date }) => (
            <div
              key={key}
              style={{
                ...getStatusStyle(date),
                borderRadius: '16px',
                padding: '20px',
                textAlign: 'center',
                transition: 'all 0.2s ease'
              }}
            >
              <p style={{
                fontSize: '12px',
                fontWeight: '600',
                margin: '0 0 8px 0',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                opacity: 0.8
              }}>
                {label}
              </p>
              <p style={{
                fontSize: '16px',
                fontWeight: '600',
                margin: 0
              }}>
                {date ? formatDate(date) : 'Не указано'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* КОНТАКТ */}
      {employee.phone && (
        <div style={{
          background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
          borderRadius: '20px',
          padding: '24px',
          marginBottom: '32px',
          border: '1px solid #bfdbfe'
        }}>
          <h4 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#1e40af',
            margin: '0 0 12px 0',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Контакт
          </h4>
          <p style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#1e3a8a',
            margin: 0
          }}>
            {formatPhone(employee.phone)}
          </p>
        </div>
      )}

      {/* КОММЕНТАРИЙ */}
      {employee.comment && (
        <div style={{
          background: '#f9fafb',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '32px',
          border: '1px solid #e5e7eb'
        }}>
          <h4 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151',
            margin: '0 0 12px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <MessageSquare style={{ width: '14px', height: '14px' }} />
            Комментарий
          </h4>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            margin: 0,
            lineHeight: '1.5'
          }}>
            {employee.comment}
          </p>
        </div>
      )}

      {/* ДЕЙСТВИЯ */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Кнопки связи */}
        {hasValidPhone && whatsappMessage && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '12px'
          }}>
            <Button 
              onClick={() => window.open(generateWhatsAppLink(employee.phone!, whatsappMessage), '_blank')}
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                borderRadius: '16px',
                padding: '16px 20px',
                fontSize: '14px',
                fontWeight: '600',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <MessageCircle style={{ width: '16px', height: '16px' }} />
              WhatsApp
            </Button>
            
            <Button 
              onClick={() => window.open(generateTelegramLink(employee.phone!), '_blank')}
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: 'white',
                borderRadius: '16px',
                padding: '16px 20px',
                fontSize: '14px',
                fontWeight: '600',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Send style={{ width: '16px', height: '16px' }} />
              Telegram
            </Button>
            
            <Button 
              onClick={() => window.open(generateCallLink(employee.phone!), '_blank')}
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                color: 'white',
                borderRadius: '16px',
                padding: '16px 20px',
                fontSize: '14px',
                fontWeight: '600',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Phone style={{ width: '16px', height: '16px' }} />
              Позвонить
            </Button>
          </div>
        )}
        
        {/* Управление */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button
            onClick={() => setShowDocuments(!showDocuments)}
            style={{
              background: 'rgba(255, 255, 255, 0.8)',
              color: '#374151',
              border: '1px solid #e5e7eb',
              borderRadius: '16px',
              padding: '16px 20px',
              fontSize: '14px',
              fontWeight: '600',
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <FileText style={{ width: '16px', height: '16px' }} />
            {showDocuments ? 'Скрыть документы' : 'Документы'}
            <ChevronRight style={{
              width: '16px',
              height: '16px',
              transform: showDocuments ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease'
            }} />
          </Button>
          
          <Button
            onClick={handleStatusToggle}
            disabled={isUpdating}
            style={{
              background: employee.sent 
                ? 'linear-gradient(135deg, #ef4444, #dc2626)' 
                : 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              borderRadius: '16px',
              padding: '16px 20px',
              fontSize: '14px',
              fontWeight: '600',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              opacity: isUpdating ? 0.7 : 1
            }}
          >
            {isUpdating ? (
              <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
            ) : employee.sent ? (
              <X style={{ width: '16px', height: '16px' }} />
            ) : (
              <Check style={{ width: '16px', height: '16px' }} />
            )}
            {employee.sent ? 'Отменить' : 'Отправлено'}
          </Button>
        </div>
      </div>

      {/* ДОКУМЕНТЫ */}
      {showDocuments && (
        <div style={{
          marginTop: '32px',
          paddingTop: '32px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <DocumentManager employeeId={employee.id} />
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}