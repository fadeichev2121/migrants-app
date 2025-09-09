'use client'

import { useState } from 'react'
import { Calendar, Save, X, Edit3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatDate, parseDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface DateEditorProps {
  label: string
  date: Date | null
  onUpdate: (date: Date | null) => void
  className?: string
  icon?: React.ReactNode
}

export default function DateEditor({ label, date, onUpdate, className, icon }: DateEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [inputValue, setInputValue] = useState('')

  const handleEdit = () => {
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
      <div className="space-y-3">
        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2">
          {icon}
          {label}
        </label>
        <div className="space-y-3">
          <Input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="дд.мм.гггг"
            className="text-sm rounded-xl border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            autoFocus
          />
          <div className="flex gap-2">
            <Button 
              size="sm" 
              onClick={handleSave}
              className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white border-0 rounded-lg flex-1"
            >
              <Save className="w-3 h-3 mr-1" />
              Сохранить
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleCancel}
              className="rounded-lg border-2 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2">
        {icon}
        {label}
      </label>
      <button
        onClick={handleEdit}
        className={cn(
          "group w-full text-left p-4 rounded-2xl border-2 text-sm transition-all duration-200",
          "hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
          "focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500",
          className
        )}
      >
        <div className="flex items-center justify-between">
          <span className="font-medium">
            {date ? formatDate(date) : 'Не указано'}
          </span>
          <div className="flex items-center gap-2">
            <Edit3 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Calendar className="w-4 h-4 opacity-60" />
          </div>
        </div>
      </button>
    </div>
  )
}