'use client'

import { useState } from 'react'
import { Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatDate, parseDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface DateEditorProps {
  label: string
  date: Date | null
  onUpdate: (date: Date | null) => void
  className?: string
  disabled?: boolean
}

export default function DateEditor({ label, date, onUpdate, className, disabled }: DateEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [inputValue, setInputValue] = useState('')

  const handleEdit = () => {
    if (disabled) return
    setInputValue(formatDate(date))
    setIsEditing(true)
  }

  const handleSave = () => {
    const parsedDate = parseDate(inputValue)
    onUpdate(parsedDate)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setInputValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  if (isEditing) {
    return (
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-700">{label}</label>
        <div className="flex gap-2">
          <Input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="дд.мм.гггг"
            className="text-sm"
            autoFocus
          />
          <Button size="sm" onClick={handleSave} className="px-2">
            ✓
          </Button>
          <Button size="sm" variant="outline" onClick={handleCancel} className="px-2">
            ✕
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-gray-700">{label}</label>
      <button
        onClick={handleEdit}
        disabled={disabled}
        className={cn(
          "w-full text-left p-2 rounded-md border text-sm transition-colors",
          "hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500",
          disabled && "cursor-not-allowed opacity-60",
          className
        )}
      >
        <div className="flex items-center justify-between">
          <span>
            {date ? formatDate(date) : 'Не указано'}
          </span>
          {!disabled && (
            <Calendar className="w-3 h-3 text-gray-400" />
          )}
        </div>
      </button>
    </div>
  )
}