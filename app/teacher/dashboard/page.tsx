'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import TeacherLayout from '@/components/layout/TeacherLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { BookOpen, Users, Wallet, TrendingUp, Plus } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'

export default function TeacherDashboard() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        totalModules: 0,
        totalStudents: 0,
        totalEarnings: 0,
        pendingEarnings: 0
    })
    const [modules, setModules] = useState<any[]>([])

    useEffect(() => {
        const loadDashboard = async () => {
            const token = localStorage.getItem('token')

            if (!token) {
                router.push('/auth/login')
                return
            }

            try {
                // Fetch stats and modules concurrently for better performance
                const [modulesData, statsData] = await Promise.all([
                    api.getTeacherModules(token),
                    api.getTeacherDashboardStats(token)
                ]);

                setModules(modulesData.modules || [])

                // Calculate stats based on actual data
                setStats({
                    totalModules: statsData.total_modules || 0,
                    totalStudents: statsData.total_students || 0,
                    totalEarnings: statsData.total_earnings || 0,
                    pendingEarnings: statsData.pending_earnings || 0
                })

                setLoading(false)
            } catch (error) {
                console.error('Failed to load dashboard:', error)
                setLoading(false)
            }
        }

        loadDashboard()
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
                    title="Tableau de bord"
                    description="Vue d'ensemble de votre activité d'enseignement"
                    action={
                        <Link href="/teacher/modules/create">
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" />
                                Créer un module
                            </Button>
                        </Link>
                    }
                />

                {/* Stats Cards */}
                <div className="grid gap-3 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Mes Modules
                            </CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalModules}</div>
                            <Link href="/teacher/modules">
                                <Button variant="link" className="h-auto p-0 text-xs text-blue-600">
                                    Gérer les modules →
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Étudiants Inscrits
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalStudents}</div>
                            <Link href="/teacher/students">
                                <Button variant="link" className="h-auto p-0 text-xs text-blue-600">
                                    Voir les étudiants →
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Revenus Totaux
                            </CardTitle>
                            <Wallet className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalEarnings.toFixed(2)} DZD</div>
                            <p className="text-xs text-muted-foreground">
                                Ce mois
                            </p>
                        </CardContent>
                    </Card>


                </div>

                {/* Modules Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Mes Modules</h2>
                        <Link href="/teacher/modules">
                            <Button variant="ghost" size="sm">
                                Voir tout
                            </Button>
                        </Link>
                    </div>

                    {modules.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">
                                    Aucun module créé
                                </h3>
                                <p className="text-muted-foreground text-center mb-4">
                                    Commencez par créer votre premier module de cours
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
                            {modules.slice(0, 6).map((module: any) => (
                                <Link
                                    key={module.id}
                                    href={`/teacher/modules/${module.id}`}
                                >
                                    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                                        <CardHeader>
                                            <div className="flex items-start justify-between mb-2">
                                                <CardTitle className="text-base flex-1">{module.name}</CardTitle>
                                                <Badge variant="outline">{module.level}</Badge>
                                            </div>
                                            <CardDescription>
                                                {module.subject} • {module.year}
                                            </CardDescription>
                                        </CardHeader>

                                        <CardContent>
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Users className="h-4 w-4" />
                                                    <span>{module.enrollments_count || 0} étudiants</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <BookOpen className="h-4 w-4" />
                                                    <span>{module.folders_count || 0} chapitres</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </TeacherLayout>
    )
}
