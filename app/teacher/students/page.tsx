'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import TeacherLayout from '@/components/layout/TeacherLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, BookOpen, Calendar, Mail, Search } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export default function StudentsPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [enrollments, setEnrollments] = useState<any[]>([])
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        const loadStudents = async () => {
            const token = localStorage.getItem('token')
            if (!token) {
                router.push('/auth/login')
                return
            }

            try {
                const data = await api.getTeacherEnrollments(token)
                setEnrollments(data.enrollments || [])
                setLoading(false)
            } catch (error) {
                console.error('Failed to load students:', error)
                setLoading(false)
            }
        }

        loadStudents()
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

    // Group enrollments by student
    const studentMap = new Map()
    enrollments.forEach((enrollment: any) => {
        const studentId = enrollment.student?.id
        if (!studentId) return

        if (!studentMap.has(studentId)) {
            studentMap.set(studentId, {
                student: enrollment.student,
                modules: []
            })
        }
        studentMap.get(studentId).modules.push({
            module: enrollment.module,
            type: enrollment.subscription_type,
            enrolled_at: enrollment.enrolled_at
        })
    })

    const students = Array.from(studentMap.values())
    const filteredStudents = students.filter(item => 
        item.student.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.student.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const thisMonthNew = enrollments.filter(e => {
        const enrolled = new Date(e.enrolled_at || e.created_at)
        const now = new Date()
        return enrolled.getMonth() === now.getMonth() &&
            enrolled.getFullYear() === now.getFullYear()
    }).length

    return (
        <TeacherLayout>
            <div className="container mx-auto p-6 space-y-6">
                {/* Header */}
                <PageHeader
                    title="Mes Étudiants"
                    description="Liste des étudiants inscrits à vos modules"
                />

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Étudiants
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{students.length}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Inscriptions
                            </CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{enrollments.length}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Nouveaux ce mois
                            </CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {thisMonthNew}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search Bar */}
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Répertoire des apprenants</h2>
                    <div className="relative w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Rechercher par nom ou email..." 
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Students List */}
                {filteredStudents.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Users className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">
                                Aucun étudiant trouvé
                            </h3>
                            <p className="text-muted-foreground text-center">
                                {searchQuery 
                                    ? "Aucun étudiant ne correspond à votre recherche." 
                                    : "Les étudiants inscrits à vos modules apparaîtront ici."}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {filteredStudents.map((item: any) => {
                            const name = item.student.user?.name || 'Étudiant Anonyme';
                            const email = item.student.user?.email || 'email@example.com';
                            const initials = name.substring(0, 2).toUpperCase();

                            return (
                                <Card key={item.student.id}>
                                    <CardContent className="p-6">
                                        <div className="flex items-start gap-4">
                                            {/* Avatar */}
                                            <Avatar className="h-12 w-12 flex-shrink-0">
                                                <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                                                    {initials}
                                                </AvatarFallback>
                                            </Avatar>

                                            {/* Student Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="overflow-hidden">
                                                        <h3 className="font-semibold truncate">
                                                            {name}
                                                        </h3>
                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1 truncate">
                                                            <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                                                            <span className="truncate">{email}</span>
                                                        </div>
                                                    </div>
                                                    <Badge variant="outline" className="flex-shrink-0 ml-2">
                                                        {item.modules.length} module{item.modules.length > 1 ? 's' : ''}
                                                    </Badge>
                                                </div>

                                                {/* Enrolled Modules */}
                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    {item.modules.map((m: any, idx: number) => (
                                                        <div key={idx} className="flex items-center gap-2 text-sm bg-muted rounded-md px-2 py-1">
                                                            <BookOpen className="h-3 w-3 text-muted-foreground" />
                                                            <span className="truncate max-w-[150px] font-medium">{m.module?.name}</span>
                                                            <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
                                                                {m.type === 'full_pack' ? 'Complet' : 'Chapitre'}
                                                            </Badge>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                )}
            </div>
        </TeacherLayout>
    )
}
