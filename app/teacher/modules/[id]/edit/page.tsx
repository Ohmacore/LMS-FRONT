'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
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

export default function EditModulePage() {
    const params = useParams()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        level: 'college' as 'primaire' | 'college' | 'lycee' | 'universite',
        year: '1',
    })

    useEffect(() => {
        const loadModule = async () => {
            const token = localStorage.getItem('token')
            if (!token) {
                router.push('/auth/login')
                return
            }

            try {
                const data = await api.getModuleDetails(Number(params.id), token)
                const module = data.module

                setFormData({
                    name: module.name || '',
                    description: module.description || '',
                    level: module.level || 'college',
                    year: module.year || '1',
                })
                setLoading(false)
            } catch (error) {
                toast.error('Erreur de chargement')
                router.push('/teacher/modules')
            }
        }

        loadModule()
    }, [params.id, router])

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

            await api.updateModule(Number(params.id), moduleData, token)

            toast.success('Module mis à jour !', {
                description: 'Les modifications ont été enregistrées.'
            })

            router.push(`/teacher/modules/${params.id}`)
        } catch (error: any) {
            toast.error('Erreur lors de la mise à jour', {
                description: error.message
            })
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <TeacherLayout>
                <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Chargement...</p>
                    </div>
                </div>
            </TeacherLayout>
        )
    }

    return (
        <TeacherLayout>
            <div className="container mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href={`/teacher/modules/${params.id}`}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <PageHeader
                        title="Modifier le Module"
                        description="Mettez à jour les informations de votre module"
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


                        {/* Actions */}
                        <div className="flex justify-end gap-3">
                            <Link href={`/teacher/modules/${params.id}`}>
                                <Button type="button" variant="outline">
                                    Annuler
                                </Button>
                            </Link>
                            <Button type="submit" disabled={submitting}>
                                {submitting ? 'Enregistrement...' : 'Enregistrer'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </TeacherLayout>
    )
}
