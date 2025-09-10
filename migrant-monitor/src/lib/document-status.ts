import { differenceInDays, isValid, parseISO } from 'date-fns'

// Настройки срочности - легко изменяемые
export const URGENCY_CONFIG = {
  EXPIRED_DAYS: 0,        // Просрочено: < 0 дней
  WARNING_DAYS: 30,       // Предупреждение: <= 30 дней  
  SUCCESS_DAYS: 31        // Всё ОК: > 30 дней
}

export type DocumentStatus = 'expired' | 'warning' | 'success' | 'empty'

export interface DocumentInfo {
  field: string
  label: string
  date: Date | null
  status: DocumentStatus
  daysLeft: number
  message: string
}

/**
 * Вычисляет статус документа по дате
 */
export function getDocumentStatus(date: Date | string | null): DocumentStatus {
  if (!date) return 'empty'
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(dateObj)) return 'empty'
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const targetDate = new Date(dateObj)
  targetDate.setHours(0, 0, 0, 0)
  
  const daysLeft = differenceInDays(targetDate, today)
  
  if (daysLeft < URGENCY_CONFIG.EXPIRED_DAYS) {
    return 'expired'
  } else if (daysLeft <= URGENCY_CONFIG.WARNING_DAYS) {
    return 'warning'
  } else {
    return 'success'
  }
}

/**
 * Получает CSS классы для статуса документа
 */
export function getStatusClasses(status: DocumentStatus): string {
  switch (status) {
    case 'expired':
      return 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950/20 dark:text-red-200 dark:border-red-800'
    case 'warning':
      return 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-200 dark:border-yellow-800'
    case 'success':
      return 'bg-green-50 text-green-800 border-green-200 dark:bg-green-950/20 dark:text-green-200 dark:border-green-800'
    default:
      return 'bg-muted text-muted-foreground border-border'
  }
}

/**
 * Форматирует дату для отображения
 */
export function formatDate(date: Date | string | null): string {
  if (!date) return ''
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(dateObj)) return ''
  
  return dateObj.toLocaleDateString('ru-RU')
}

/**
 * Вычисляет дни до истечения
 */
export function getDaysLeft(date: Date | string | null): number {
  if (!date) return 0
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(dateObj)) return 0
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const targetDate = new Date(dateObj)
  targetDate.setHours(0, 0, 0, 0)
  
  return differenceInDays(targetDate, today)
}

/**
 * Генерирует сообщение о статусе документа
 */
export function getStatusMessage(field: string, date: Date | string | null): string {
  if (!date) return ''
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(dateObj)) return ''
  
  const daysLeft = getDaysLeft(date)
  const formattedDate = formatDate(date)
  
  if (daysLeft < 0) {
    return `${field} просрочен ${formattedDate}`
  } else if (daysLeft <= URGENCY_CONFIG.WARNING_DAYS) {
    return `${field} истекает ${formattedDate}`
  }
  
  return ''
}

/**
 * Получает все проблемы сотрудника
 */
export function getEmployeeProblems(employee: {
  patentDate: Date | null
  registrationDate: Date | null  
  passportDate: Date | null
  checkDate: Date | null
}): DocumentInfo[] {
  const fields = [
    { field: 'patent', label: 'Патент', date: employee.patentDate },
    { field: 'registration', label: 'Регистрация', date: employee.registrationDate },
    { field: 'passport', label: 'Паспорт', date: employee.passportDate },
    { field: 'check', label: 'Чек', date: employee.checkDate }
  ]
  
  return fields
    .map(({ field, label, date }) => {
      const status = getDocumentStatus(date)
      const daysLeft = getDaysLeft(date)
      const message = getStatusMessage(label, date)
      
      return {
        field,
        label,
        date,
        status,
        daysLeft,
        message
      }
    })
    .filter(info => info.status !== 'empty' && info.status !== 'success')
}

/**
 * Проверяет, есть ли у сотрудника срочные проблемы
 */
export function hasUrgentProblems(employee: {
  patentDate: Date | null
  registrationDate: Date | null
  passportDate: Date | null  
  checkDate: Date | null
}): boolean {
  const problems = getEmployeeProblems(employee)
  return problems.some(p => p.status === 'expired' || p.status === 'warning')
}

/**
 * Генерирует сообщение для WhatsApp
 */
export function generateWhatsAppMessage(employee: {
  fullName: string
  patentDate: Date | null
  registrationDate: Date | null
  passportDate: Date | null
  checkDate: Date | null
}): string {
  const problems = getEmployeeProblems(employee)
  
  if (problems.length === 0) {
    return ''
  }
  
  // Определяем обращение (имя + отчество если ≥3 слова)
  const nameParts = employee.fullName.trim().split(' ')
  const greeting = nameParts.length >= 3 
    ? `${nameParts[1]} ${nameParts[2]}` // Имя + Отчество
    : employee.fullName
  
  // Формируем список проблем
  const problemsList = problems.map(p => p.message).join(', ')
  
  return `Здравствуйте, ${greeting}! ${problemsList}. Пожалуйста, пришлите сканы.`
}