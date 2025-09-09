'use client'

import { useState } from 'react'
import { MessageSquare, Save, X, Edit3 } from 'lucide-react'
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

  const handleEdit = () => {
    setInputValue(comment)
    setIsEditing(true)
  }

  const handleSave = () => {
    onUpdate(inputValue.trim())
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
      <div className="space-y-3">
        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2">
          <MessageSquare className="w-3 h-3" />
          Комментарий
        </label>
        <div className="space-y-3">
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Введите комментарий..."
            className="text-sm resize-none rounded-2xl border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all min-h-[100px]"
            rows={4}
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
          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <span>💡</span>
            <span>Ctrl+Enter для сохранения, Esc для отмены</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2">
        <MessageSquare className="w-3 h-3" />
        Комментарий
      </label>
      <button
        onClick={handleEdit}
        className={cn(
          "group w-full text-left p-4 rounded-2xl border-2 text-sm transition-all duration-200 min-h-[80px]",
          "hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
          "focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500",
          "bg-gradient-to-br from-gray-50 to-gray-100 text-gray-700 border-gray-200",
          "dark:from-gray-800/50 dark:to-gray-700/50 dark:text-gray-300 dark:border-gray-600/50",
          "hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-700/50 dark:hover:to-gray-600/50"
        )}
      >
        <div className="flex items-start justify-between">
          <span className="flex-1 leading-relaxed">
            {comment || (
              <span className="text-gray-400 dark:text-gray-500 italic">
                Нажмите для добавления комментария...
              </span>
            )}
          </span>
          <div className="flex items-center gap-2 ml-3">
            <Edit3 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            <MessageSquare className="w-4 h-4 opacity-60" />
          </div>
        </div>
      </button>
    </div>
  )
}