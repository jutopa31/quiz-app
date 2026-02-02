import { useRef, useState, type DragEvent } from 'react'
import { Button } from '../ui/Button'

interface ImageUploaderProps {
  value?: string | null
  onUpload: (file: File) => Promise<void>
  onRemove?: () => void
  loading?: boolean
}

export function ImageUploader({ value, onUpload, onRemove, loading }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFiles = async (files: FileList | null) => {
    const file = files?.[0]
    if (!file) return
    await onUpload(file)
  }

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    await handleFiles(event.dataTransfer.files)
  }

  return (
    <div className="space-y-3">
      <div
        className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
          isDragging ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-gray-50'
        }`}
        onDragOver={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {value ? (
          <img src={value} alt="" className="w-full max-h-48 object-contain rounded-md" />
        ) : (
          <p className="text-sm text-gray-500">
            Arrastra una imagen aqui o selecciona un archivo
          </p>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => handleFiles(event.target.files)}
        />
        <div className="mt-3 flex justify-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={loading}
            onClick={() => inputRef.current?.click()}
          >
            {value ? 'Cambiar imagen' : 'Subir imagen'}
          </Button>
          {value && onRemove ? (
            <Button type="button" variant="ghost" size="sm" disabled={loading} onClick={onRemove}>
              Quitar
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
