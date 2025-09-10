const { createCanvas } = require('canvas')
const fs = require('fs')
const path = require('path')

function createIcon(size, filename) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')
  
  // Фон с градиентом
  const gradient = ctx.createLinearGradient(0, 0, size, size)
  gradient.addColorStop(0, '#3b82f6') // blue-500
  gradient.addColorStop(1, '#6366f1') // indigo-500
  
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  
  // Закругленные углы
  ctx.globalCompositeOperation = 'destination-in'
  ctx.beginPath()
  const radius = size * 0.125 // 12.5% radius
  ctx.roundRect(0, 0, size, size, radius)
  ctx.fill()
  
  ctx.globalCompositeOperation = 'source-over'
  
  // Иконка пользователя
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = Math.max(2, size * 0.02)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  
  const centerX = size / 2
  const centerY = size / 2
  const scale = size / 192
  
  // Голова
  ctx.beginPath()
  ctx.arc(centerX - 8 * scale, centerY - 20 * scale, 16 * scale, 0, Math.PI * 2)
  ctx.stroke()
  
  // Тело
  ctx.beginPath()
  ctx.arc(centerX - 8 * scale, centerY + 20 * scale, 32 * scale, Math.PI, 0, true)
  ctx.stroke()
  
  // Сохраняем PNG
  const buffer = canvas.toBuffer('image/png')
  const outputPath = path.join(__dirname, '../public', filename)
  fs.writeFileSync(outputPath, buffer)
  
  console.log(`✅ Создан ${filename} (${size}x${size}) - ${buffer.length} байт`)
  return buffer
}

// Удаляем старые иконки
const publicDir = path.join(__dirname, '../public')
const oldIcons = ['favicon.ico', 'favicon.png', 'apple-icon.png', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png']
oldIcons.forEach(icon => {
  const iconPath = path.join(publicDir, icon)
  if (fs.existsSync(iconPath)) {
    fs.unlinkSync(iconPath)
    console.log(`🗑️  Удален старый ${icon}`)
  }
})

console.log('🎨 Создаю новые иконки...')

// Создаем все необходимые иконки
createIcon(16, 'favicon.png')           // Маленький favicon
createIcon(32, 'favicon-32.png')        // Стандартный favicon
createIcon(180, 'apple-icon.png')       // Apple touch icon
createIcon(192, 'icon-192.png')         // PWA иконка
createIcon(512, 'icon-512.png')         // PWA иконка большая

// Копируем favicon.png как favicon.ico
const faviconPng = fs.readFileSync(path.join(publicDir, 'favicon.png'))
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), faviconPng)
console.log('✅ Создан favicon.ico (копия favicon.png)')

console.log('🎉 Все иконки созданы успешно!')