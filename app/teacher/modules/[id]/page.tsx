'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import TeacherLayout from '@/components/layout/TeacherLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/ui/page-header'
import {
    ArrowLeft, Edit, Users, Upload, FileText, Plus, Trash2,
    BookOpen, FileEdit, FlaskConical, Video, FileImage, File,
    ChevronDown, ChevronRight, Layers, Pencil, Check, X
} from 'lucide-react'
import Link from 'next/link'
import ResourceUploadDialog from '@/components/teacher/ResourceUploadDialog'
import { toast } from 'sonner'

const getResourceIcon = (mimeType: string) => {
    if (!mimeType) return FileText
    if (mimeType.startsWith('video/')) return Video
    if (mimeType.startsWith('image/')) return FileImage
    if (mimeType.includes('pdf')) return FileText
    return File
}

const SUB_FOLDER_CONFIG: Record<string, { icon: any; color: string }> = {
    'Cours': { icon: BookOpen, color: 'bg-blue-500' },
    'TD': { icon: FileEdit, color: 'bg-green-500' },
    'TP': { icon: FlaskConical, color: 'bg-purple-500' },
}

const LEVEL_LABELS: Record<string, string> = {
    primaire: 'Primaire',
    college: 'Collège',
    lycee: 'Lycée',
    universite: 'Université',
}

export default function ModuleDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [module, setModule] = useState<any>(null)
    const [resourceUploadDialogOpen, setResourceUploadDialogOpen] = useState(false)
    const [selectedFolder, setSelectedFolder] = useState<any>(null)
    const [expandedChapters, setExpandedChapters] = useState<Set<number>>(new Set())
    const [addingChapter, setAddingChapter] = useState(false)
    const [newChapterName, setNewChapterName] = useState('')
    const [newChapterPrice, setNewChapterPrice] = useState('')
    const [editingChapterId, setEditingChapterId] = useState<number | null>(null)
    const [editChapterName, setEditChapterName] = useState('')
    const [editChapterPrice, setEditChapterPrice] = useState('')

    const loadModule = async () => {
        const token = localStorage.getItem('token')
        if (!token) {
            router.push('/auth/login')
            return
        }

        try {
            const data = await api.getModuleDetails(Number(params.id), token)
            setModule(data.module)
            // Auto-expand all chapters on first load
            if (data.module?.folders) {
                setExpandedChapters(new Set(data.module.folders.map((f: any) => f.id)))
            }
            setLoading(false)
        } catch (error: any) {
            console.error('Failed to load module:', error)
            setLoading(false)
        }
    }

    useEffect(() => {
        loadModule()
    }, [params.id, router])

    const handleUploadResource = (folder: any) => {
        setSelectedFolder(folder)
        setResourceUploadDialogOpen(true)
    }

    const handleDeleteResource = async (resourceId: number) => {
        if (!confirm('Supprimer cette ressource ?')) return

        const token = localStorage.getItem('token')
        if (!token) return

        try {
            await api.deleteResource(resourceId, token)
            toast.success('Ressource supprimée')
            loadModule()
        } catch (error: any) {
            toast.error('Erreur', { description: error.message })
        }
    }

    const handleAddChapter = async () => {
        if (!newChapterName.trim() || !newChapterPrice) return

        const token = localStorage.getItem('token')
        if (!token) return

        try {
            await api.createFolder(Number(params.id), {
                name: newChapterName.trim(),
                price: parseFloat(newChapterPrice),
            }, token)
            toast.success('Chapitre créé avec succès', {
                description: 'Les sous-dossiers Cours, TD et TP ont été créés automatiquement.'
            })
            setNewChapterName('')
            setNewChapterPrice('')
            setAddingChapter(false)
            loadModule()
        } catch (error: any) {
            toast.error('Erreur', { description: error.message })
        }
    }

    const handleDeleteChapter = async (chapterId: number) => {
        if (!confirm('Supprimer ce chapitre et tout son contenu (Cours, TD, TP et ressources) ?')) return

        const token = localStorage.getItem('token')
        if (!token) return

        try {
            await api.deleteFolder(chapterId, token)
            toast.success('Chapitre supprimé')
            loadModule()
        } catch (error: any) {
            toast.error('Erreur', { description: error.message })
        }
    }

    const toggleChapter = (chapterId: number) => {
        setExpandedChapters(prev => {
            const next = new Set(prev)
            if (next.has(chapterId)) {
                next.delete(chapterId)
            } else {
                next.add(chapterId)
            }
            return next
        })
    }

    const startEditChapter = (chapter: any) => {
        setEditingChapterId(chapter.id)
        setEditChapterName(chapter.name)
        setEditChapterPrice(String(parseFloat(chapter.price || 0)))
    }

    const cancelEditChapter = () => {
        setEditingChapterId(null)
        setEditChapterName('')
        setEditChapterPrice('')
    }

    const handleUpdateChapter = async (chapterId: number) => {
        if (!editChapterName.trim() || !editChapterPrice) return

        const token = localStorage.getItem('token')
        if (!token) return

        try {
            await api.updateFolder(chapterId, {
                name: editChapterName.trim(),
                price: parseFloat(editChapterPrice),
            }, token)
            toast.success('Chapitre mis à jour')
            cancelEditChapter()
            loadModule()
        } catch (error: any) {
            toast.error('Erreur', { description: error.message })
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

    if (!module) {
        return (
            <TeacherLayout>
                <div className="container mx-auto p-6">
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-muted-foreground">Module non trouvé</p>
                            <Link href="/teacher/modules">
                                <Button className="mt-4">Retour aux modules</Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </TeacherLayout>
        )
    }

    const pricing = module.pricing_settings || {}
    const chapters = module.folders || []

    // Count total resources across all chapters
    const totalResources = chapters.reduce((sum: number, chapter: any) => {
        return sum + (chapter.children || []).reduce((subSum: number, sub: any) => {
            return subSum + (sub.resources?.length || 0)
        }, 0)
    }, 0)

    // Compute total price from chapter prices
    const totalPrice = chapters.reduce((sum: number, chapter: any) => {
        return sum + (parseFloat(chapter.price) || 0)
    }, 0)

    const levelLabel = LEVEL_LABELS[module.level] || module.level

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
                        title={module.name}
                        description={`${levelLabel} • ${module.year}${module.year === '1' ? 'ère' : 'ème'} année`}
                        action={
                            <div className="flex gap-2">
                                <Link href={`/teacher/modules/${params.id}/edit`}>
                                    <Button variant="outline" className="gap-2">
                                        <Edit className="h-4 w-4" />
                                        Modifier
                                    </Button>
                                </Link>
                            </div>
                        }
                    />
                </div>

                {/* Quick Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Étudiants Inscrits
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {module.enrollments_count || 0}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Chapitres / Ressources
                            </CardTitle>
                            <Layers className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{chapters.length} / {totalResources}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Prix Total
                            </CardTitle>
                            <Badge variant="secondary" className="font-semibold text-lg px-3 py-1 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-200 shadow-sm">
                                {totalPrice.toFixed(0)} DZD
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm text-muted-foreground">
                                Somme des prix de {chapters.length} chapitre(s)
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Description */}
                {module.description && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">{module.description}</p>
                        </CardContent>
                    </Card>
                )}

                {/* Chapters */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Chapitres</h2>
                        {!addingChapter && (
                            <Button className="gap-2" onClick={() => setAddingChapter(true)}>
                                <Plus className="h-4 w-4" />
                                Ajouter un chapitre
                            </Button>
                        )}
                    </div>

                    {/* Add Chapter Form */}
                    {addingChapter && (
                        <Card className="border-dashed border-2 border-primary/40">
                            <CardContent className="py-4">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="text"
                                        value={newChapterName}
                                        onChange={(e) => setNewChapterName(e.target.value)}
                                        placeholder="Nom du chapitre (ex: Chapitre 1 - Introduction)"
                                        className="flex-1 px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleAddChapter()
                                            if (e.key === 'Escape') {
                                                setAddingChapter(false)
                                                setNewChapterName('')
                                                setNewChapterPrice('')
                                            }
                                        }}
                                    />
                                    <input
                                        type="number"
                                        value={newChapterPrice}
                                        onChange={(e) => setNewChapterPrice(e.target.value)}
                                        placeholder="Prix (DZD)"
                                        min="0"
                                        step="0.01"
                                        className="w-36 px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleAddChapter()
                                            if (e.key === 'Escape') {
                                                setAddingChapter(false)
                                                setNewChapterName('')
                                                setNewChapterPrice('')
                                            }
                                        }}
                                    />
                                    <Button onClick={handleAddChapter} disabled={!newChapterName.trim() || !newChapterPrice}>
                                        Créer
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={() => {
                                            setAddingChapter(false)
                                            setNewChapterName('')
                                            setNewChapterPrice('')
                                        }}
                                    >
                                        Annuler
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    3 sous-dossiers (Cours, TD, TP) seront créés automatiquement
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Empty State */}
                    {chapters.length === 0 && !addingChapter && (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <Layers className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">Aucun chapitre</h3>
                                <p className="text-muted-foreground text-center mb-4 max-w-md">
                                    Ajoutez votre premier chapitre pour commencer à organiser vos ressources
                                </p>
                                <Button className="gap-2" onClick={() => setAddingChapter(true)}>
                                    <Plus className="h-4 w-4" />
                                    Ajouter un chapitre
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* Chapter List */}
                    {chapters.map((chapter: any, index: number) => {
                        const isExpanded = expandedChapters.has(chapter.id)
                        const children = chapter.children || []
                        const chapterResources = children.reduce(
                            (sum: number, sub: any) => sum + (sub.resources?.length || 0), 0
                        )

                        return (
                            <Card key={chapter.id}>
                                {/* Chapter Header */}
                                {editingChapterId === chapter.id ? (
                                    /* Inline Edit Form */
                                    <CardHeader>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="text"
                                                value={editChapterName}
                                                onChange={(e) => setEditChapterName(e.target.value)}
                                                className="flex-1 px-3 py-1.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                                autoFocus
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleUpdateChapter(chapter.id)
                                                    if (e.key === 'Escape') cancelEditChapter()
                                                }}
                                            />
                                            <input
                                                type="number"
                                                value={editChapterPrice}
                                                onChange={(e) => setEditChapterPrice(e.target.value)}
                                                min="0"
                                                step="0.01"
                                                className="w-32 px-3 py-1.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                                placeholder="Prix (DZD)"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleUpdateChapter(chapter.id)
                                                    if (e.key === 'Escape') cancelEditChapter()
                                                }}
                                            />
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                onClick={() => handleUpdateChapter(chapter.id)}
                                                disabled={!editChapterName.trim() || !editChapterPrice}
                                            >
                                                <Check className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={cancelEditChapter}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardHeader>
                                ) : (
                                    <CardHeader
                                        className="cursor-pointer select-none"
                                        onClick={() => toggleChapter(chapter.id)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                {isExpanded ? (
                                                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                                ) : (
                                                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                                )}
                                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                                    <Layers className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-base">{chapter.name}</CardTitle>
                                                    <CardDescription className="flex items-center gap-3 mt-1">
                                                        <span>{chapterResources} ressource(s)</span>
                                                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 font-bold border-emerald-200 shadow-sm">
                                                            {parseFloat(chapter.price || 0).toFixed(0)} DZD
                                                        </Badge>
                                                    </CardDescription>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-muted-foreground hover:text-foreground"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        startEditChapter(chapter)
                                                    }}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleDeleteChapter(chapter.id)
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                )}

                                {/* Chapter Content — Sub-folders */}
                                {isExpanded && (
                                    <CardContent className="pt-0 space-y-4">

                                        {children.map((subFolder: any) => {
                                            const config = SUB_FOLDER_CONFIG[subFolder.name] || {
                                                icon: File,
                                                color: 'bg-gray-500',
                                            }
                                            const SubIcon = config.icon

                                            return (
                                                <div key={subFolder.id} className="border rounded-lg p-4">
                                                    {/* Sub-folder header */}
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`p-1.5 rounded-md ${config.color} text-white`}>
                                                                <SubIcon className="h-4 w-4" />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-sm">{subFolder.name}</p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {subFolder.resources?.length || 0} ressource(s)
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="gap-1.5"
                                                            onClick={() => handleUploadResource(subFolder)}
                                                        >
                                                            <Plus className="h-3.5 w-3.5" />
                                                            Ajouter
                                                        </Button>
                                                    </div>

                                                    {/* Resources list */}
                                                    {subFolder.resources && subFolder.resources.length > 0 && (
                                                        <div className="space-y-2">
                                                            {subFolder.resources.map((resource: any) => {
                                                                const ResourceIcon = getResourceIcon(resource.mime_type)
                                                                return (
                                                                    <div
                                                                        key={resource.id}
                                                                        className="flex items-center justify-between p-2.5 rounded-lg border bg-accent/20 hover:bg-accent/40 transition-colors"
                                                                    >
                                                                        <div className="flex items-center gap-3">
                                                                            <div className={`p-1.5 rounded-full ${resource.mime_type?.startsWith('video/') ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                                                                <ResourceIcon className="h-3.5 w-3.5" />
                                                                            </div>
                                                                            <div>
                                                                                <p className="font-medium text-sm">{resource.name}</p>
                                                                                <p className="text-xs text-muted-foreground flex items-center gap-2">
                                                                                    <span>{(resource.file_size / 1024 / 1024).toFixed(2)} MB</span>
                                                                                    {(resource.mime_type?.startsWith('video/') || resource.mime_type?.includes('pdf')) && (
                                                                                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-background border uppercase">
                                                                                            {resource.mime_type?.startsWith('video/') ? 'VIDÉO' : 'PDF'}
                                                                                        </span>
                                                                                    )}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                            onClick={() => handleDeleteResource(resource.id)}
                                                                        >
                                                                            <Trash2 className="h-3.5 w-3.5" />
                                                                        </Button>
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </CardContent>
                                )}
                            </Card>
                        )
                    })}
                </div>

                {/* Subscribed Students Section */}
                {module.enrollments && module.enrollments.length > 0 && (
                    <div className="space-y-4 mt-8">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            Étudiants inscrits à ce module
                        </h2>
                        <Card>
                            <CardContent className="p-0">
                                <div className="divide-y">
                                    {module.enrollments.map((enr: any) => (
                                        <div key={enr.id} className="flex items-center gap-4 p-4 hover:bg-slate-50/50 transition-colors">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                                                {enr.student?.user?.name?.substring(0, 2).toUpperCase() || 'ST'}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-semibold text-foreground">{enr.student?.user?.name || 'Étudiant'}</p>
                                                <p className="text-xs text-muted-foreground">{enr.student?.user?.email || 'N/A'}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="text-xs text-muted-foreground text-right hidden sm:block">
                                                    <p>Inscrit le</p>
                                                    <p>{new Date(enr.created_at).toLocaleDateString('fr-FR')}</p>
                                                </div>
                                                <Badge variant="outline" className={enr.subscription_type === 'full_pack' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'}>
                                                    {enr.subscription_type === 'full_pack' ? 'Module Complet' : 'Chapitre'}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Upload Dialog */}
                {selectedFolder && (
                    <ResourceUploadDialog
                        folderId={selectedFolder.id}
                        categoryName={selectedFolder.name}
                        open={resourceUploadDialogOpen}
                        onOpenChange={setResourceUploadDialogOpen}
                        onSuccess={loadModule}
                    />
                )}
            </div>
        </TeacherLayout>
    )
}
