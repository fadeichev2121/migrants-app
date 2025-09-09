import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, isValid, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Нормализация телефона - оставляем только цифры
export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '')
}

// Форматирование телефона для отображения
export function formatPhone(phone: string): string {
  const normalized = normalizePhone(phone)
  if (normalized.length >= 11) {
    return `+${normalized.slice(0, 1)} (${normalized.slice(1, 4)}) ${normalized.slice(4, 7)}-${normalized.slice(7, 9)}-${normalized.slice(9, 11)}`
  }
  return phone
}

// Генерация ссылки для WhatsApp
export function generateWhatsAppLink(phone: string, message: string): string {
  const normalized = normalizePhone(phone)
  if (normalized.length < 10) return '#'
  
  const internationalPhone = normalized.startsWith('7') ? normalized : `7${normalized}`
  return `https://wa.me/${internationalPhone}?text=${encodeURIComponent(message)}`
}

// Генерация ссылки для Telegram
export function generateTelegramLink(phone: string): string {
  const normalized = normalizePhone(phone)
  if (normalized.length < 10) return '#'
  
  const internationalPhone = normalized.startsWith('7') ? normalized : `7${normalized}`
  return `tg://resolve?phone=${internationalPhone}`
}

// Генерация ссылки для звонка
export function generateCallLink(phone: string): string {
  const normalized = normalizePhone(phone)
  if (normalized.length < 10) return '#'
  
  const internationalPhone = normalized.startsWith('7') ? `+${normalized}` : `+7${normalized}`
  return `tel:${internationalPhone}`
}

// Автокапитализация ФИО
export function capitalizeFullName(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

// Форматирование даты для отображения
export function formatDate(date: Date | string | null): string {
  if (!date) return ''
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(dateObj)) return ''
  
  return format(dateObj, 'dd.MM.yyyy', { locale: ru })
}

// Парсинг даты из строки (поддержка dd.mm.yyyy и ISO)
export function parseDate(dateString: string): Date | null {
  if (!dateString) return null
  
  // Попробуем ISO формат
  const isoDate = parseISO(dateString)
  if (isValid(isoDate)) return isoDate
  
  // Попробуем dd.mm.yyyy формат
  const parts = dateString.split('.')
  if (parts.length === 3) {
    const [day, month, year] = parts.map(p => parseInt(p, 10))
    const date = new Date(year, month - 1, day)
    if (isValid(date)) return date
  }
  
  return null
}

// Проверка просроченности даты
export function isDateExpired(date: Date | string | null): boolean {
  if (!date) return false
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(dateObj)) return false
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  dateObj.setHours(0, 0, 0, 0)
  
  return dateObj < today
}

// Проверка скорого истечения (0-30 дней)
export function isDateExpiringSoon(date: Date | string | null): boolean {
  if (!date) return false
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(dateObj)) return false
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  dateObj.setHours(0, 0, 0, 0)
  
  const diffTime = dateObj.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays >= 0 && diffDays <= 30
}

// Проверка критической срочности (просрочено или ≤7 дней)
export function isDateUrgent(date: Date | string | null): boolean {
  if (!date) return false
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(dateObj)) return false
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  dateObj.setHours(0, 0, 0, 0)
  
  const diffTime = dateObj.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays <= 7
}

// Получение списка проблем для сотрудника
export function getEmployeeProblems(employee: {
  patentDate: Date | null
  registrationDate: Date | null
  passportDate: Date | null
  checkDate: Date | null
}): string[] {
  const problems: string[] = []
  
  const checkDate = (date: Date | null, fieldName: string, isPassport = false) => {
    if (!date) return
    
    const expired = isDateExpired(date)
    const expiring = isDateExpiringSoon(date)
    
    if (expired) {
      const suffix = isPassport ? ', необходимо заменить паспорт' : ''
      problems.push(`${fieldName} просрочен ${formatDate(date)}${suffix}`)
    } else if (expiring) {
      const suffix = isPassport ? ', необходимо заменить паспорт' : ''
      problems.push(`${fieldName} истекает ${formatDate(date)}${suffix}`)
    }
  }
  
  checkDate(employee.patentDate, 'Патент')
  checkDate(employee.registrationDate, 'Регистрация')
  checkDate(employee.passportDate, 'Паспорт', true)
  checkDate(employee.checkDate, 'Чек')
  
  return problems
}

// Генерация сообщения для WhatsApp
export function generateWhatsAppMessage(employee: {
  fullName: string
  patentDate: Date | null
  registrationDate: Date | null
  passportDate: Date | null
  checkDate: Date | null
}): string {
  const problems = getEmployeeProblems(employee)
  if (problems.length === 0) return ''
  
  // Определяем обращение
  const nameParts = employee.fullName.trim().split(' ')
  const greeting = nameParts.length >= 3 
    ? `${nameParts[1]} ${nameParts[2]}` // Имя + Отчество
    : employee.fullName
  
  return `Здравствуйте, ${greeting}!\n${problems.join(', ')}.\nПожалуйста, пришлите сканы.`
}