'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import TeacherLayout from '@/components/layout/TeacherLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const YEAR_LIMITS: Record<string, number> = {
    primaire: 5,
    college: 4,
    lycee: 3,
    universite: 8,
}

const YEAR_LABELS: Record<string, (n: number) => string> = {
    primaire: (n) => `${n}${n === 1 ? 'ère' : 'ème'} année primaire`,
    college: (n) => `${n}${n === 1 ? 'ère' : 'ème'} année collège`,
    lycee: (n) => `${n}${n === 1 ? 'ère' : 'ème'} année lycée`,
    universite: (n) => `${n}${n === 1 ? 'ère' : 'ème'} année`,
}

export default function CreateModulePage() {
    const router = useRouter()
    const [submitting, setSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        level: 'college' as 'primaire' | 'college' | 'lycee' | 'universite',
        year: '1',
    })

    const yearOptions = useMemo(() => {
        const max = YEAR_LIMITS[formData.level] || 4
        const labelFn = YEAR_LABELS[formData.level]
        return Array.from({ length: max }, (_, i) => ({
            value: String(i + 1),
            label: labelFn(i + 1),
        }))
    }, [formData.level])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target

        if (name === 'level') {
            // Reset year to 1 when level changes
            setFormData(prev => ({
                ...prev,
                level: value as any,
                year: '1',
            }))
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value,
            }))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        const token = localStorage.getItem('token')
        if (!token) {
            router.push('/auth/login')
            return
        }

        try {
            const moduleData = {
                name: formData.name,
                description: formData.description,
                level: formData.level,
                year: parseInt(formData.year),
            }

            const response = await api.createModule(moduleData, token)

            toast.success('Module créé avec succès !', {
                description: 'Vous pouvez maintenant ajouter des chapitres.'
            })

            router.push(`/teacher/modules/${response.module.id}`)
        } catch (error: any) {
            toast.error('Erreur lors de la création', {
                description: error.message
            })
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <TeacherLayout>
            <div className="container mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/teacher/modules">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <PageHeader
                        title="Créer un Module"
                        description="Ajoutez un nouveau module de cours"
                    />
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 max-w-4xl">
                        {/* Module Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Informations du Module</CardTitle>
                                <CardDescription>Détails généraux du module de cours</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Nom du module *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="Ex: Mathématiques - Algèbre"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={4}
                                        className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="Décrivez le contenu et les objectifs de ce module..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Niveau *</label>
                                        <select
                                            name="level"
                                            value={formData.level}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                        >
                                            <option value="primaire">Primaire</option>
                                            <option value="college">Collège</option>
                                            <option value="lycee">Lycée</option>
                                            <option value="universite">Université</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Année *</label>
                                        <select
                                            name="year"
                                            value={formData.year}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                        >
                                            {yearOptions.map(opt => (
                                                <option key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>


                        {/* Structure Info */}
                        <Card className="bg-accent/50">
                            <CardContent className="py-4">
                                <p className="text-sm text-muted-foreground">
                                    ℹ️ Après la création du module, vous pourrez ajouter des <strong>chapitres</strong> avec un <strong>prix par chapitre</strong>. Chaque chapitre contiendra automatiquement 3 sous-dossiers : <strong>Cours</strong>, <strong>TD</strong> et <strong>TP</strong>. Le prix total du module sera la somme des prix de tous les chapitres.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        <div className="flex justify-end gap-3">
                            <Link href="/teacher/modules">
                                <Button type="button" variant="outline">
                                    Annuler
                                </Button>
                            </Link>
                            <Button type="submit" disabled={submitting}>
                                {submitting ? 'Création...' : 'Créer le module'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </TeacherLayout>
    )
}
