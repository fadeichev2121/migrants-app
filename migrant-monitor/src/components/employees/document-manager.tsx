'use client'

import { useState, useEffect, useCallback } from 'react'
import { DocumentType } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Upload, 
  Download, 
  Trash2, 
  File, 
  FileImage, 
  FileText,
  Eye,
  Loader2
} from 'lucide-react'
import { useDropzone } from 'react-dropzone'

interface Document {
  id: string
  employeeId: string
  type: DocumentType
  fileName: string
  mimeType: string
  size: number
  storedAt: string
  uploadedAt: Date
}

interface DocumentManagerProps {
  employeeId: string
}

export default function DocumentManager({ employeeId }: DocumentManagerProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)

  const fetchDocuments = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/employees/${employeeId}/documents`)
      if (response.ok) {
        const data = await response.json()
        setDocuments(data)
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
    } finally {
      setIsLoading(false)
    }
  }, [employeeId])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  const onDrop = useCallback(async (acceptedFiles: File[], type: DocumentType) => {
    if (acceptedFiles.length === 0) return

    setIsUploading(true)
    
    for (const file of acceptedFiles) {
      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', type)

        const response = await fetch(`/api/employees/${employeeId}/documents`, {
          method: 'POST',
          body: formData
        })

        if (response.ok) {
          await fetchDocuments()
        }
      } catch (error) {
        console.error('Upload error:', error)
      }
    }
    
    setIsUploading(false)
  }, [employeeId, fetchDocuments])

  const handleDelete = async (document: Document) => {
    if (!confirm(`Удалить документ "${document.fileName}"?`)) return

    try {
      const response = await fetch(`/api/employees/${employeeId}/documents/${document.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchDocuments()
      }
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  const handleDownload = (document: Document) => {
    const link = window.document.createElement('a')
    link.href = `/api/employees/${employeeId}/documents/${document.id}`
    link.download = document.fileName
    window.document.body.appendChild(link)
    link.click()
    window.document.body.removeChild(link)
  }

  const getDocumentIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <FileImage style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
    } else if (mimeType === 'application/pdf') {
      return <FileText style={{ width: '20px', height: '20px', color: '#ef4444' }} />
    }
    return <File style={{ width: '20px', height: '20px', color: '#6b7280' }} />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const documentTypes = [
    { value: DocumentType.PASSPORT, label: 'Паспорт', color: '#ef4444' },
    { value: DocumentType.PATENT, label: 'Патент', color: '#3b82f6' },
    { value: DocumentType.REGISTRATION, label: 'Регистрация', color: '#10b981' },
    { value: DocumentType.CHECK, label: 'Чек', color: '#8b5cf6' },
    { value: DocumentType.OTHER, label: 'Другое', color: '#6b7280' }
  ]

  const getDocumentsByType = (type: DocumentType) => {
    return documents.filter(doc => doc.type === type)
  }

  const DropzoneArea = ({ type, color }: { type: DocumentType; color: string }) => {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop: (files) => onDrop(files, type),
      accept: {
        'image/jpeg': ['.jpg', '.jpeg'],
        'image/png': ['.png'],
        'image/webp': ['.webp'],
        'application/pdf': ['.pdf']
      },
      maxSize: 10 * 1024 * 1024,
      disabled: isUploading
    })

    return (
      <div
        {...getRootProps()}
        style={{
          border: isDragActive ? `2px dashed ${color}` : '2px dashed #d1d5db',
          borderRadius: '20px',
          padding: '32px',
          textAlign: 'center',
          cursor: isUploading ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
          background: isDragActive ? `${color}10` : 'rgba(249, 250, 251, 0.8)',
          opacity: isUploading ? 0.6 : 1
        }}
      >
        <input {...getInputProps()} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          {isUploading ? (
            <Loader2 style={{ 
              width: '48px', 
              height: '48px', 
              color: color, 
              animation: 'spin 1s linear infinite' 
            }} />
          ) : (
            <div style={{
              width: '64px',
              height: '64px',
              background: `linear-gradient(135deg, ${color}, ${color}dd)`,
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Upload style={{ width: '32px', height: '32px', color: 'white' }} />
            </div>
          )}
          <div>
            <p style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              margin: '0 0 8px 0'
            }}>
              {isDragActive ? '✨ Отпустите файлы здесь' : '🚀 Перетащите файлы сюда'}
            </p>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: 0
            }}>
              JPG, PNG, WebP, PDF • Максимум 10MB
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px'
      }}>
        <Loader2 style={{ 
          width: '32px', 
          height: '32px', 
          color: '#667eea', 
          animation: 'spin 1s linear infinite' 
        }} />
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRadius: '24px',
      padding: '32px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
    }}>
      <h3 style={{
        fontSize: '20px',
        fontWeight: '700',
        color: '#1f2937',
        margin: '0 0 8px 0'
      }}>
        Управление документами
      </h3>
      <p style={{
        fontSize: '14px',
        color: '#6b7280',
        margin: '0 0 32px 0'
      }}>
        Загрузка, просмотр и управление файлами
      </p>

      <Tabs defaultValue={DocumentType.PASSPORT}>
        <TabsList style={{
          background: 'rgba(249, 250, 251, 0.8)',
          border: '1px solid #e5e7eb',
          borderRadius: '16px',
          padding: '4px',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '4px'
        }}>
          {documentTypes.map(({ value, label, color }) => (
            <TabsTrigger 
              key={value} 
              value={value}
              style={{
                borderRadius: '12px',
                padding: '12px 8px',
                fontSize: '12px',
                fontWeight: '600',
                border: 'none',
                background: 'transparent',
                color: '#6b7280',
                position: 'relative'
              }}
            >
              {label}
              {getDocumentsByType(value).length > 0 && (
                <Badge style={{
                  background: color,
                  color: 'white',
                  borderRadius: '8px',
                  padding: '2px 6px',
                  fontSize: '10px',
                  fontWeight: '700',
                  marginLeft: '4px',
                  border: 'none'
                }}>
                  {getDocumentsByType(value).length}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {documentTypes.map(({ value, label, color }) => (
          <TabsContent key={value} value={value} style={{ marginTop: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <DropzoneArea type={value} color={color} />
              
              {/* Document List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {getDocumentsByType(value).map((document) => (
                  <div
                    key={document.id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.8)',
                      borderRadius: '16px',
                      padding: '20px',
                      border: '1px solid #e5e7eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '16px',
                      flex: 1,
                      minWidth: 0
                    }}>
                      {getDocumentIcon(document.mimeType)}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#1f2937',
                          margin: '0 0 4px 0',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {document.fileName}
                        </p>
                        <p style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          margin: 0
                        }}>
                          {formatFileSize(document.size)} • {new Date(document.uploadedAt).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {document.mimeType.startsWith('image/') && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              style={{
                                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                padding: '8px 12px',
                                fontSize: '12px',
                                fontWeight: '600'
                              }}
                            >
                              <Eye style={{ width: '14px', height: '14px' }} />
                            </Button>
                          </DialogTrigger>
                          <DialogContent style={{
                            maxWidth: '90vw',
                            maxHeight: '90vh',
                            background: 'rgba(255, 255, 255, 0.98)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: '24px',
                            border: '1px solid rgba(255, 255, 255, 0.2)'
                          }}>
                            <DialogHeader>
                              <DialogTitle style={{
                                fontSize: '18px',
                                fontWeight: '700',
                                color: '#1f2937'
                              }}>
                                {document.fileName}
                              </DialogTitle>
                            </DialogHeader>
                            <div style={{ 
                              marginTop: '16px',
                              maxHeight: '70vh',
                              overflow: 'auto',
                              borderRadius: '16px'
                            }}>
                              <img
                                src={`/api/employees/${employeeId}/documents/${document.id}`}
                                alt={document.fileName}
                                style={{
                                  width: '100%',
                                  height: 'auto',
                                  borderRadius: '16px',
                                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                                }}
                              />
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                      
                      <Button
                        onClick={() => handleDownload(document)}
                        style={{
                          background: 'rgba(255, 255, 255, 0.8)',
                          color: '#374151',
                          border: '1px solid #e5e7eb',
                          borderRadius: '12px',
                          padding: '8px 12px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}
                      >
                        <Download style={{ width: '14px', height: '14px' }} />
                      </Button>
                      
                      <Button
                        onClick={() => handleDelete(document)}
                        style={{
                          background: 'rgba(255, 255, 255, 0.8)',
                          color: '#ef4444',
                          border: '1px solid #fecaca',
                          borderRadius: '12px',
                          padding: '8px 12px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}
                      >
                        <Trash2 style={{ width: '14px', height: '14px' }} />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {getDocumentsByType(value).length === 0 && (
                  <div style={{
                    textAlign: 'center',
                    padding: '48px 24px',
                    color: '#6b7280'
                  }}>
                    <File style={{ width: '48px', height: '48px', margin: '0 auto 16px', opacity: 0.5 }} />
                    <p style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      margin: '0 0 8px 0'
                    }}>
                      Нет документов
                    </p>
                    <p style={{
                      fontSize: '14px',
                      margin: 0
                    }}>
                      Загрузите документы типа &quot;{label}&quot;
                    </p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}