'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Calendar, Edit } from 'lucide-react'
import { formatDate, parseDate } from '@/lib/utils'

interface DateEditorProps {
  label: string
  date: Date | null
  onUpdate: (date: Date | null) => void
}

export default function DateEditor({ label, date, onUpdate }: DateEditorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')

  const handleEdit = () => {
    setInputValue(date ? formatDate(date) : '')
    setIsOpen(true)
  }

  const handleSave = () => {
    const parsedDate = parseDate(inputValue)
    onUpdate(parsedDate)
    setIsOpen(false)
  }

  const handleCancel = () => {
    setIsOpen(false)
    setInputValue('')
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <div className="space-y-2">
        <Label className="text-sm font-medium">{label}</Label>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal"
            onClick={handleEdit}
          >
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            {date ? formatDate(date) : 'Не указано'}
            <Edit className="h-4 w-4 ml-auto text-muted-foreground" />
          </Button>
        </DialogTrigger>
      </div>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Редактировать дату: {label}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date-input">Дата</Label>
            <Input
              id="date-input"
              type="date"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full"
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