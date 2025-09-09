const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Создание тестовых данных...')

  // Создаем пользователей
  const ownerPassword = await bcrypt.hash('admin123', 12)
  const hrPassword = await bcrypt.hash('hr123', 12)
  const managerPassword = await bcrypt.hash('manager123', 12)

  const owner = await prisma.user.upsert({
    where: { email: 'owner@company.com' },
    update: {},
    create: {
      email: 'owner@company.com',
      password: ownerPassword,
      name: 'Владелец Системы',
      role: 'OWNER'
    }
  })

  const hrAdmin = await prisma.user.upsert({
    where: { email: 'hr-admin@company.com' },
    update: {},
    create: {
      email: 'hr-admin@company.com',
      password: hrPassword,
      name: 'HR Администратор',
      role: 'HR_ADMIN'
    }
  })

  const hr = await prisma.user.upsert({
    where: { email: 'hr@company.com' },
    update: {},
    create: {
      email: 'hr@company.com',
      password: hrPassword,
      name: 'HR Специалист',
      role: 'HR'
    }
  })

  const manager = await prisma.user.upsert({
    where: { email: 'manager@company.com' },
    update: {},
    create: {
      email: 'manager@company.com',
      password: managerPassword,
      name: 'Менеджер Производства',
      role: 'MANAGER',
      department: 'Производство'
    }
  })

  console.log('Пользователи созданы:', { owner: owner.email, hrAdmin: hrAdmin.email, hr: hr.email, manager: manager.email })

  // Создаем тестовых сотрудников
  const departments = ['Производство', 'Склад', 'Упаковка', 'Доставка', 'Клининг']
  const employees = []

  const names = [
    'Абдулов Азиз Рахимович',
    'Алиев Джамшед Бахтиярович',
    'Ахмедов Фарход Шерзодович',
    'Бабаев Сардор Улугбекович',
    'Валиев Дилшод Нурматович',
    'Гафуров Шохрух Абдуллаевич',
    'Джураев Бахтиёр Олимович',
    'Ергашев Мирзо Каримович',
    'Жураев Отабек Рустамович',
    'Зокиров Дониёр Хакимович',
    'Исламов Жасур Шухратович',
    'Кадыров Умид Собирович',
    'Латипов Санжар Маратович',
    'Мирзаев Элдор Ахмадович',
    'Назаров Шерзод Мирзаевич',
    'Олимов Фаррух Анварович',
    'Пулатов Жахонгир Абдурахимович',
    'Рахимов Улугбек Зокирович',
    'Салимов Дилмурод Нуриддинович',
    'Турсунов Азамат Хуршидович',
    'Умаров Бобур Муродович',
    'Файзуллаев Достон Рашидович',
    'Хакимов Джавохир Исроилович',
    'Цой Александр Владимирович',
    'Чориев Мухаммад Али Хасанович',
    'Шарипов Нодир Кахарович',
    'Эргашев Жавлон Абдувахобович',
    'Юлдашев Шахзод Абдуллаевич',
    'Якубов Фаррух Ботирович',
    'Ядгаров Нурбек Рахматуллаевич',
    'Абдураимов Зокир Шукурович',
    'Ахмедова Нилуфар Абдуллаевна',
    'Валиева Мухлиса Комилжоновна',
    'Гафурова Дилфуза Рахматовна',
    'Джураева Севара Олимжоновна',
    'Исламова Мадина Жасуровна',
    'Кадырова Нигора Умидовна',
    'Мирзаева Гулнора Элдоровна',
    'Олимова Дилноза Фаррухевна',
    'Рахимова Шахноза Улугбековна',
    'Турсунова Нозима Азаматовна',
    'Умарова Дилором Бобуровна',
    'Хакимова Нигина Джавохировна',
    'Шарипова Гулшан Нодировна',
    'Юлдашева Мукаддас Шахзодовна'
  ]

  const today = new Date()
  
  for (let i = 0; i < 45; i++) {
    const name = names[i]
    const department = departments[Math.floor(Math.random() * departments.length)]
    const phone = `7900${String(Math.floor(Math.random() * 10000000)).padStart(7, '0')}`
    
    // Генерируем даты с разными статусами
    const patentDays = Math.floor(Math.random() * 120) - 30 // от -30 до +90 дней
    const registrationDays = Math.floor(Math.random() * 120) - 30
    const passportDays = Math.floor(Math.random() * 365) + 30 // от +30 до +395 дней (паспорта на дольше)
    const checkDays = Math.floor(Math.random() * 60) - 15 // от -15 до +45 дней
    
    const patentDate = new Date(today)
    patentDate.setDate(patentDate.getDate() + patentDays)
    
    const registrationDate = new Date(today)
    registrationDate.setDate(registrationDate.getDate() + registrationDays)
    
    const passportDate = new Date(today)
    passportDate.setDate(passportDate.getDate() + passportDays)
    
    const checkDate = new Date(today)
    checkDate.setDate(checkDate.getDate() + checkDays)
    
    // Некоторые сотрудники без телефона для тестирования валидации
    const hasPhone = Math.random() > 0.1 // 90% с телефоном
    
    // Некоторые с комментариями
    const comments = [
      null,
      'Документы на проверке',
      'Ожидает продление патента',
      'Новый сотрудник',
      'Требует внимания',
      'Документы в порядке',
      'Связаться в понедельник'
    ]
    const comment = Math.random() > 0.6 ? comments[Math.floor(Math.random() * comments.length)] : null
    
    // Статус отправки (некоторые уже отправлены)
    const status = Math.random() > 0.8 ? 'SENT' : 'ACTIVE'
    
    const employee = await prisma.employee.create({
      data: {
        fullName: name,
        phone: hasPhone ? phone : null,
        department,
        patentDate,
        registrationDate,
        passportDate,
        checkDate,
        comment,
        status
      }
    })
    
    employees.push(employee)
  }

  console.log(`Создано ${employees.length} сотрудников`)

  // Создаем audit logs для некоторых действий
  const auditCount = Math.min(20, employees.length)
  for (let i = 0; i < auditCount; i++) {
    const employee = employees[i]
    const user = Math.random() > 0.5 ? hr : manager
    
    await prisma.auditLog.create({
      data: {
        employeeId: employee.id,
        userId: user.id,
        action: 'update_comment',
        field: 'comment',
        oldValue: null,
        newValue: employee.comment
      }
    })
  }

  console.log(`Создано ${auditCount} audit logs`)
  console.log('\nТестовые данные созданы успешно!')
  console.log('\nДанные для входа:')
  console.log('Владелец: owner@company.com / admin123')
  console.log('HR Админ: hr-admin@company.com / hr123')
  console.log('HR: hr@company.com / hr123')
  console.log('Менеджер: manager@company.com / manager123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })