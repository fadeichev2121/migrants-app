'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { MessageSquare, Edit } from 'lucide-react'

interface CommentEditorProps {
  comment: string
  onUpdate: (comment: string) => void
}

export default function CommentEditor({ comment, onUpdate }: CommentEditorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')

  const handleEdit = () => {
    setInputValue(comment)
    setIsOpen(true)
  }

  const handleSave = () => {
    onUpdate(inputValue.trim())
    setIsOpen(false)
  }

  const handleCancel = () => {
    setIsOpen(false)
    setInputValue('')
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <div className="space-y-2">
        <Label className="text-sm font-medium">Комментарий</Label>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal h-auto min-h-[60px] whitespace-normal"
            onClick={handleEdit}
          >
            <div className="flex items-start w-full">
              <MessageSquare className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground flex-shrink-0" />
              <span className="flex-1 text-left">
                {comment || 'Добавить комментарий...'}
              </span>
              <Edit className="h-4 w-4 ml-2 text-muted-foreground flex-shrink-0" />
            </div>
          </Button>
        </DialogTrigger>
      </div>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Редактировать комментарий</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="comment-input">Комментарий</Label>
            <Textarea
              id="comment-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Введите комментарий..."
              className="min-h-[100px]"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex-1">
              Сохранить
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              Отмена
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}