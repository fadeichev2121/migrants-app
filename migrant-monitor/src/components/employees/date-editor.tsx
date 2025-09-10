'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Calendar } from 'lucide-react'

interface DateEditorProps {
  field: string
  date: Date | null
  onUpdate: (date: Date | null) => void
}

export default function DateEditor({ field, date, onUpdate }: DateEditorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')

  const handleEdit = () => {
    setInputValue(date ? date.toISOString().split('T')[0] : '')
    setIsOpen(true)
  }

  const handleSave = () => {
    const newDate = inputValue ? new Date(inputValue) : null
    onUpdate(newDate)
    setIsOpen(false)
  }

  const handleCancel = () => {
    setIsOpen(false)
    setInputValue('')
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleEdit}
          className="h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Calendar className="h-4 w-4 text-gray-400" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Редактировать дату</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date-input">Дата {field}</Label>
            <Input
              id="date-input"
              type="date"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
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