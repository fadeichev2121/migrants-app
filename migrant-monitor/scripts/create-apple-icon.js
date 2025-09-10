const { createCanvas } = require('canvas')
const fs = require('fs')
const path = require('path')

function createAppleIcon() {
  const size = 180 // Apple icon standard size
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')
  
  // Фон с градиентом
  const gradient = ctx.createLinearGradient(0, 0, size, size)
  gradient.addColorStop(0, '#3b82f6')
  gradient.addColorStop(1, '#6366f1')
  
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  
  // Закругленные углы (более крупные для Apple стиля)
  ctx.globalCompositeOperation = 'destination-in'
  ctx.beginPath()
  ctx.roundRect(0, 0, size, size, size * 0.2) // 20% radius
  ctx.fill()
  
  ctx.globalCompositeOperation = 'source-over'
  
  // Иконка пользователя (масштабированная)
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 8
  ctx.lineCap = 'round'
  
  const centerX = size / 2
  const centerY = size / 2
  
  // Голова
  ctx.beginPath()
  ctx.arc(centerX, centerY - 20, 25, 0, Math.PI * 2)
  ctx.stroke()
  
  // Тело
  ctx.beginPath()
  ctx.arc(centerX, centerY + 50, 50, Math.PI, 0, true)
  ctx.stroke()
  
  return canvas.toBuffer('image/png')
}

// Создаем Apple иконку
const appleIconBuffer = createAppleIcon()

// Сохраняем
const outputPath = path.join(__dirname, '../src/app/apple-icon.png')
fs.writeFileSync(outputPath, appleIconBuffer)

console.log('Apple icon создана успешно!')
console.log('Размер файла:', appleIconBuffer.length, 'байт')