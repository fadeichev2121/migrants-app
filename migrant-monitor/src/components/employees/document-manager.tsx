'use client'

import { useState, useEffect, useCallback } from 'react'
import { DocumentType } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Upload, 
  Download, 
  Trash2, 
  File, 
  FileImage, 
  FileText,
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
  const [activeTab, setActiveTab] = useState<DocumentType>(DocumentType.PASSPORT)

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
          await fetchDocuments() // Обновляем список
        } else {
          const error = await response.json()
          alert(`Ошибка загрузки ${file.name}: ${error.error}`)
        }
      } catch (error) {
        console.error('Upload error:', error)
        alert(`Ошибка загрузки ${file.name}`)
      }
    }
    
    setIsUploading(false)
  }, [employeeId, fetchDocuments])

  const handleDelete = async (documentId: string) => {
    if (!confirm('Удалить документ?')) return

    try {
      const response = await fetch(`/api/employees/${employeeId}/documents/${documentId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchDocuments()
      } else {
        alert('Ошибка удаления документа')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Ошибка удаления документа')
    }
  }

  const handleDownload = (documentId: string, fileName: string) => {
    const link = document.createElement('a')
    link.href = `/api/employees/${employeeId}/documents/${documentId}`
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getDocumentIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <FileImage className="w-4 h-4 text-blue-500" />
    } else if (mimeType === 'application/pdf') {
      return <FileText className="w-4 h-4 text-red-500" />
    }
    return <File className="w-4 h-4 text-gray-500" />
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
          border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200
          ${isDragActive 
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800'
          }
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          {isUploading ? (
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          ) : (
            <Upload className="w-8 h-8 text-gray-400" />
          )}
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {isDragActive ? 'Отпустите файлы здесь' : 'Перетащите файлы или нажмите для выбора'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              JPG, PNG, WebP, PDF до 10MB
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/20 dark:border-gray-700/50">
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as DocumentType)}>
          <TabsList className="grid w-full grid-cols-5 bg-gray-100 dark:bg-gray-800 rounded-xl">
            {documentTypes.map(({ value, label }) => (
              <TabsTrigger 
                key={value}
                value={value}
                className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 relative"
              >
                {label}
                {getDocumentsByType(value).length > 0 && (
                  <span className="ml-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {getDocumentsByType(value).length}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {documentTypes.map(({ value, label }) => (
            <TabsContent key={value} value={value} className="space-y-4 mt-6">
              <DropzoneArea type={value} />
              
              {/* Document List */}
              <div className="space-y-3">
                {getDocumentsByType(value).map((document) => (
                  <div
                    key={document.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center gap-3">
                      {getDocumentIcon(document.mimeType)}
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {document.fileName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatFileSize(document.size)} • {new Date(document.uploadedAt).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(document.id, document.fileName)}
                        className="h-8 w-8 p-0"
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(document.id)}
                        className="h-8 w-8 p-0 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {getDocumentsByType(value).length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <File className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Нет загруженных документов типа &quot;{label}&quot;</p>
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