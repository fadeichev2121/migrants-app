import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    let settings = await prisma.settings.findUnique({
      where: { id: 1 }
    })

    // Создаем настройки по умолчанию, если их нет
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          id: 1,
          urgentDaysDefault: 7,
          warnDaysDefault: 30,
          whatsappTemplate: 'Здравствуйте, {name}! {problems}. Пожалуйста, пришлите сканы.',
          perFieldOverrides: {}
        }
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      urgentDaysDefault,
      warnDaysDefault,
      whatsappTemplate,
      perFieldOverrides
    } = body

    const settings = await prisma.settings.upsert({
      where: { id: 1 },
      update: {
        urgentDaysDefault,
        warnDaysDefault,
        whatsappTemplate,
        perFieldOverrides
      },
      create: {
        id: 1,
        urgentDaysDefault,
        warnDaysDefault,
        whatsappTemplate,
        perFieldOverrides
      }
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}