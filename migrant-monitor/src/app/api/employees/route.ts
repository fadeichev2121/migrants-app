import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isDateUrgent } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const urgent = searchParams.get('urgent') === 'true'
    const department = searchParams.get('department')

    // Базовый запрос
    let whereClause: any = {}

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

    // Фильтрация по срочности на уровне приложения
    let filteredEmployees = employees

    if (urgent) {
      filteredEmployees = employees.filter(employee => {
        return (
          isDateUrgent(employee.patentDate) ||
          isDateUrgent(employee.registrationDate) ||
          isDateUrgent(employee.passportDate) ||
          isDateUrgent(employee.checkDate)
        )
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