'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import StudentLayout from '@/components/layout/StudentLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { BookOpen, ArrowRight, TrendingUp } from 'lucide-react'

export default function MyModulesPage() {
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
                const data = await api.getMyModules(token)
                setModules(data.modules)
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
            <StudentLayout>
                <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Chargement...</p>
                    </div>
                </div>
            </StudentLayout>
        )
    }

    return (
        <StudentLayout>
            <div className="container mx-auto p-6 space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold ">Mes Modules</h1>
                    <p className="text-muted-foreground mt-1">Modules auxquels vous êtes inscrit</p>
                </div>

                {/* Modules Grid or Empty State */}
                {modules.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
                            <h3 className="text-xl font-semibold mb-2">
                                Aucun module inscrit
                            </h3>
                            <p className="text-muted-foreground text-center mb-6 max-w-md">
                                Commencez votre apprentissage en découvrant les modules proposés par nos enseignants
                            </p>
                            <Link href="/student/teachers">
                                <Button className="gap-2">
                                    Découvrir les enseignants
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                        {modules.map((enrollment) => (
                            <Link
                                key={enrollment.enrollment_id}
                                href={`/student/modules/${enrollment.module.id}`}
                            >
                                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <CardTitle className="text-xl mb-1">
                                                    {enrollment.module.name}
                                                </CardTitle>
                                                <CardDescription>
                                                    Par {enrollment.teacher.pseudo || enrollment.teacher.name}
                                                </CardDescription>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {enrollment.module.subject} • {enrollment.module.year}
                                                </p>
                                            </div>
                                            <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                                                Actif
                                            </span>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-4">
                                        {/* Subscription Info */}
                                        <div className="rounded-lg bg-gray-50 p-3 space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Type</span>
                                                <span className="font-medium ">
                                                    {enrollment.subscription_type === 'full' ? 'Pack Complet' :
                                                        enrollment.subscription_type === 'chapter' ? 'Par Chapitre' :
                                                            'Par Type'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Inscrit le</span>
                                                <span className="font-medium ">
                                                    {new Date(enrollment.enrolled_at).toLocaleDateString('fr-FR')}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Progress */}
                                        <div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-muted-foreground">Progression</span>
                                                <span className="font-medium ">0%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                                            </div>
                                        </div>

                                        <Button variant="outline" className="w-full gap-2">
                                            <TrendingUp className="h-4 w-4" />
                                            Continuer l'apprentissage
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </StudentLayout>
    )
}
