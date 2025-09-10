import { differenceInDays, isValid, parseISO } from 'date-fns'

export interface UrgencySettings {
  urgentDaysDefault: number
  warnDaysDefault: number
  whatsappTemplate: string
  perFieldOverrides?: {
    patent?: { urgent?: number; warn?: number }
    registration?: { urgent?: number; warn?: number }
    passport?: { urgent?: number; warn?: number }
    check?: { urgent?: number; warn?: number }
  }
}

export type DocumentField = 'patent' | 'registration' | 'passport' | 'check'

export interface DocumentStatus {
  field: DocumentField
  date: Date | null
  status: 'expired' | 'urgent' | 'warning' | 'ok' | 'empty'
  daysLeft: number
  message: string
}

export interface EmployeeUrgencyData {
  id: string
  fullName: string
  patentDate: Date | null
  registrationDate: Date | null
  passportDate: Date | null
  checkDate: Date | null
}

/**
 * Получает пороги срочности для конкретного поля документа
 */
export function getFieldThresholds(
  field: DocumentField, 
  settings: UrgencySettings
): { urgent: number; warn: number } {
  const overrides = settings.perFieldOverrides?.[field]
  
  return {
    urgent: overrides?.urgent ?? settings.urgentDaysDefault,
    warn: overrides?.warn ?? settings.warnDaysDefault
  }
}

/**
 * Вычисляет статус документа по дате
 */
export function calculateDocumentStatus(
  field: DocumentField,
  date: Date | string | null,
  settings: UrgencySettings
): DocumentStatus {
  if (!date) {
    return {
      field,
      date: null,
      status: 'empty',
      daysLeft: 0,
      message: ''
    }
  }

  const dateObj = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(dateObj)) {
    return {
      field,
      date: null,
      status: 'empty',
      daysLeft: 0,
      message: 'Неверная дата'
    }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const targetDate = new Date(dateObj)
  targetDate.setHours(0, 0, 0, 0)
  
  const daysLeft = differenceInDays(targetDate, today)
  const { urgent, warn } = getFieldThresholds(field, settings)
  
  const fieldNames = {
    patent: 'Патент',
    registration: 'Регистрация', 
    passport: 'Паспорт',
    check: 'Чек'
  }
  
  const fieldName = fieldNames[field]
  const dateStr = dateObj.toLocaleDateString('ru-RU')
  
  let status: DocumentStatus['status']
  let message: string
  
  if (daysLeft < 0) {
    // Просрочено
    status = 'expired'
    message = `${fieldName} просрочен ${dateStr}`
    if (field === 'passport') {
      message += ', необходимо заменить паспорт'
    }
  } else if (daysLeft <= urgent) {
    // Срочно
    status = 'urgent'
    if (daysLeft === 0) {
      message = `${fieldName} истекает сегодня (${dateStr})`
    } else if (daysLeft === 1) {
      message = `${fieldName} истекает завтра (${dateStr})`
    } else {
      message = `${fieldName} истекает через ${daysLeft} дн. (${dateStr})`
    }
    if (field === 'passport') {
      message += ', необходимо заменить паспорт'
    }
  } else if (daysLeft <= warn) {
    // Предупреждение
    status = 'warning'
    message = `${fieldName} истекает через ${daysLeft} дн. (${dateStr})`
  } else {
    // Всё в порядке
    status = 'ok'
    message = ''
  }
  
  return {
    field,
    date: dateObj,
    status,
    daysLeft,
    message
  }
}

/**
 * Вычисляет все проблемы сотрудника
 */
export function calculateEmployeeProblems(
  employee: EmployeeUrgencyData,
  settings: UrgencySettings
): DocumentStatus[] {
  const fields: Array<{ field: DocumentField; date: Date | null }> = [
    { field: 'patent', date: employee.patentDate },
    { field: 'registration', date: employee.registrationDate },
    { field: 'passport', date: employee.passportDate },
    { field: 'check', date: employee.checkDate }
  ]
  
  return fields
    .map(({ field, date }) => calculateDocumentStatus(field, date, settings))
    .filter(status => status.status !== 'empty' && status.status !== 'ok')
}

/**
 * Проверяет, есть ли у сотрудника срочные проблемы
 */
export function hasUrgentProblems(
  employee: EmployeeUrgencyData,
  settings: UrgencySettings
): boolean {
  const problems = calculateEmployeeProblems(employee, settings)
  return problems.some(p => p.status === 'expired' || p.status === 'urgent')
}

/**
 * Генерирует сообщение для WhatsApp
 */
export function generateWhatsAppMessage(
  employee: EmployeeUrgencyData,
  settings: UrgencySettings
): string {
  const problems = calculateEmployeeProblems(employee, settings)
  
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
  
  // Используем шаблон из настроек
  return settings.whatsappTemplate
    .replace('{name}', greeting)
    .replace('{problems}', problemsList)
}

/**
 * Получает настройки по умолчанию
 */
export function getDefaultSettings(): UrgencySettings {
  return {
    urgentDaysDefault: 7,
    warnDaysDefault: 30,
    perFieldOverrides: {},
    whatsappTemplate: 'Здравствуйте, {name}! {problems}. Пожалуйста, пришлите сканы.'
  }
}