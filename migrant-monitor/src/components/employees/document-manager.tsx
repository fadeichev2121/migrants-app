'use client'

import { useState, useEffect, useCallback } from 'react'
import { DocumentType } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Upload, 
  Download, 
  Trash2, 
  File, 
  FileImage, 
  FileText,
  Loader2,
  Eye,
  AlertCircle,
  Plus
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
  const [error, setError] = useState<string | null>(null)

  const fetchDocuments = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch(`/api/employees/${employeeId}/documents`)
      if (response.ok) {
        const data = await response.json()
        setDocuments(data)
      } else {
        throw new Error('Failed to fetch documents')
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
      setError('Ошибка загрузки документов')
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
    setError(null)
    
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
        } else {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Upload failed')
        }
      } catch (error) {
        console.error('Upload error:', error)
        setError(`Ошибка загрузки ${file.name}`)
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
      } else {
        setError('Ошибка удаления документа')
      }
    } catch (error) {
      console.error('Delete error:', error)
      setError('Ошибка удаления документа')
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
      return <FileImage className="h-4 w-4 text-blue-500" />
    } else if (mimeType === 'application/pdf') {
      return <FileText className="h-4 w-4 text-red-500" />
    }
    return <File className="h-4 w-4 text-muted-foreground" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const documentTypes = [
    { value: DocumentType.PASSPORT, label: 'Паспорт' },
    { value: DocumentType.PATENT, label: 'Патент' },
    { value: DocumentType.REGISTRATION, label: 'Регистрация' },
    { value: DocumentType.CHECK, label: 'Чек' },
    { value: DocumentType.OTHER, label: 'Другое' }
  ]

  const getDocumentsByType = (type: DocumentType) => {
    return documents.filter(doc => doc.type === type)
  }

  const DropzoneArea = ({ type }: { type: DocumentType }) => {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop: (files) => onDrop(files, type),
      accept: {
        'image/jpeg': ['.jpg', '.jpeg'],
        'image/png': ['.png'],
        'image/webp': ['.webp'],
        'application/pdf': ['.pdf']
      },
      maxSize: 10 * 1024 * 1024, // 10MB
      disabled: isUploading
    })

    return (
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25 hover:border-primary hover:bg-primary/5'
          }
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          {isUploading ? (
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          ) : (
            <Upload className="h-8 w-8 text-muted-foreground" />
          )}
          <div className="text-sm">
            <p className="font-medium">
              {isDragActive ? 'Отпустите файлы здесь' : 'Перетащите файлы или нажмите для выбора'}
            </p>
            <p className="text-muted-foreground mt-1">
              JPG, PNG, WebP, PDF до 10MB
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <File className="h-5 w-5" />
          Документы
        </CardTitle>
        <CardDescription>
          Загрузка и управление документами сотрудника
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue={DocumentType.PASSPORT} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            {documentTypes.map(({ value, label }) => (
              <TabsTrigger key={value} value={value} className="text-xs">
                {label}
                {getDocumentsByType(value).length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-xs">
                    {getDocumentsByType(value).length}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {documentTypes.map(({ value, label }) => (
            <TabsContent key={value} value={value} className="space-y-4 mt-4">
              <DropzoneArea type={value} />
              
              {/* Document List */}
              <div className="space-y-3">
                {getDocumentsByType(value).map((document) => (
                  <Card key={document.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {getDocumentIcon(document.mimeType)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {document.fileName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(document.size)} • {new Date(document.uploadedAt).toLocaleDateString('ru-RU')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {document.mimeType.startsWith('image/') && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh]">
                              <DialogHeader>
                                <DialogTitle>{document.fileName}</DialogTitle>
                              </DialogHeader>
                              <div className="mt-4">
                                <img
                                  src={`/api/employees/${employeeId}/documents/${document.id}`}
                                  alt={document.fileName}
                                  className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
                                />
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(document)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(document)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
                
                {getDocumentsByType(value).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <File className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">Нет документов типа &quot;{label}&quot;</p>
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}