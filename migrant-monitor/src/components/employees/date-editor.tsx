'use client'

import { useState } from 'react'
import { Calendar, Save, X, Edit3, Sparkles, Zap } from 'lucide-react'
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
  const [isSaving, setIsSaving] = useState(false)

  const handleEdit = () => {
    setInputValue(formatDate(date))
    setIsEditing(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    const parsedDate = parseDate(inputValue)
    await new Promise(resolve => setTimeout(resolve, 300)) // Smooth animation
    onUpdate(parsedDate)
    setIsSaving(false)
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
      <div className="space-y-4 animate-scale-in">
        <label className="text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest flex items-center gap-2">
          <div className="relative">
            {icon}
            <div className="absolute inset-0 blur-sm opacity-50 animate-pulse">{icon}</div>
          </div>
          {label}
        </label>
        <div className="space-y-3">
          <div className="relative">
            <Input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="дд.мм.гггг"
              className="text-lg font-semibold rounded-2xl border-3 border-purple-200 dark:border-purple-800 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 pl-4 pr-12 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
              autoFocus
            />
            <Calendar className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-500 animate-pulse" />
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white border-0 rounded-2xl flex-1 font-bold shadow-xl shadow-emerald-500/30 transition-all duration-300 hover:scale-105 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Сохранение...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Сохранить
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleCancel}
              className="rounded-2xl border-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 hover:scale-105 px-4"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <label className="text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest flex items-center gap-2">
        <div className="relative">
          {icon}
          <div className="absolute inset-0 blur-sm opacity-30">{icon}</div>
        </div>
        {label}
      </label>
      <button
        onClick={handleEdit}
        className={cn(
          "group w-full text-left p-5 rounded-3xl border-3 text-lg font-semibold transition-all duration-300",
          "hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] hover-lift",
          "focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500",
          "relative overflow-hidden",
          className
        )}
      >
        {/* Shimmer effect */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        
        <div className="relative flex items-center justify-between">
          <span className="flex-1">
            {date ? formatDate(date) : (
              <span className="text-gray-400 dark:text-gray-500 italic flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-pulse" />
                Не указано
              </span>
            )}
          </span>
          <div className="flex items-center gap-3">
            <Edit3 className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all duration-300 animate-bounce" />
            <Calendar className="w-5 h-5 opacity-60 group-hover:opacity-100 transition-all duration-300" />
          </div>
        </div>
      </button>
    </div>
  )
}