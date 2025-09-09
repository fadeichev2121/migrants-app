import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const employeeId = params.id
    const body = await request.json()

    // Получаем текущего сотрудника
    const currentEmployee = await prisma.employee.findUnique({
      where: { id: employeeId }
    })

    if (!currentEmployee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }

    // Проверяем права доступа
    const canEdit = ['OWNER', 'HR_ADMIN', 'HR'].includes(session.user.role)
    const canEditStatus = ['OWNER', 'HR_ADMIN', 'HR', 'MANAGER'].includes(session.user.role)

    // Подготавливаем данные для обновления
    const updateData: any = {}
    const auditLogs: any[] = []

    // Обновление статуса
    if (body.status !== undefined && canEditStatus) {
      updateData.status = body.status
      auditLogs.push({
        employeeId,
        userId: session.user.id,
        action: 'update_status',
        field: 'status',
        oldValue: currentEmployee.status,
        newValue: body.status
      })
    }

    // Обновление комментария (доступно и менеджерам)
    if (body.comment !== undefined && (canEdit || session.user.role === 'MANAGER')) {
      updateData.comment = body.comment.trim() || null
      auditLogs.push({
        employeeId,
        userId: session.user.id,
        action: 'update_comment',
        field: 'comment',
        oldValue: currentEmployee.comment,
        newValue: updateData.comment
      })
    }

    // Обновление дат (только HR роли)
    if (canEdit) {
      const dateFields = ['patentDate', 'registrationDate', 'passportDate', 'checkDate']
      
      for (const field of dateFields) {
        if (body[field] !== undefined) {
          const newDate = body[field] ? new Date(body[field]) : null
          updateData[field] = newDate
          
          auditLogs.push({
            employeeId,
            userId: session.user.id,
            action: 'update_date',
            field,
            oldValue: currentEmployee[field as keyof typeof currentEmployee]?.toString(),
            newValue: newDate?.toString()
          })
        }
      }

      // Другие поля
      if (body.fullName !== undefined) {
        updateData.fullName = body.fullName.trim()
        auditLogs.push({
          employeeId,
          userId: session.user.id,
          action: 'update_field',
          field: 'fullName',
          oldValue: currentEmployee.fullName,
          newValue: updateData.fullName
        })
      }

      if (body.phone !== undefined) {
        updateData.phone = body.phone ? body.phone.replace(/\D/g, '') : null
        auditLogs.push({
          employeeId,
          userId: session.user.id,
          action: 'update_field',
          field: 'phone',
          oldValue: currentEmployee.phone,
          newValue: updateData.phone
        })
      }

      if (body.department !== undefined) {
        updateData.department = body.department
        auditLogs.push({
          employeeId,
          userId: session.user.id,
          action: 'update_field',
          field: 'department',
          oldValue: currentEmployee.department,
          newValue: updateData.department
        })
      }
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

    // Создаем audit logs
    if (auditLogs.length > 0) {
      await prisma.auditLog.createMany({
        data: auditLogs
      })
    }

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
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Только владелец и HR админ могут удалять
    if (!['OWNER', 'HR_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const employeeId = params.id

    // Проверяем существование
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId }
    })

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }

    // Удаляем сотрудника (каскадное удаление файлов и логов)
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