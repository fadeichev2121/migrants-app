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
  Loader2,
  Eye,
  FolderOpen,
  Paperclip,
  X,
  ZoomIn,
  ExternalLink,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

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
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null)

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
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }))
        
        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', type)

        // Симуляция прогресса загрузки
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: Math.min((prev[file.name] || 0) + 10, 90)
          }))
        }, 100)

        const response = await fetch(`/api/employees/${employeeId}/documents`, {
          method: 'POST',
          body: formData
        })

        clearInterval(progressInterval)
        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }))

        if (response.ok) {
          setTimeout(() => {
            setUploadProgress(prev => {
              const newProgress = { ...prev }
              delete newProgress[file.name]
              return newProgress
            })
          }, 1000)
          await fetchDocuments()
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

  const handleDelete = async (document: Document) => {
    if (!confirm(`Удалить документ "${document.fileName}"?`)) return

    try {
      const response = await fetch(`/api/employees/${employeeId}/documents/${document.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchDocuments()
        if (previewDocument?.id === document.id) {
          setPreviewDocument(null)
        }
      } else {
        alert('Ошибка удаления документа')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Ошибка удаления документа')
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

  const getDocumentIcon = (mimeType: string, size: 'sm' | 'lg' = 'sm') => {
    const iconSize = size === 'lg' ? 'w-8 h-8' : 'w-5 h-5'
    
    if (mimeType.startsWith('image/')) {
      return <FileImage className={`${iconSize} text-blue-500`} />
    } else if (mimeType === 'application/pdf') {
      return <FileText className={`${iconSize} text-red-500`} />
    }
    return <File className={`${iconSize} text-gray-500`} />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const documentTypes = [
    { value: DocumentType.PASSPORT, label: 'Паспорт', icon: '🛂', color: 'from-red-500 to-pink-500' },
    { value: DocumentType.PATENT, label: 'Патент', icon: '📄', color: 'from-blue-500 to-cyan-500' },
    { value: DocumentType.REGISTRATION, label: 'Регистрация', icon: '📋', color: 'from-green-500 to-emerald-500' },
    { value: DocumentType.CHECK, label: 'Чек', icon: '🧾', color: 'from-purple-500 to-violet-500' },
    { value: DocumentType.OTHER, label: 'Другое', icon: '📁', color: 'from-gray-500 to-slate-500' }
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
      maxSize: 10 * 1024 * 1024, // 10MB
      disabled: isUploading
    })

    return (
      <div
        {...getRootProps()}
        className={`
          relative border-3 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all duration-300 overflow-hidden
          ${isDragActive 
            ? `border-purple-400 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 scale-105` 
            : 'border-gray-300 dark:border-gray-600 hover:border-purple-400 hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-950/20 dark:hover:to-pink-950/20'
          }
          ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-102'}
        `}
      >
        <input {...getInputProps()} />
        
        {/* Animated background */}
        <div className={`absolute inset-0 bg-gradient-to-r ${color} opacity-5 animate-gradient`}></div>
        
        <div className="relative flex flex-col items-center gap-4">
          {isUploading ? (
            <div className="relative">
              <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
              <div className="absolute inset-0 bg-purple-400 rounded-full blur-xl opacity-30 animate-ping"></div>
            </div>
          ) : (
            <div className="relative group">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${color} flex items-center justify-center shadow-lg hover-lift`}>
                <Upload className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
              </div>
              <div className="absolute inset-0 bg-white rounded-2xl blur-lg opacity-0 group-hover:opacity-20 transition-opacity"></div>
            </div>
          )}
          
          <div className="space-y-2">
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {isDragActive ? '✨ Отпустите файлы здесь' : '🚀 Перетащите файлы или нажмите'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              JPG, PNG, WebP, PDF • Максимум 10MB
            </p>
            
            {/* Progress bars */}
            {Object.entries(uploadProgress).map(([fileName, progress]) => (
              <div key={fileName} className="w-full max-w-xs mx-auto">
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                  <span className="truncate">{fileName}</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300 relative overflow-hidden"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute inset-0 bg-white/30 animate-shimmer"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const DocumentCard = ({ document, color }: { document: Document; color: string }) => (
    <div className="group relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover-lift">
      {/* Gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-r ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
      
      <div className="relative p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${color} flex items-center justify-center shadow-lg`}>
              {getDocumentIcon(document.mimeType, 'lg')}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-gray-900 dark:text-white truncate text-sm">
                {document.fileName}
              </h4>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>{formatFileSize(document.size)}</span>
                <span>•</span>
                <span>{new Date(document.uploadedAt).toLocaleDateString('ru-RU')}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {document.mimeType.startsWith('image/') && (
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-3 rounded-xl border-2 hover:bg-purple-50 dark:hover:bg-purple-950/30 hover:border-purple-300 transition-all duration-200"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  Просмотр
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-3xl">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {document.fileName}
                  </DialogTitle>
                </DialogHeader>
                <div className="relative rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-800">
                  <img
                    src={`/api/employees/${employeeId}/documents/${document.id}`}
                    alt={document.fileName}
                    className="w-full h-auto max-h-[70vh] object-contain"
                  />
                  <div className="absolute top-4 right-4">
                    <Button
                      size="sm"
                      onClick={() => handleDownload(document)}
                      className="bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-white hover:bg-white dark:hover:bg-gray-800 shadow-lg rounded-xl"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Скачать
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDownload(document)}
            className="h-8 px-3 rounded-xl border-2 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-300 transition-all duration-200"
          >
            <Download className="w-3 h-3 mr-1" />
            Скачать
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDelete(document)}
            className="h-8 px-3 rounded-xl border-2 hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-300 hover:text-red-600 transition-all duration-200"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  )

  const DocumentTypeFolder = ({ type, label, icon, color }: { 
    type: DocumentType; 
    label: string; 
    icon: string; 
    color: string; 
  }) => {
    const docs = getDocumentsByType(type)
    const hasDocuments = docs.length > 0

    return (
      <div className="space-y-4">
        {/* Folder Header */}
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${color} p-6 text-white shadow-xl hover-lift group cursor-pointer`}>
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-3xl animate-bounce-gentle">{icon}</div>
              <div>
                <h3 className="text-xl font-black">{label}</h3>
                <p className="text-white/80 text-sm font-medium">
                  {docs.length} {docs.length === 1 ? 'документ' : docs.length < 5 ? 'документа' : 'документов'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {hasDocuments && (
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5" />
                </div>
              )}
              <FolderOpen className="w-6 h-6 opacity-70 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>

        {/* Upload Zone */}
        <DropzoneArea type={type} color={color} />

        {/* Documents Grid */}
        {docs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {docs.map((document, index) => (
              <div 
                key={document.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <DocumentCard document={document} color={color} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 space-y-4">
            <div className="relative">
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${color} opacity-20 flex items-center justify-center mx-auto`}>
                <File className="w-10 h-10 text-gray-400" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Paperclip className="w-6 h-6 text-gray-400 animate-pulse" />
              </div>
            </div>
            <div>
              <p className="text-gray-900 dark:text-white font-semibold">Пока нет документов</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Перетащите файлы в область выше для загрузки
              </p>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="relative">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
          <div className="absolute inset-0 bg-purple-400 rounded-full blur-xl opacity-30 animate-ping"></div>
        </div>
      </div>
    )
  }

  return (
    <Card className="relative overflow-hidden bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 shadow-2xl">
      {/* Animated header background */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 animate-gradient"></div>
      
      <CardContent className="relative p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
              <Paperclip className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center text-white text-xs font-bold shadow-lg animate-pulse">
              {documents.length}
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Документы
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              Управление файлами и предпросмотр
            </p>
          </div>
        </div>

        {/* Document Type Folders */}
        <div className="space-y-8">
          {documentTypes.map(({ value, label, icon, color }) => (
            <DocumentTypeFolder
              key={value}
              type={value}
              label={label}
              icon={icon}
              color={color}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}