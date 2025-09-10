'use client'

import { useState } from 'react'
import { MessageSquare, Save, X, Edit3, Sparkles, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface CommentEditorProps {
  comment: string
  onUpdate: (comment: string) => void
}

export default function CommentEditor({ comment, onUpdate }: CommentEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleEdit = () => {
    setInputValue(comment)
    setIsEditing(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 300)) // Smooth animation
    onUpdate(inputValue.trim())
    setIsSaving(false)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setInputValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
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
            <MessageSquare className="w-4 h-4 text-purple-500" />
            <div className="absolute inset-0 blur-sm opacity-50 animate-pulse">
              <MessageSquare className="w-4 h-4 text-purple-500" />
            </div>
          </div>
          Комментарий
        </label>
        <div className="space-y-4">
          <div className="relative">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Введите комментарий..."
              className="text-lg font-medium resize-none rounded-3xl border-3 border-purple-200 dark:border-purple-800 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 min-h-[120px] p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
              rows={4}
              autoFocus
            />
            <div className="absolute bottom-4 right-4 opacity-50">
              <MessageSquare className="w-5 h-5 text-purple-500 animate-pulse" />
            </div>
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
          <div className="glass dark:glass-dark rounded-2xl p-3 border border-white/30 dark:border-gray-700/50">
            <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold flex items-center gap-2">
              <Zap className="w-3 h-3 text-purple-500 animate-pulse" />
              <span>Ctrl+Enter для быстрого сохранения • Esc для отмены</span>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <label className="text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest flex items-center gap-2">
        <div className="relative">
          <MessageSquare className="w-4 h-4 text-purple-500" />
          <div className="absolute inset-0 blur-sm opacity-30">
            <MessageSquare className="w-4 h-4 text-purple-500" />
          </div>
        </div>
        Комментарий
      </label>
      <button
        onClick={handleEdit}
        className={cn(
          "group w-full text-left p-5 rounded-3xl border-3 text-lg font-medium transition-all duration-300 min-h-[100px] relative overflow-hidden",
          "hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] hover-lift",
          "focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500",
          "bg-gradient-to-br from-gray-50 to-gray-100 text-gray-700 border-gray-200",
          "dark:from-gray-800/50 dark:to-gray-700/50 dark:text-gray-300 dark:border-gray-600/50",
          "hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-950/20 dark:hover:to-pink-950/20"
        )}
      >
        {/* Shimmer effect */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        
        <div className="relative flex items-start justify-between">
          <div className="flex-1 leading-relaxed">
            {comment || (
              <span className="text-gray-400 dark:text-gray-500 italic flex items-center gap-3">
                <Sparkles className="w-5 h-5 animate-pulse" />
                <span>Нажмите для добавления комментария...</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 ml-4 flex-shrink-0">
            <Edit3 className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all duration-300 animate-bounce" />
            <MessageSquare className="w-5 h-5 opacity-60 group-hover:opacity-100 group-hover:text-purple-500 transition-all duration-300" />
          </div>
        </div>
      </button>
    </div>
  )
}