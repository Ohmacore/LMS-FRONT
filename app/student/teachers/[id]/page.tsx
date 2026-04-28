'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { api } from '@/lib/api'
import StudentLayout from '@/components/layout/StudentLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ArrowLeft, Star, Users, BookOpen, GraduationCap } from 'lucide-react'

export default function TeacherProfilePage() {
    const router = useRouter()
    const params = useParams()
    const teacherId = params.id as string

    const [loading, setLoading] = useState(true)
    const [teacher, setTeacher] = useState<any>(null)
    const [modules, setModules] = useState<any[]>([])

    useEffect(() => {
        const loadProfile = async () => {
            const token = localStorage.getItem('token')
            if (!token) {
                router.push('/auth/login')
                return
            }

            try {
                const data = await api.getTeacherProfile(parseInt(teacherId), token)
                setTeacher(data.teacher)
                setModules(data.modules)
                setLoading(false)
            } catch (error) {
                console.error('Failed to load teacher profile:', error)
                setLoading(false)
            }
        }

        if (teacherId) {
            loadProfile()
        }
    }, [router, teacherId])

    if (loading) {
        return (
            <StudentLayout>
                <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Chargement...</p>
                    </div>
                </div>
            </StudentLayout>
        )
    }

    if (!teacher) {
        return (
            <StudentLayout>
                <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                        <h3 className="text-xl font-semibold mb-2">Enseignant introuvable</h3>
                        <Link href="/student/teachers">
                            <Button variant="outline">Retour aux enseignants</Button>
                        </Link>
                    </div>
                </div>
            </StudentLayout>
        )
    }

    return (
        <StudentLayout>
            <div className="container mx-auto p-6 space-y-6">
                {/* Back Button */}
                <Link href="/student/teachers">
                    <Button variant="ghost" className="gap-2 -ml-2">
                        <ArrowLeft className="h-4 w-4" />
                        Retour aux enseignants
                    </Button>
                </Link>

                {/* Teacher Header Card */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-6">
                            {/* Avatar */}
                            <div className="flex-shrink-0">
                                <div className="h-32 w-32 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white text-4xl font-bold mx-auto md:mx-0">
                                    {teacher.pseudo?.[0] || teacher.name[0]}
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1 text-center md:text-left">
                                <h1 className="text-3xl font-bold mb-2">
                                    {teacher.pseudo || teacher.name}
                                </h1>
                                <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                                    <Badge variant="secondary" className="gap-1">
                                        <GraduationCap className="h-3 w-3" />
                                        {teacher.domain}
                                    </Badge>
                                    {teacher.year && (
                                        <Badge variant="outline">{teacher.year}</Badge>
                                    )}
                                </div>

                                {teacher.bio && (
                                    <p className="text-muted-foreground mb-4 max-w-2xl">
                                        {teacher.bio}
                                    </p>
                                )}

                                {/* Stats */}
                                <div className="flex flex-wrap gap-6 justify-center md:justify-start">
                                    <div className="flex items-center gap-2">
                                        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                                        <div>
                                            <div className="font-semibold">{teacher.rating || 0}/5</div>
                                            <div className="text-xs text-muted-foreground">Note</div>
                                        </div>
                                    </div>
                                    <div className="h-12 w-px bg-border" />
                                    <div className="flex items-center gap-2">
                                        <Users className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <div className="font-semibold">{teacher.total_students || 0}</div>
                                            <div className="text-xs text-muted-foreground">Étudiants</div>
                                        </div>
                                    </div>
                                    <div className="h-12 w-px bg-border" />
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="h-5 w-5 text-green-600" />
                                        <div>
                                            <div className="font-semibold">{modules.length}</div>
                                            <div className="text-xs text-muted-foreground">Modules</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Modules Section */}
                <div>
                    <h2 className="text-2xl font-bold mb-4">Modules Disponibles</h2>

                    {modules.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                                <p className="text-muted-foreground">Aucun module disponible pour le moment</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2">
                            {modules.map((module) => (
                                <Link
                                    key={module.id}
                                    href={`/student/modules/${module.id}`}
                                >
                                    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                                        <CardHeader>
                                            <div className="flex items-start justify-between mb-2">
                                                <CardTitle className="text-xl flex-1">{module.name}</CardTitle>
                                                <Badge>{module.level}</Badge>
                                            </div>
                                            <CardDescription>
                                                {module.year && `Année ${module.year}`}
                                                {module.subject && module.year && ' • '}
                                                {module.subject}
                                            </CardDescription>
                                        </CardHeader>

                                        <CardContent className="space-y-4">
                                            {module.description && (
                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                    {module.description}
                                                </p>
                                            )}

                                            {/* Module stats */}
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <BookOpen className="h-4 w-4" />
                                                    {module.chapters_count || 0} chapitre(s)
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Users className="h-4 w-4" />
                                                    {module.resources_count || 0} ressource(s)
                                                </span>
                                            </div>

                                            {/* Pricing */}
                                            <div className="flex items-center justify-between pt-4 border-t">
                                                <span className="text-sm text-muted-foreground">Prix total</span>
                                                <span className="text-xl font-bold text-primary">
                                                    {module.total_price || 0} DZD
                                                </span>
                                            </div>

                                            <Button variant="outline" className="w-full">
                                                Voir les détails
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </StudentLayout>
    )
}
