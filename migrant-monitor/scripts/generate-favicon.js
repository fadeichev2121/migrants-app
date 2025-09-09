const { createCanvas } = require('canvas')
const fs = require('fs')
const path = require('path')

function generateFavicon() {
  const canvas = createCanvas(32, 32)
  const ctx = canvas.getContext('2d')
  
  // Фон с градиентом
  const gradient = ctx.createLinearGradient(0, 0, 32, 32)
  gradient.addColorStop(0, '#3b82f6')
  gradient.addColorStop(1, '#6366f1')
  
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 32, 32)
  
  // Закругленные углы
  ctx.globalCompositeOperation = 'destination-in'
  ctx.beginPath()
  ctx.roundRect(0, 0, 32, 32, 6)
  ctx.fill()
  
  ctx.globalCompositeOperation = 'source-over'
  
  // Иконка пользователя (упрощенная)
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 2
  ctx.lineCap = 'round'
  
  // Голова
  ctx.beginPath()
  ctx.arc(16, 12, 5, 0, Math.PI * 2)
  ctx.stroke()
  
  // Тело
  ctx.beginPath()
  ctx.arc(16, 28, 10, Math.PI, 0, true)
  ctx.stroke()
  
  return canvas.toBuffer('image/png')
}

// Создаем favicon
const faviconBuffer = generateFavicon()

// Сохраняем как PNG (Next.js автоматически конвертирует в ICO)
fs.writeFileSync(path.join(__dirname, '../public/favicon.png'), faviconBuffer)
fs.writeFileSync(path.join(__dirname, '../src/app/favicon.ico'), faviconBuffer)

console.log('Favicon создан успешно!')