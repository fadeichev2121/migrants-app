// Убираем неиспользуемый импорт NextRequest
import { writeFile, mkdir, unlink } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

export interface UploadConfig {
  maxFileSize: number
  allowedTypes: string[]
  uploadDir: string
}

export interface UploadResult {
  success: boolean
  fileName?: string
  storedAt?: string
  size?: number
  mimeType?: string
  error?: string
}

export const DEFAULT_UPLOAD_CONFIG: UploadConfig = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  uploadDir: './uploads'
}

/**
 * Загружает файл из FormData
 */
export async function uploadFile(
  formData: FormData,
  employeeId: string,
  config: UploadConfig = DEFAULT_UPLOAD_CONFIG
): Promise<UploadResult> {
  try {
    const file = formData.get('file') as File
    
    if (!file) {
      return { success: false, error: 'Файл не найден' }
    }

    // Проверка размера
    if (file.size > config.maxFileSize) {
      return { 
        success: false, 
        error: `Файл слишком большой. Максимум ${Math.round(config.maxFileSize / 1024 / 1024)}MB` 
      }
    }

    // Проверка типа
    if (!config.allowedTypes.includes(file.type)) {
      return { 
        success: false, 
        error: `Неподдерживаемый тип файла. Разрешены: ${config.allowedTypes.join(', ')}` 
      }
    }

    // Создаем директорию для сотрудника
    const employeeDir = path.join(config.uploadDir, employeeId)
    if (!existsSync(employeeDir)) {
      await mkdir(employeeDir, { recursive: true })
    }

    // Генерируем уникальное имя файла
    const fileExtension = path.extname(file.name)
    const uniqueFileName = `${uuidv4()}${fileExtension}`
    const filePath = path.join(employeeDir, uniqueFileName)

    // Сохраняем файл
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    return {
      success: true,
      fileName: file.name,
      storedAt: filePath,
      size: file.size,
      mimeType: file.type
    }
  } catch (error) {
    console.error('Upload error:', error)
    return { 
      success: false, 
      error: 'Ошибка при загрузке файла' 
    }
  }
}

/**
 * Удаляет файл с диска
 */
export async function deleteFile(storedAt: string): Promise<boolean> {
  try {
    await unlink(storedAt)
    return true
  } catch (error) {
    console.error('Delete file error:', error)
    return false
  }
}

/**
 * Получает конфигурацию загрузки из переменных окружения
 */
export function getUploadConfig(): UploadConfig {
  return {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'),
    allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/webp,application/pdf').split(','),
    uploadDir: process.env.UPLOAD_DIR || './uploads'
  }
}