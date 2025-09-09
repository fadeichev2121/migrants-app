import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
import { isDateUrgent } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const urgent = searchParams.get('urgent') === 'true'
    const department = searchParams.get('department')

    // Базовый запрос
    let whereClause: any = {}

    // Фильтр по отделу для менеджеров
    if (session.user.role === UserRole.MANAGER && (department || session.user.department)) {
      whereClause.department = department || session.user.department
    }

    // Для employee - только свой профиль
    if (session.user.role === UserRole.EMPLOYEE) {
      // В будущем можно добавить связь employee -> user
      return NextResponse.json([])
    }

    const employees = await prisma.employee.findMany({
      where: whereClause,
      orderBy: [
        { number: 'asc' },
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
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Проверяем права доступа
    if (!['OWNER', 'HR_ADMIN', 'HR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

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

    // Создаем audit log
    await prisma.auditLog.create({
      data: {
        employeeId: employee.id,
        userId: session.user.id,
        action: 'create_employee',
        newValue: JSON.stringify({
          fullName: employee.fullName,
          phone: employee.phone,
          department: employee.department
        })
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