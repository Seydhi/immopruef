import { useRef, useState } from 'react'
import type { DragEvent } from 'react'
import { UPLOAD_MAX_BYTES, UPLOAD_MAX_IMAGES, UPLOAD_TYPES } from '../lib/api'

interface ExposeUploadInputProps {
  files: File[]
  onChange: (files: File[]) => void
  error: string
}

// Regeln (identisch zum Backend): 1 Exposé-PDF ODER bis zu 8 Fotos, max. 20 MB pro Datei.
function validateSelection(next: File[]): string {
  if (next.some((f) => !UPLOAD_TYPES[f.type])) {
    return 'Nur PDF, JPG, PNG oder WebP möglich.'
  }
  if (next.some((f) => f.size > UPLOAD_MAX_BYTES)) {
    return 'Einzelne Datei zu groß — maximal 20 MB pro Datei.'
  }
  const pdfs = next.filter((f) => f.type === 'application/pdf').length
  if (pdfs > 1) return 'Bitte nur ein Exposé-PDF hochladen.'
  if (pdfs === 1 && next.length > 1) return 'Entweder 1 Exposé-PDF oder Fotos — nicht beides.'
  if (next.length > UPLOAD_MAX_IMAGES) return `Maximal ${UPLOAD_MAX_IMAGES} Fotos möglich.`
  return ''
}

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} MB`
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

export default function ExposeUploadInput({ files, onChange, error }: ExposeUploadInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [localError, setLocalError] = useState('')
  const [dragOver, setDragOver] = useState(false)

  const addFiles = (incoming: FileList | File[]) => {
    const next = [...files, ...Array.from(incoming)]
    const err = validateSelection(next)
    setLocalError(err)
    if (!err) onChange(next)
  }

  const removeFile = (index: number) => {
    setLocalError('')
    onChange(files.filter((_, i) => i !== index))
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files)
  }

  const shownError = error || localError

  return (
    <div>
      <label className="block text-[11px] font-medium tracking-widest uppercase text-ink-light mb-1.5">
        Exposé hochladen
      </label>

      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inputRef.current?.click() } }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`w-full border-2 border-dashed rounded-lg px-4 py-6 text-center cursor-pointer transition-colors ${
          dragOver ? 'border-green bg-green/5' : shownError ? 'border-red-300 bg-red-50/40' : 'border-ink/20 bg-cream hover:border-green/60 hover:bg-white'
        }`}
      >
        <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2 text-green">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        <p className="text-sm text-ink-mid font-medium">
          Exposé-PDF oder Fotos hierher ziehen — oder klicken
        </p>
        <p className="text-[11px] text-ink-light mt-1">
          1 PDF <span className="text-ink-light/60">oder</span> bis zu {UPLOAD_MAX_IMAGES} Fotos · PDF, JPG, PNG, WebP · max. 20 MB pro Datei
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf,image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) addFiles(e.target.files)
            e.target.value = ''
          }}
        />
      </div>

      {files.length > 0 && (
        <ul className="mt-2.5 space-y-1.5">
          {files.map((f, i) => (
            <li key={`${f.name}-${i}`} className="flex items-center gap-2 bg-white border border-ink/15 rounded-lg px-3 py-2">
              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green shrink-0">
                {f.type === 'application/pdf'
                  ? <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></>
                  : <><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></>}
              </svg>
              <span className="text-[12px] text-ink truncate flex-1" title={f.name}>{f.name}</span>
              <span className="text-[11px] text-ink-light shrink-0">{formatSize(f.size)}</span>
              <button
                type="button"
                onClick={() => removeFile(i)}
                aria-label={`${f.name} entfernen`}
                className="text-ink-light hover:text-red-600 transition-colors shrink-0 p-0.5"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </li>
          ))}
        </ul>
      )}

      {shownError && <p className="text-red-600 text-xs mt-1.5">{shownError}</p>}

      <p className="text-xs text-ink-mid leading-relaxed mt-2.5">
        Ideal, wenn das Objekt nicht öffentlich inseriert ist — z.&nbsp;B. ein Makler-Exposé per E-Mail.
        Wir werten alle Seiten und Fotos aus und gleichen die Angaben mit aktuellen Marktdaten ab.
        <span className="text-green font-medium"> Gleicher Preis wie mit Link.</span>
      </p>
    </div>
  )
}
