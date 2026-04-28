'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import TeacherLayout from '@/components/layout/TeacherLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { BookOpen, Users, Plus, Edit, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'

export default function ModulesPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [modules, setModules] = useState<any[]>([])

    useEffect(() => {
        const loadModules = async () => {
            const token = localStorage.getItem('token')
            if (!token) {
                router.push('/auth/login')
                return
            }

            try {
                const data = await api.getTeacherModules(token)
                setModules(data.modules || [])
                setLoading(false)
            } catch (error) {
                console.error('Failed to load modules:', error)
                setLoading(false)
            }
        }

        loadModules()
    }, [router])

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
                <PageHeader
                    title="Mes Modules"
                    description="Gérez vos modules et leur contenu"
                    action={
                        <Link href="/teacher/modules/create">
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" />
                                Créer un module
                            </Button>
                        </Link>
                    }
                />

                {modules.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
                            <h3 className="text-xl font-semibold mb-2">
                                Aucun module créé
                            </h3>
                            <p className="text-muted-foreground text-center mb-6 max-w-md">
                                Créez votre premier module de cours et commencez à partager vos connaissances avec vos étudiants
                            </p>
                            <Link href="/teacher/modules/create">
                                <Button className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Créer mon premier module
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {modules.map((module: any) => (
                            <Card key={module.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between mb-2">
                                        <CardTitle className="text-lg flex-1">{module.name}</CardTitle>
                                        <Badge variant="outline">{module.level}</Badge>
                                    </div>
                                    <CardDescription>
                                        {module.year}{module.year === '1' ? 'ère' : 'ème'} année
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    {module.description && (
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {module.description}
                                        </p>
                                    )}

                                    {/* Stats */}
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Users className="h-4 w-4" />
                                            <span>{module.enrollments_count || 0} étudiants</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <BookOpen className="h-4 w-4" />
                                            <span>{module.chapters_count || 0} chapitres</span>
                                        </div>
                                    </div>

                                    {/* Pricing */}
                                    <div className="flex items-center justify-between pt-4 border-t text-sm">
                                        <span className="text-muted-foreground">Prix total</span>
                                        <span className="font-semibold text-primary">
                                            {parseFloat(module.total_price || 0).toFixed(0)} DZD
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 pt-2">
                                        <Link href={`/teacher/modules/${module.id}`} className="flex-1">
                                            <Button variant="outline" className="w-full gap-2">
                                                <Edit className="h-4 w-4" />
                                                Gérer
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </TeacherLayout>
    )
}
