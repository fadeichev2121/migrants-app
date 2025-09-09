import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const employeeId = params.id
    const body = await request.json()

    // Получаем текущего сотрудника
    const currentEmployee = await prisma.employee.findUnique({
      where: { id: employeeId }
    })

    if (!currentEmployee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }

    // Подготавливаем данные для обновления
    const updateData: any = {}

    // Обновление статуса
    if (body.status !== undefined) {
      updateData.status = body.status
    }

    // Обновление комментария
    if (body.comment !== undefined) {
      updateData.comment = body.comment.trim() || null
    }

    // Обновление дат
    const dateFields = ['patentDate', 'registrationDate', 'passportDate', 'checkDate']
    
    for (const field of dateFields) {
      if (body[field] !== undefined) {
        const newDate = body[field] ? new Date(body[field]) : null
        updateData[field] = newDate
      }
    }

    // Другие поля
    if (body.fullName !== undefined) {
      updateData.fullName = body.fullName.trim()
    }

    if (body.phone !== undefined) {
      updateData.phone = body.phone ? body.phone.replace(/\D/g, '') : null
    }

    if (body.department !== undefined) {
      updateData.department = body.department
    }

    // Если нет изменений
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(currentEmployee)
    }

    // Обновляем сотрудника
    const updatedEmployee = await prisma.employee.update({
      where: { id: employeeId },
      data: updateData
    })

    return NextResponse.json(updatedEmployee)
  } catch (error) {
    console.error('Error updating employee:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const employeeId = params.id

    // Проверяем существование
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId }
    })

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }

    // Удаляем сотрудника (каскадное удаление файлов)
    await prisma.employee.delete({
      where: { id: employeeId }
    })

    return NextResponse.json({ message: 'Employee deleted successfully' })
  } catch (error) {
    console.error('Error deleting employee:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}