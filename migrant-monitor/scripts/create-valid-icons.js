const { createCanvas } = require('canvas')
const fs = require('fs')
const path = require('path')

function createValidIcon(size, filename) {
  console.log(`🎨 Создаю ${filename} (${size}x${size})...`)
  
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')
  
  // Градиентный фон
  const gradient = ctx.createLinearGradient(0, 0, size, size)
  gradient.addColorStop(0, '#3b82f6') // blue-500
  gradient.addColorStop(1, '#6366f1') // indigo-500
  
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  
  // Закругленные углы (больше для больших иконок)
  ctx.globalCompositeOperation = 'destination-in'
  ctx.beginPath()
  const radius = size * (size >= 180 ? 0.2 : 0.125) // 20% для больших, 12.5% для маленьких
  ctx.roundRect(0, 0, size, size, radius)
  ctx.fill()
  
  ctx.globalCompositeOperation = 'source-over'
  
  // Иконка человека
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = Math.max(2, size * 0.025)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  
  const centerX = size / 2
  const centerY = size / 2
  const scale = size / 100
  
  // Голова
  ctx.beginPath()
  ctx.arc(centerX, centerY - 15 * scale, 12 * scale, 0, Math.PI * 2)
  ctx.stroke()
  
  // Тело (плечи и туловище)
  ctx.beginPath()
  ctx.arc(centerX, centerY + 25 * scale, 25 * scale, Math.PI, 0, true)
  ctx.stroke()
  
  // Сохраняем как PNG с правильной сигнатурой
  const buffer = canvas.toBuffer('image/png')
  const outputPath = path.join(__dirname, '../public', filename)
  fs.writeFileSync(outputPath, buffer)
  
  console.log(`✅ ${filename} создан: ${buffer.length} байт`)
  return buffer
}

console.log('🗑️  Удаляю старые иконки из public...')

// Удаляем все старые иконки
const publicDir = path.join(__dirname, '../public')
const iconsToRemove = [
  'favicon.ico', 'favicon.png', 'favicon-32.png',
  'apple-icon.png', 'apple-touch-icon.png',
  'icon-192.png', 'icon-512.png'
]

iconsToRemove.forEach(iconName => {
  const iconPath = path.join(publicDir, iconName)
  if (fs.existsSync(iconPath)) {
    fs.unlinkSync(iconPath)
    console.log(`🗑️  Удален ${iconName}`)
  }
})

console.log('\n🎨 Создаю новые валидные PNG иконки...')

// Создаем все необходимые иконки
createValidIcon(32, 'favicon.png')           // Favicon
createValidIcon(180, 'apple-icon.png')       // Apple touch icon
createValidIcon(192, 'icon-192.png')         // PWA иконка 192x192
createValidIcon(512, 'icon-512.png')         // PWA иконка 512x512

console.log('\n🎉 Все валидные PNG иконки созданы успешно!')
console.log('\n📋 Созданы файлы:')
console.log('   • favicon.png (32x32)')
console.log('   • apple-icon.png (180x180)')
console.log('   • icon-192.png (192x192)')
console.log('   • icon-512.png (512x512)')