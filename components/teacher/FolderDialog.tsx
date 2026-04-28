'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

interface FolderDialogProps {
    moduleId: number
    folder?: any
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

export default function FolderDialog({ moduleId, folder, open, onOpenChange, onSuccess }: FolderDialogProps) {
    const [submitting, setSubmitting] = useState(false)
    const [name, setName] = useState(folder?.name || '')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        const token = localStorage.getItem('token')
        if (!token) return

        try {
            if (folder) {
                // Update existing folder
                await api.updateFolder(folder.id, { name }, token)
                toast.success('Chapitre mis à jour !')
            } else {
                // Create new folder
                await api.createFolder(moduleId, { name }, token)
                toast.success('Chapitre créé !')
            }

            setName('')
            onOpenChange(false)
            onSuccess()
        } catch (error: any) {
            toast.error('Erreur', {
                description: error.message
            })
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>
                            {folder ? 'Modifier le chapitre' : 'Nouveau chapitre'}
                        </DialogTitle>
                        <DialogDescription>
                            {folder ? 'Modifiez le nom du chapitre' : 'Ajoutez un nouveau chapitre à votre module'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nom du chapitre *</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
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
                        <Button type="submit" disabled={submitting}>
                            {submitting ? 'En cours...' : (folder ? 'Modifier' : 'Créer')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
