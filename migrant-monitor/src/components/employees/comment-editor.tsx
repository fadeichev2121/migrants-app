'use client'

import { useState } from 'react'
import { MessageSquare } from 'lucide-react'
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
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-700">Комментарий</label>
        <div className="space-y-2">
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Введите комментарий..."
            className="text-sm resize-none"
            rows={3}
            autoFocus
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave}>
              Сохранить
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancel}>
              Отмена
            </Button>
          </div>
          <div className="text-xs text-gray-500">
            Ctrl+Enter для сохранения, Esc для отмены
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Комментарий</label>
      <button
        onClick={handleEdit}
        className={cn(
          "w-full text-left p-2 rounded-md border text-sm transition-colors min-h-[60px]",
          "hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500",
          "dark:hover:bg-gray-700",
          "bg-gray-50 text-gray-700 border-gray-200",
          "dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
        )}
      >
        <div className="flex items-start justify-between">
          <span className="flex-1">
            {comment || (
              <span className="text-gray-400 dark:text-gray-500 italic">
                Нажмите для добавления комментария...
              </span>
            )}
          </span>
          <MessageSquare className="w-3 h-3 text-gray-400 ml-2 flex-shrink-0 mt-0.5" />
        </div>
      </button>
    </div>
  )
}