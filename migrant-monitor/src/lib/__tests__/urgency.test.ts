import { describe, it, expect, beforeEach } from 'vitest'
import {
  calculateDocumentStatus,
  calculateEmployeeProblems,
  hasUrgentProblems,
  generateWhatsAppMessage,
  getFieldThresholds,
  getDefaultSettings,
  type UrgencySettings,
  type EmployeeUrgencyData
} from '../urgency'

describe('Urgency Logic', () => {
  let defaultSettings: UrgencySettings
  let testEmployee: EmployeeUrgencyData

  beforeEach(() => {
    defaultSettings = getDefaultSettings()
    
    testEmployee = {
      id: 'test-1',
      fullName: 'Иванов Иван Иванович',
      patentDate: null,
      registrationDate: null,
      passportDate: null,
      checkDate: null
    }
  })

  describe('getFieldThresholds', () => {
    it('возвращает настройки по умолчанию', () => {
      const thresholds = getFieldThresholds('patent', defaultSettings)
      expect(thresholds).toEqual({ urgent: 7, warn: 30 })
    })

    it('применяет переопределения для поля', () => {
      const customSettings: UrgencySettings = {
        ...defaultSettings,
        perFieldOverrides: {
          patent: { urgent: 3, warn: 14 }
        }
      }
      
      const thresholds = getFieldThresholds('patent', customSettings)
      expect(thresholds).toEqual({ urgent: 3, warn: 14 })
    })

    it('частично применяет переопределения', () => {
      const customSettings: UrgencySettings = {
        ...defaultSettings,
        perFieldOverrides: {
          patent: { urgent: 5 } // только urgent, warn остается по умолчанию
        }
      }
      
      const thresholds = getFieldThresholds('patent', customSettings)
      expect(thresholds).toEqual({ urgent: 5, warn: 30 })
    })
  })

  describe('calculateDocumentStatus', () => {
    it('возвращает empty для null даты', () => {
      const status = calculateDocumentStatus('patent', null, defaultSettings)
      expect(status.status).toBe('empty')
      expect(status.message).toBe('')
    })

    it('возвращает empty для невалидной даты', () => {
      const status = calculateDocumentStatus('patent', 'invalid-date', defaultSettings)
      expect(status.status).toBe('empty')
      expect(status.message).toBe('Неверная дата')
    })

    it('определяет просроченную дату', () => {
      const expiredDate = new Date()
      expiredDate.setDate(expiredDate.getDate() - 5) // 5 дней назад
      
      const status = calculateDocumentStatus('patent', expiredDate, defaultSettings)
      expect(status.status).toBe('expired')
      expect(status.daysLeft).toBe(-5)
      expect(status.message).toContain('Патент просрочен')
    })

    it('определяет срочную дату', () => {
      const urgentDate = new Date()
      urgentDate.setDate(urgentDate.getDate() + 3) // через 3 дня
      
      const status = calculateDocumentStatus('patent', urgentDate, defaultSettings)
      expect(status.status).toBe('urgent')
      expect(status.daysLeft).toBe(3)
      expect(status.message).toContain('Патент истекает через 3 дн.')
    })

    it('определяет предупреждающую дату', () => {
      const warnDate = new Date()
      warnDate.setDate(warnDate.getDate() + 15) // через 15 дней
      
      const status = calculateDocumentStatus('patent', warnDate, defaultSettings)
      expect(status.status).toBe('warning')
      expect(status.daysLeft).toBe(15)
      expect(status.message).toContain('Патент истекает через 15 дн.')
    })

    it('определяет нормальную дату', () => {
      const okDate = new Date()
      okDate.setDate(okDate.getDate() + 60) // через 60 дней
      
      const status = calculateDocumentStatus('patent', okDate, defaultSettings)
      expect(status.status).toBe('ok')
      expect(status.daysLeft).toBe(60)
      expect(status.message).toBe('')
    })

    it('добавляет специальное сообщение для паспорта', () => {
      const expiredDate = new Date()
      expiredDate.setDate(expiredDate.getDate() - 1)
      
      const status = calculateDocumentStatus('passport', expiredDate, defaultSettings)
      expect(status.message).toContain('необходимо заменить паспорт')
    })

    it('обрабатывает сегодняшнюю дату', () => {
      const today = new Date()
      
      const status = calculateDocumentStatus('patent', today, defaultSettings)
      expect(status.status).toBe('urgent')
      expect(status.daysLeft).toBe(0)
      expect(status.message).toContain('истекает сегодня')
    })

    it('обрабатывает завтрашнюю дату', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      const status = calculateDocumentStatus('patent', tomorrow, defaultSettings)
      expect(status.status).toBe('urgent')
      expect(status.daysLeft).toBe(1)
      expect(status.message).toContain('истекает завтра')
    })
  })

  describe('calculateEmployeeProblems', () => {
    it('возвращает пустой массив для сотрудника без проблем', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 60)
      
      testEmployee.patentDate = futureDate
      testEmployee.passportDate = futureDate
      
      const problems = calculateEmployeeProblems(testEmployee, defaultSettings)
      expect(problems).toHaveLength(0)
    })

    it('находит все проблемы сотрудника', () => {
      const expiredDate = new Date()
      expiredDate.setDate(expiredDate.getDate() - 5)
      
      const urgentDate = new Date()
      urgentDate.setDate(urgentDate.getDate() + 3)
      
      testEmployee.patentDate = expiredDate
      testEmployee.registrationDate = urgentDate
      
      const problems = calculateEmployeeProblems(testEmployee, defaultSettings)
      expect(problems).toHaveLength(2)
      expect(problems[0].status).toBe('expired')
      expect(problems[1].status).toBe('urgent')
    })

    it('игнорирует пустые даты', () => {
      const expiredDate = new Date()
      expiredDate.setDate(expiredDate.getDate() - 5)
      
      testEmployee.patentDate = expiredDate
      testEmployee.registrationDate = null // пустая дата
      
      const problems = calculateEmployeeProblems(testEmployee, defaultSettings)
      expect(problems).toHaveLength(1)
      expect(problems[0].field).toBe('patent')
    })
  })

  describe('hasUrgentProblems', () => {
    it('возвращает true для просроченных документов', () => {
      const expiredDate = new Date()
      expiredDate.setDate(expiredDate.getDate() - 1)
      
      testEmployee.patentDate = expiredDate
      
      expect(hasUrgentProblems(testEmployee, defaultSettings)).toBe(true)
    })

    it('возвращает true для срочных документов', () => {
      const urgentDate = new Date()
      urgentDate.setDate(urgentDate.getDate() + 3)
      
      testEmployee.registrationDate = urgentDate
      
      expect(hasUrgentProblems(testEmployee, defaultSettings)).toBe(true)
    })

    it('возвращает false для предупреждающих документов', () => {
      const warnDate = new Date()
      warnDate.setDate(warnDate.getDate() + 15)
      
      testEmployee.passportDate = warnDate
      
      expect(hasUrgentProblems(testEmployee, defaultSettings)).toBe(false)
    })

    it('возвращает false для нормальных документов', () => {
      const okDate = new Date()
      okDate.setDate(okDate.getDate() + 60)
      
      testEmployee.checkDate = okDate
      
      expect(hasUrgentProblems(testEmployee, defaultSettings)).toBe(false)
    })
  })

  describe('generateWhatsAppMessage', () => {
    it('возвращает пустую строку для сотрудника без проблем', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 60)
      
      testEmployee.patentDate = futureDate
      
      const message = generateWhatsAppMessage(testEmployee, defaultSettings)
      expect(message).toBe('')
    })

    it('генерирует сообщение с именем и отчеством', () => {
      const expiredDate = new Date()
      expiredDate.setDate(expiredDate.getDate() - 5)
      
      testEmployee.fullName = 'Петров Петр Петрович'
      testEmployee.patentDate = expiredDate
      
      const message = generateWhatsAppMessage(testEmployee, defaultSettings)
      expect(message).toContain('Петр Петрович')
      expect(message).toContain('Патент просрочен')
    })

    it('использует полное ФИО для коротких имен', () => {
      const expiredDate = new Date()
      expiredDate.setDate(expiredDate.getDate() - 5)
      
      testEmployee.fullName = 'Ли Вэй'
      testEmployee.patentDate = expiredDate
      
      const message = generateWhatsAppMessage(testEmployee, defaultSettings)
      expect(message).toContain('Ли Вэй')
    })

    it('перечисляет несколько проблем', () => {
      const expiredDate = new Date()
      expiredDate.setDate(expiredDate.getDate() - 5)
      
      const urgentDate = new Date()
      urgentDate.setDate(urgentDate.getDate() + 2)
      
      testEmployee.patentDate = expiredDate
      testEmployee.registrationDate = urgentDate
      
      const message = generateWhatsAppMessage(testEmployee, defaultSettings)
      expect(message).toContain('Патент просрочен')
      expect(message).toContain('Регистрация истекает через 2 дн.')
    })

    it('использует кастомный шаблон', () => {
      const customSettings: UrgencySettings = {
        ...defaultSettings,
        whatsappTemplate: 'Привет, {name}! У вас проблемы: {problems}. Срочно!'
      }
      
      const expiredDate = new Date()
      expiredDate.setDate(expiredDate.getDate() - 1)
      testEmployee.patentDate = expiredDate
      
      const message = generateWhatsAppMessage(testEmployee, customSettings)
      expect(message).toContain('Привет, Иван Иванович!')
      expect(message).toContain('Срочно!')
    })
  })

  describe('Custom field thresholds', () => {
    it('применяет разные пороги для разных полей', () => {
      const customSettings: UrgencySettings = {
        urgentDaysDefault: 7,
        warnDaysDefault: 30,
        perFieldOverrides: {
          passport: { urgent: 30, warn: 90 }, // паспорт менее срочный
          patent: { urgent: 3, warn: 10 }     // патент более срочный
        }
      }
      
      const date5Days = new Date()
      date5Days.setDate(date5Days.getDate() + 5)
      
      // Для патента 5 дней = не срочно (> 3)
      const patentStatus = calculateDocumentStatus('patent', date5Days, customSettings)
      expect(patentStatus.status).toBe('warning')
      
      // Для паспорта 5 дней = очень срочно (< 30)
      const passportStatus = calculateDocumentStatus('passport', date5Days, customSettings)
      expect(passportStatus.status).toBe('urgent')
    })
  })
})