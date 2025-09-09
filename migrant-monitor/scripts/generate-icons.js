const { createCanvas } = require('canvas')
const fs = require('fs')
const path = require('path')

function generateIcon(size) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')
  
  // Фон
  ctx.fillStyle = '#3b82f6'
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
  ctx.lineWidth = size * 0.02
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
  
  // Стрелка
  ctx.beginPath()
  ctx.moveTo(centerX + 32 * scale, centerY - 4 * scale)
  ctx.lineTo(centerX + 24 * scale, centerY - 12 * scale)
  ctx.moveTo(centerX + 32 * scale, centerY - 4 * scale)
  ctx.lineTo(centerX + 24 * scale, centerY + 4 * scale)
  ctx.moveTo(centerX + 8 * scale, centerY - 4 * scale)
  ctx.lineTo(centerX + 32 * scale, centerY - 4 * scale)
  ctx.stroke()
  
  return canvas.toBuffer('image/png')
}

// Создаем иконки
const icon192 = generateIcon(192)
const icon512 = generateIcon(512)

// Сохраняем
fs.writeFileSync(path.join(__dirname, '../public/icon-192.png'), icon192)
fs.writeFileSync(path.join(__dirname, '../public/icon-512.png'), icon512)

console.log('Иконки созданы успешно!')