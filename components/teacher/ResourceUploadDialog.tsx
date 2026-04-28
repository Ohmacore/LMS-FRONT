'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Upload, FileText } from 'lucide-react'

interface ResourceUploadDialogProps {
    folderId: number
    categoryName: string
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

export default function ResourceUploadDialog({ folderId, categoryName, open, onOpenChange, onSuccess }: ResourceUploadDialogProps) {
    const [uploading, setUploading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        format: 'other' as 'pdf' | 'video' | 'other',
        file: null as File | null,
    })
    const [dragActive, setDragActive] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            // Auto-detect format based on file type
            let detectedFormat: 'pdf' | 'video' | 'other' = 'other'
            if (file.type === 'application/pdf') {
                detectedFormat = 'pdf'
            } else if (file.type.startsWith('video/')) {
                detectedFormat = 'video'
            }
            setFormData({
                ...formData,
                file,
                format: detectedFormat,
                name: formData.name || file.name.replace(/\.[^/.]+$/, '')
            })
        }
    }

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0]
            // Auto-detect format based on file type
            let detectedFormat: 'pdf' | 'video' | 'other' = 'other'
            if (file.type === 'application/pdf') {
                detectedFormat = 'pdf'
            } else if (file.type.startsWith('video/')) {
                detectedFormat = 'video'
            }
            setFormData({
                ...formData,
                file,
                format: detectedFormat,
                name: formData.name || file.name.replace(/\.[^/.]+$/, '')
            })
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.file) {
            toast.error('Veuillez sélectionner un fichier')
            return
        }

        setUploading(true)

        const token = localStorage.getItem('token')
        if (!token) return

        try {
            const data = new FormData()
            data.append('name', formData.name)
            console.log('Appending name:', formData.name)

            // Map category names to DB types: Cours->cours, TD->TD, TP->TP
            const typeMap: Record<string, string> = {
                'Cours': 'cours',
                'TD': 'TD',
                'TP': 'TP'
            }
            const type = typeMap[categoryName] || categoryName
            data.append('type', type)
            data.append('format', formData.format)
            console.log('Appending type:', type, 'format:', formData.format)

            if (formData.file) {
                console.log('Appending file:', formData.file.name, formData.file.size, formData.file.type)
                data.append('file', formData.file)
            } else {
                console.error('No file selected in state!')
            }

            await api.uploadResource(folderId, data, token)

            toast.success('Ressource uploadée !')

            setFormData({
                name: '',
                format: 'other',
                file: null
            })
            onOpenChange(false)
            onSuccess()
        } catch (error: any) {
            toast.error('Erreur d\'upload', {
                description: error.message
            })
        } finally {
            setUploading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Ajouter une ressource - {categoryName}</DialogTitle>
                        <DialogDescription>
                            Uploadez un fichier PDF, vidéo ou autre document
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-4">
                        {/* File Upload Area */}
                        <div
                            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive ? 'border-primary bg-primary/5' : 'border-gray-300'
                                }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <input
                                type="file"
                                id="file-upload"
                                className="hidden"
                                onChange={handleFileChange}
                                accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.avi,.mov"
                            />

                            {formData.file ? (
                                <div className="space-y-2">
                                    <FileText className="h-12 w-12 mx-auto text-primary" />
                                    <p className="font-medium">{formData.file.name}</p>
                                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                        <span>{(formData.file.size / 1024 / 1024).toFixed(2)} MB</span>
                                        <span>•</span>
                                        <Badge variant="secondary" className="text-xs">
                                            {formData.file.type.startsWith('video/') ? 'Vidéo détectée' :
                                                formData.file.type.includes('pdf') ? 'Document PDF' : 'Fichier'}
                                        </Badge>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setFormData({ ...formData, file: null })}
                                    >
                                        Changer de fichier
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">
                                        Glissez-déposez un fichier ici ou
                                    </p>
                                    <label htmlFor="file-upload">
                                        <Button type="button" variant="outline" size="sm" asChild>
                                            <span>Parcourir</span>
                                        </Button>
                                    </label>
                                    <p className="text-xs text-muted-foreground">
                                        Max 50MB - PDF, DOC, PPT, MP4, AVI, MOV
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Format Selector */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Type de ressource *</label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, format: 'pdf' })}
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-colors ${formData.format === 'pdf'
                                            ? 'bg-primary text-primary-foreground border-primary'
                                            : 'bg-background border-gray-300 hover:border-primary'
                                        }`}
                                >
                                    <FileText className="h-5 w-5" />
                                    <span>PDF</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, format: 'video' })}
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-colors ${formData.format === 'video'
                                            ? 'bg-primary text-primary-foreground border-primary'
                                            : 'bg-background border-gray-300 hover:border-primary'
                                        }`}
                                >
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>Vidéo</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, format: 'other' })}
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-colors ${formData.format === 'other'
                                            ? 'bg-primary text-primary-foreground border-primary'
                                            : 'bg-background border-gray-300 hover:border-primary'
                                        }`}
                                >
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span>Autre</span>
                                </button>
                            </div>
                        </div>

                        {/* Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nom de la ressource *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Ex: Chapitre 1 - Introduction"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Annuler
                        </Button>
                        <Button type="submit" disabled={uploading || !formData.file}>
                            {uploading ? 'Upload en cours...' : 'Uploader'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
