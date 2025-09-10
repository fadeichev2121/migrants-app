import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { uploadFile, getUploadConfig } from '@/lib/upload'
import { DocumentType } from '@prisma/client'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: employeeId } = await params

    const documents = await prisma.document.findMany({
      where: { employeeId },
      orderBy: { uploadedAt: 'desc' }
    })

    return NextResponse.json(documents)
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: employeeId } = await params
    
    // Проверяем существование сотрудника
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId }
    })

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }

    const formData = await request.formData()
    const documentType = formData.get('type') as string

    if (!documentType || !Object.values(DocumentType).includes(documentType as DocumentType)) {
      return NextResponse.json(
        { error: 'Invalid document type' },
        { status: 400 }
      )
    }

    // Загружаем файл
    const config = getUploadConfig()
    const uploadResult = await uploadFile(formData, employeeId, config)

    if (!uploadResult.success) {
      return NextResponse.json(
        { error: uploadResult.error },
        { status: 400 }
      )
    }

    // Сохраняем информацию о документе в БД
    const document = await prisma.document.create({
      data: {
        employeeId,
        type: documentType as DocumentType,
        fileName: uploadResult.fileName!,
        mimeType: uploadResult.mimeType!,
        size: uploadResult.size!,
        storedAt: uploadResult.storedAt!
      }
    })

    return NextResponse.json(document, { status: 201 })
  } catch (error) {
    console.error('Error uploading document:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}