'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import StudentLayout from '@/components/layout/StudentLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Search, Star, Users } from 'lucide-react'

export default function TeachersPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [teachers, setTeachers] = useState<any[]>([])
    const [search, setSearch] = useState('')

    useEffect(() => {
        const loadTeachers = async () => {
            const token = localStorage.getItem('token')
            if (!token) {
                router.push('/auth/login')
                return
            }

            try {
                const data = await api.getTeachers(token)
                setTeachers(data.teachers)
                setLoading(false)
            } catch (error) {
                console.error('Failed to load teachers:', error)
                setLoading(false)
            }
        }

        loadTeachers()
    }, [router])

    const filteredTeachers = teachers.filter(teacher =>
        teacher.name.toLowerCase().includes(search.toLowerCase()) ||
        teacher.domain.toLowerCase().includes(search.toLowerCase()) ||
        (teacher.pseudo && teacher.pseudo.toLowerCase().includes(search.toLowerCase()))
    )

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
                    <h1 className="text-3xl font-bold ">Enseignants</h1>
                    <p className="text-muted-foreground mt-1">Découvrez nos enseignants et leurs modules</p>
                </div>

                {/* Search */}
                <div className="relative max-w-xl">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Rechercher un enseignant, domaine..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                </div>

                {/* Teachers Grid */}
                {filteredTeachers.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Search className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">
                                Aucun enseignant trouvé
                            </h3>
                            <p className="text-muted-foreground">Essayez une autre recherche</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredTeachers.map((teacher) => (
                            <Link key={teacher.id} href={`/student/teachers/${teacher.id}`}>
                                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                                    <CardHeader>
                                        <div className="flex flex-col items-center space-y-3">
                                            {/* Avatar */}
                                            <div className="h-20 w-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                                                {teacher.pseudo?.[0] || teacher.name[0]}
                                            </div>

                                            {/* Name */}
                                            <div className="text-center">
                                                <CardTitle className="text-lg">
                                                    {teacher.pseudo || teacher.name}
                                                </CardTitle>
                                                <CardDescription className="mt-1">
                                                    {teacher.domain}
                                                </CardDescription>
                                                {teacher.year && (
                                                    <Badge variant="secondary" className="mt-2">
                                                        {teacher.year}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent>
                                        {/* Stats */}
                                        <div className="flex items-center justify-around pt-4 border-t">
                                            <div className="text-center">
                                                <div className="flex items-center gap-1 text-yellow-500 font-semibold">
                                                    <Star className="h-4 w-4 fill-current" />
                                                    {teacher.rating || 0}
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1">Note</p>
                                            </div>

                                            <div className="h-8 w-px bg-gray-200" />

                                            <div className="text-center">
                                                <div className="flex items-center gap-1 font-semibold ">
                                                    <Users className="h-4 w-4" />
                                                    {teacher.total_students || 0}
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1">Étudiants</p>
                                            </div>
                                        </div>

                                        <Button variant="outline" className="w-full mt-4">
                                            Voir le profil
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
