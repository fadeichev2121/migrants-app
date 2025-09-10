'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, User, Phone, Building2, Calendar, MessageSquare, Save, Loader2, Sparkles, AlertCircle } from 'lucide-react'
import { capitalizeFullName, normalizePhone } from '@/lib/utils'

export default function NewEmployeePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    department: '',
    patentDate: '',
    registrationDate: '',
    passportDate: '',
    checkDate: '',
    comment: ''
  })

  const handleInputChange = (field: string, value: string) => {
    let processedValue = value

    if (field === 'fullName') {
      processedValue = capitalizeFullName(value)
    }

    if (field === 'phone') {
      processedValue = value.replace(/\D/g, '')
    }

    setFormData(prev => ({ ...prev, [field]: processedValue }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      if (!formData.fullName.trim()) {
        throw new Error('ФИО обязательно для заполнения')
      }

      if (formData.phone && normalizePhone(formData.phone).length < 10) {
        throw new Error('Телефон должен содержать минимум 10 цифр')
      }

      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          phone: formData.phone || null,
          department: formData.department || null,
          patentDate: formData.patentDate || null,
          registrationDate: formData.registrationDate || null,
          passportDate: formData.passportDate || null,
          checkDate: formData.checkDate || null,
          comment: formData.comment.trim() || null,
          sent: false
        })
      })

      if (response.ok) {
        router.push('/')
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Ошибка при создании сотрудника')
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Произошла ошибка')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        padding: '24px 0'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 32px',
          display: 'flex',
          alignItems: 'center',
          gap: '20px'
        }}>
          <Button
            variant="ghost"
            onClick={() => router.back()}
            style={{
              background: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '12px',
              padding: '12px 16px'
            }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
          <div>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#1f2937',
              margin: '0 0 8px 0'
            }}>
              Добавить сотрудника
            </h1>
            <p style={{
              fontSize: '16px',
              color: '#6b7280',
              margin: 0
            }}>
              Создание новой записи в системе
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '48px 32px'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '48px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              borderRadius: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px'
            }}>
              <Sparkles style={{ width: '40px', height: '40px', color: 'white' }} />
            </div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#1f2937',
              margin: '0 0 12px 0'
            }}>
              Новый сотрудник
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#6b7280',
              margin: 0
            }}>
              Заполните информацию для создания профиля
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
              {/* Basic Info */}
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '24px'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <User style={{ width: '20px', height: '20px', color: 'white' }} />
                  </div>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#1f2937',
                    margin: 0
                  }}>
                    Основная информация
                  </h3>
                </div>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '24px'
                }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <Label htmlFor="fullName" style={{ 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#374151',
                      display: 'block',
                      marginBottom: '8px'
                    }}>
                      ФИО *
                    </Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      placeholder="Иванов Иван Иванович"
                      required
                      style={{
                        borderRadius: '16px',
                        border: '2px solid #e5e7eb',
                        padding: '16px 20px',
                        fontSize: '18px',
                        fontWeight: '600'
                      }}
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" style={{ 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#374151',
                      display: 'block',
                      marginBottom: '8px'
                    }}>
                      Телефон
                    </Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="79001234567"
                      type="tel"
                      style={{
                        borderRadius: '16px',
                        border: '2px solid #e5e7eb',
                        padding: '16px 20px',
                        fontSize: '16px'
                      }}
                    />
                  </div>

                  <div>
                    <Label htmlFor="department" style={{ 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#374151',
                      display: 'block',
                      marginBottom: '8px'
                    }}>
                      Отдел
                    </Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      placeholder="Производство"
                      style={{
                        borderRadius: '16px',
                        border: '2px solid #e5e7eb',
                        padding: '16px 20px',
                        fontSize: '16px'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Document Dates */}
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '24px'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Calendar style={{ width: '20px', height: '20px', color: 'white' }} />
                  </div>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#1f2937',
                    margin: 0
                  }}>
                    Даты документов
                  </h3>
                </div>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '24px'
                }}>
                  {[
                    { key: 'patentDate', label: 'Патент' },
                    { key: 'registrationDate', label: 'Регистрация' },
                    { key: 'passportDate', label: 'Паспорт' },
                    { key: 'checkDate', label: 'Чек' }
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <Label htmlFor={key} style={{ 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        color: '#374151',
                        display: 'block',
                        marginBottom: '8px'
                      }}>
                        {label}
                      </Label>
                      <Input
                        id={key}
                        type="date"
                        value={formData[key as keyof typeof formData]}
                        onChange={(e) => handleInputChange(key, e.target.value)}
                        style={{
                          borderRadius: '16px',
                          border: '2px solid #e5e7eb',
                          padding: '16px 20px',
                          fontSize: '16px'
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '24px'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <MessageSquare style={{ width: '20px', height: '20px', color: 'white' }} />
                  </div>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#1f2937',
                    margin: 0
                  }}>
                    Комментарий
                  </h3>
                </div>
                <Label htmlFor="comment" style={{ 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#374151',
                  display: 'block',
                  marginBottom: '8px'
                }}>
                  Дополнительная информация
                </Label>
                <Textarea
                  id="comment"
                  value={formData.comment}
                  onChange={(e) => handleInputChange('comment', e.target.value)}
                  placeholder="Заметки о сотруднике..."
                  style={{
                    borderRadius: '16px',
                    border: '2px solid #e5e7eb',
                    padding: '20px',
                    fontSize: '16px',
                    minHeight: '120px',
                    fontFamily: 'Inter, sans-serif'
                  }}
                />
              </div>

              {/* Error */}
              {error && (
                <div style={{
                  background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
                  borderRadius: '16px',
                  padding: '20px',
                  border: '1px solid #fecaca',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <AlertCircle style={{ width: '20px', height: '20px', color: '#dc2626' }} />
                  <p style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#991b1b',
                    margin: 0
                  }}>
                    {error}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div style={{
                display: 'flex',
                gap: '16px',
                flexWrap: 'wrap'
              }}>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    background: isSubmitting 
                      ? '#9ca3af' 
                      : 'linear-gradient(135deg, #10b981, #059669)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '16px',
                    padding: '20px 40px',
                    fontSize: '18px',
                    fontWeight: '700',
                    flex: '1',
                    minWidth: '200px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 8px 32px rgba(16, 185, 129, 0.4)'
                  }}
                >
                  {isSubmitting ? (
                    <Loader2 style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <Save style={{ width: '20px', height: '20px' }} />
                  )}
                  {isSubmitting ? 'Создание...' : 'Создать сотрудника'}
                </Button>
                <Button
                  type="button"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                  style={{
                    background: 'rgba(255, 255, 255, 0.8)',
                    color: '#374151',
                    border: '1px solid #e5e7eb',
                    borderRadius: '16px',
                    padding: '20px 32px',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}
                >
                  Отмена
                </Button>
              </div>
            </div>

            <style jsx>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </form>
        </div>
      </main>
    </div>
  )
}