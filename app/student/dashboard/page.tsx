'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import StudentLayout from '@/components/layout/StudentLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { TrendingUp, BookOpen, Wallet, Users, ArrowRight } from 'lucide-react'

export default function StudentDashboard() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [balance, setBalance] = useState(0)
    const [myModules, setMyModules] = useState<any[]>([])
    const [teachers, setTeachers] = useState<any[]>([])

    useEffect(() => {
        const loadDashboard = async () => {
            const token = localStorage.getItem('token')

            if (!token) {
                router.push('/auth/login')
                return
            }

            try {
                // Load wallet balance
                const walletData = await api.getWalletBalance(token)
                setBalance(parseFloat(walletData.balance) || 0)

                // Load enrolled modules
                const modulesData = await api.getMyModules(token)
                setMyModules(modulesData.modules)

                // Load teachers for discovery
                const teachersData = await api.getTeachers(token)
                setTeachers(teachersData.teachers.slice(0, 4))

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
                    <h1 className="text-3xl font-bold ">Tableau de bord</h1>
                    <p className="text-muted-foreground mt-1">Bienvenue sur votre espace d'apprentissage</p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Solde Portefeuille
                            </CardTitle>
                            <Wallet className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{balance.toFixed(2)} DZD</div>
                            <Link href="/student/wallet">
                                <Button variant="link" className="h-auto p-0 text-xs text-blue-600">
                                    Recharger →
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Modules Inscrits
                            </CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{myModules.length}</div>
                            <Link href="/student/my-modules">
                                <Button variant="link" className="h-auto p-0 text-xs text-blue-600">
                                    Voir les modules →
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Enseignants Disponibles
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{teachers.length}+</div>
                            <Link href="/student/teachers">
                                <Button variant="link" className="h-auto p-0 text-xs text-blue-600">
                                    Découvrir →
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>

                {/* My Modules Section */}
                {myModules.length > 0 ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold ">Mes Modules</h2>
                            <Link href="/student/my-modules">
                                <Button variant="ghost" size="sm">
                                    Voir tout
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            {myModules.slice(0, 4).map((enrollment: any) => (
                                <Link
                                    key={enrollment.enrollment_id}
                                    href={`/student/modules/${enrollment.module.id}`}
                                >
                                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <CardTitle className="text-base">{enrollment.module.name}</CardTitle>
                                                    <CardDescription className="mt-1">
                                                        Par {enrollment.teacher.pseudo || enrollment.teacher.name}
                                                    </CardDescription>
                                                </div>
                                                <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                                                    Actif
                                                </span>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center text-sm text-muted-foreground">
                                                <TrendingUp className="mr-2 h-4 w-4" />
                                                Progression: 0%
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </div>
                ) : (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold  mb-2">
                                Aucun module inscrit
                            </h3>
                            <p className="text-muted-foreground text-center mb-4">
                                Commencez votre apprentissage en découvrant nos enseignants
                            </p>
                            <Link href="/student/teachers">
                                <Button>
                                    Découvrir les enseignants
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}

                {/* Teachers Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold ">Enseignants Recommandés</h2>
                        <Link href="/student/teachers">
                            <Button variant="ghost" size="sm">
                                Voir tout
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {teachers.map((teacher: any) => (
                            <Link
                                key={teacher.id}
                                href={`/student/teachers/${teacher.id}`}
                            >
                                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                    <CardContent className="pt-6">
                                        <div className="flex flex-col items-center text-center">
                                            <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-semibold mb-3">
                                                {teacher.pseudo?.[0] || teacher.name[0]}
                                            </div>
                                            <h3 className="font-semibold ">
                                                {teacher.pseudo || teacher.name}
                                            </h3>
                                            <p className="text-sm text-muted-foreground mt-1">{teacher.domain}</p>
                                            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                                                <span>⭐ {teacher.rating || 0}/5</span>
                                                <span>{teacher.modules_count} modules</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </StudentLayout>
    )
}
