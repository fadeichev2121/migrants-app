'use client'

import { useState, useEffect, useCallback } from 'react'
import { DocumentType } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  Plus,
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
      return <FileImage className="h-5 w-5 text-blue-500" />
    } else if (mimeType === 'application/pdf') {
      return <FileText className="h-5 w-5 text-red-500" />
    }
    return <File className="h-5 w-5 text-gray-500" />
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
          border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200
          ${isDragActive 
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/20' 
            : 'border-gray-300 dark:border-gray-700 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/10'
          }
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          {isUploading ? (
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto" />
          ) : (
            <Upload className="h-12 w-12 text-gray-400 mx-auto" />
          )}
          <div>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              {isDragActive ? 'Отпустите файлы здесь' : 'Перетащите файлы или нажмите для выбора'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
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
          <CardTitle>Документы</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-sm border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <File className="h-5 w-5 text-gray-500" />
          Документы
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={DocumentType.PASSPORT} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-gray-100 dark:bg-gray-800">
            {documentTypes.map(({ value, label }) => (
              <TabsTrigger key={value} value={value} className="text-xs relative">
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
            <TabsContent key={value} value={value} className="space-y-6 mt-6">
              <DropzoneArea type={value} />
              
              {/* Document List */}
              <div className="space-y-4">
                {getDocumentsByType(value).map((document) => (
                  <Card key={document.id} className="shadow-sm border border-gray-100 dark:border-gray-800">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          {getDocumentIcon(document.mimeType)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate text-gray-900 dark:text-white">
                              {document.fileName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
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
                                <div className="mt-4 max-h-[70vh] overflow-auto">
                                  <img
                                    src={`/api/employees/${employeeId}/documents/${document.id}`}
                                    alt={document.fileName}
                                    className="w-full h-auto rounded-xl shadow-lg"
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
                            className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {getDocumentsByType(value).length === 0 && (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <File className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Нет документов</p>
                    <p className="text-sm">Загрузите документы типа &quot;{label}&quot;</p>
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