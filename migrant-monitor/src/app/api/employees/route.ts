import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hasUrgentProblems, type UrgencySettings } from '@/lib/urgency'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const urgent = searchParams.get('urgent') === 'true'
    const department = searchParams.get('department')

    // Базовый запрос
    const whereClause: Record<string, unknown> = {}

    // Фильтр по отделу
    if (department) {
      whereClause.department = department
    }

    const employees = await prisma.employee.findMany({
      where: whereClause,
      orderBy: [
        { fullName: 'asc' }
      ]
    })

    // Получаем настройки для фильтрации
    const settings = await prisma.settings.findUnique({ where: { id: 1 } })
    const urgencySettings: UrgencySettings = settings ? {
      urgentDaysDefault: settings.urgentDaysDefault,
      warnDaysDefault: settings.warnDaysDefault,
      whatsappTemplate: settings.whatsappTemplate,
      perFieldOverrides: (settings.perFieldOverrides as Record<string, unknown>) || {}
    } : {
      urgentDaysDefault: 7,
      warnDaysDefault: 30,
      whatsappTemplate: 'Здравствуйте, {name}! {problems}. Пожалуйста, пришлите сканы.',
      perFieldOverrides: {}
    }

    // Фильтрация по срочности на уровне приложения
    let filteredEmployees = employees

    if (urgent) {
      filteredEmployees = employees.filter(employee => {
        return hasUrgentProblems(employee, urgencySettings)
      })
    }

    // Пересчитываем автонумерацию
    const employeesWithNumbers = filteredEmployees.map((employee, index) => ({
      ...employee,
      number: employee.fullName ? index + 1 : null
    }))

    return NextResponse.json(employeesWithNumbers)
  } catch (error) {
    console.error('Error fetching employees:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      fullName,
      phone,
      department,
      patentDate,
      registrationDate,
      passportDate,
      checkDate,
      comment
    } = body

    // Нормализуем телефон
    const normalizedPhone = phone ? phone.replace(/\D/g, '') : null

    // Парсим даты
    const parseDate = (dateStr: string) => {
      if (!dateStr) return null
      return new Date(dateStr)
    }

    const employee = await prisma.employee.create({
      data: {
        fullName: fullName.trim(),
        phone: normalizedPhone,
        department,
        patentDate: parseDate(patentDate),
        registrationDate: parseDate(registrationDate),
        passportDate: parseDate(passportDate),
        checkDate: parseDate(checkDate),
        comment: comment?.trim() || null
      }
    })

    return NextResponse.json(employee, { status: 201 })
  } catch (error) {
    console.error('Error creating employee:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}