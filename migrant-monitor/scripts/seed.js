const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Создание seed данных...')

  // Создаем настройки по умолчанию
  const settings = await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      urgentDaysDefault: 7,
      warnDaysDefault: 30,
      whatsappTemplate: 'Здравствуйте, {name}! {problems}. Пожалуйста, пришлите сканы.',
      perFieldOverrides: {
        passport: { urgent: 30, warn: 90 }, // паспорт менее срочный
        patent: { urgent: 7, warn: 30 },    // патент стандартно
        registration: { urgent: 5, warn: 14 }, // регистрация более срочная
        check: { urgent: 3, warn: 10 }      // чеки очень срочные
      }
    }
  })

  console.log('✅ Настройки созданы')

  // Создаем тестовых сотрудников
  const departments = ['Производство', 'Склад', 'Упаковка', 'Доставка', 'Клининг']
  
  const employees = [
    {
      fullName: 'Абдулов Азиз Рахимович',
      phone: '79001234567',
      department: 'Производство',
      comment: 'Новый сотрудник, документы на проверке'
    },
    {
      fullName: 'Алиев Джамшед Бахтиярович',
      phone: '79007654321',
      department: 'Склад',
      comment: 'Требует внимания по патенту'
    },
    {
      fullName: 'Ахмедова Нилуфар Абдуллаевна',
      phone: '79009876543',
      department: 'Упаковка',
      comment: null
    },
    {
      fullName: 'Валиев Дилшод Нурматович',
      phone: null, // без телефона для тестирования
      department: 'Доставка',
      comment: 'Связаться через коллегу'
    },
    {
      fullName: 'Гафуров Шохрух Абдуллаевич',
      phone: '79005555555',
      department: 'Клининг',
      comment: 'Документы в порядке'
    },
    {
      fullName: 'Джураева Севара Олимжоновна',
      phone: '79002222222',
      department: 'Производство',
      comment: 'Ожидает продление регистрации'
    },
    {
      fullName: 'Исламов Жасур Шухратович',
      phone: '79008888888',
      department: 'Склад',
      comment: null
    },
    {
      fullName: 'Мирзаева Гулнора Элдоровна',
      phone: '79003333333',
      department: 'Упаковка',
      comment: 'Срочно обновить паспорт'
    }
  ]

  const today = new Date()
  
  for (let i = 0; i < employees.length; i++) {
    const employeeData = employees[i]
    
    // Генерируем разные даты для тестирования
    const patentDays = Math.floor(Math.random() * 90) - 30    // от -30 до +60 дней
    const registrationDays = Math.floor(Math.random() * 60) - 20 // от -20 до +40 дней  
    const passportDays = Math.floor(Math.random() * 200) + 30   // от +30 до +230 дней
    const checkDays = Math.floor(Math.random() * 40) - 10       // от -10 до +30 дней
    
    const patentDate = new Date(today)
    patentDate.setDate(patentDate.getDate() + patentDays)
    
    const registrationDate = new Date(today)
    registrationDate.setDate(registrationDate.getDate() + registrationDays)
    
    const passportDate = new Date(today)
    passportDate.setDate(passportDate.getDate() + passportDays)
    
    const checkDate = new Date(today)
    checkDate.setDate(checkDate.getDate() + checkDays)
    
    // Некоторые сотрудники уже "отправлены"
    const sent = Math.random() > 0.7 // 30% отправлены
    
    const employee = await prisma.employee.create({
      data: {
        fullName: employeeData.fullName,
        phone: employeeData.phone,
        department: employeeData.department,
        comment: employeeData.comment,
        sent,
        patentDate,
        registrationDate,
        passportDate,
        checkDate
      }
    })
    
    console.log(`✅ Создан сотрудник: ${employee.fullName}`)
  }

  console.log(`\n🎉 Создано ${employees.length} сотрудников`)
  console.log('\n📋 Статистика дат:')
  console.log('   • Просроченные документы: есть у некоторых сотрудников')
  console.log('   • Срочные (≤7 дней): есть у некоторых сотрудников') 
  console.log('   • Предупреждения (≤30 дней): есть у некоторых сотрудников')
  console.log('   • Нормальные (>30 дней): есть у некоторых сотрудников')
  console.log('\n🚀 Приложение готово к использованию!')
  console.log('   Запустите: npm run dev')
  console.log('   Откройте: http://localhost:3000')
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при создании seed данных:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })