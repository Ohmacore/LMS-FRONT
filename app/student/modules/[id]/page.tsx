'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import StudentLayout from '@/components/layout/StudentLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/ui/page-header'
import {
    ArrowLeft,
    Lock,
    Unlock,
    FileText,
    Video,
    File,
    FileImage,
    BookOpen,
    FileEdit,
    FlaskConical,
    ShoppingCart,
    ChevronDown,
    ChevronRight,
    Package,
    Layers,
    Check,
    Wallet,
    X
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

const getResourceIcon = (mimeType: string) => {
    if (!mimeType) return FileText
    if (mimeType.startsWith('video/')) return Video
    if (mimeType.startsWith('image/')) return FileImage
    if (mimeType.includes('pdf')) return FileText
    return File
}

const formatFileSize = (bytes: number) => {
    if (!bytes) return '—'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

const categoryIcons: Record<string, any> = {
    'Cours': BookOpen,
    'TD': FileEdit,
    'TP': FlaskConical,
    'cours': BookOpen,
    'td': FileEdit,
    'tp': FlaskConical,
}

const categoryColors: Record<string, string> = {
    'Cours': 'bg-blue-500',
    'TD': 'bg-green-500',
    'TP': 'bg-purple-500',
    'cours': 'bg-blue-500',
    'td': 'bg-green-500',
    'tp': 'bg-purple-500',
}

export default function StudentModulePage() {
    const params = useParams()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<any>(null)
    const [expandedChapters, setExpandedChapters] = useState<Set<number>>(new Set())
    const [purchasing, setPurchasing] = useState(false)
    const [purchaseModal, setPurchaseModal] = useState<{
        type: 'chapter' | 'full'
        chapterId?: number
        chapterName?: string
        price: number
    } | null>(null)
    const [walletBalance, setWalletBalance] = useState<number>(0)

    const loadModule = async () => {
        const token = localStorage.getItem('token')
        if (!token) {
            router.push('/auth/login')
            return
        }

        try {
            const [moduleResponse, walletResponse] = await Promise.all([
                api.getStudentModuleDetails(Number(params.id), token),
                api.getWalletBalance(token),
            ])
            setData(moduleResponse)
            setWalletBalance(parseFloat(walletResponse.balance) || 0)

            // Auto-expand first chapter
            if (moduleResponse.folder_tree?.length > 0) {
                setExpandedChapters(new Set([moduleResponse.folder_tree[0].id]))
            }
            setLoading(false)
        } catch (error: any) {
            console.error('Error loading module:', error)
            toast.error('Erreur de chargement', {
                description: error.message || 'Une erreur inconnue est survenue'
            })
            router.push('/student/teachers')
        }
    }

    useEffect(() => {
        loadModule()
    }, [params.id])

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

    const handlePurchase = async () => {
        if (!purchaseModal) return
        const token = localStorage.getItem('token')
        if (!token) return

        setPurchasing(true)
        try {
            const enrollData: any = {
                module_id: data.module.id,
                subscription_type: purchaseModal.type,
            }
            if (purchaseModal.type === 'chapter') {
                enrollData.chapter_id = purchaseModal.chapterId
            }

            const result = await api.enrollInModule(enrollData, token)
            const newBal = parseFloat(result.new_balance) || 0
            toast.success(result.message || 'Inscription réussie !', {
                description: `Nouveau solde: ${newBal.toFixed(2)} DZD`
            })
            setPurchaseModal(null)
            // Reload data
            await loadModule()
        } catch (error: any) {
            toast.error('Erreur', { description: error.message })
        } finally {
            setPurchasing(false)
        }
    }

    const handleResourceClick = (resource: any) => {
        if (resource.locked) {
            toast.error('Ce contenu est verrouillé', {
                description: 'Veuillez acheter le chapitre ou le module complet pour y accéder.'
            })
            return
        }

        const token = localStorage.getItem('token')
        window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002/api'}/resources/${resource.id}/view?token=${token}`, '_blank')
    }

    if (loading) {
        return (
            <StudentLayout>
                <div className="flex h-full items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary"></div>
                </div>
            </StudentLayout>
        )
    }

    const { module, folder_tree, stats, has_full_access, enrolled_chapter_ids, has_any_access } = data

    // Calculate how many chapters are unlocked and remaining price
    const allChaptersUnlocked = folder_tree.length > 0 && folder_tree.every((ch: any) => ch.has_access)
    const remainingPrice = folder_tree
        .filter((ch: any) => !ch.has_access)
        .reduce((sum: number, ch: any) => sum + (parseFloat(ch.price) || 0), 0)
    const showBuyFull = !has_full_access && !allChaptersUnlocked && folder_tree.length > 0

    return (
        <StudentLayout>
            <div className="container mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href={`/student/teachers`}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold">{module.name}</h1>
                        <p className="text-muted-foreground">
                            Par {module.teacher.pseudo || module.teacher.name}
                            {module.level && <> • <Badge variant="outline" className="ml-1">{module.level}</Badge></>}
                            {module.year && <span className="ml-2">Année {module.year}</span>}
                        </p>
                    </div>
                    {has_full_access && (
                        <Badge className="px-4 py-2 bg-green-50 text-green-700 border-green-200 gap-2 text-sm">
                            <Unlock className="h-4 w-4" />
                            Accès Complet
                        </Badge>
                    )}
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Description */}
                        {module.description && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>À propos de ce module</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {module.description}
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Chapters */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <Layers className="h-5 w-5" />
                                Chapitres ({stats.total_chapters})
                            </h2>

                            {folder_tree.length === 0 ? (
                                <Card>
                                    <CardContent className="py-12 text-center">
                                        <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground">Aucun chapitre disponible pour le moment</p>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="space-y-3">
                                    {folder_tree.map((chapter: any) => {
                                        const isExpanded = expandedChapters.has(chapter.id)
                                        const isUnlocked = chapter.has_access
                                        const isEnrolledChapter = enrolled_chapter_ids?.includes(chapter.id)

                                        return (
                                            <Card key={chapter.id} className={`overflow-hidden transition-all ${isUnlocked ? 'ring-1 ring-green-200' : ''}`}>
                                                {/* Chapter Header */}
                                                <div
                                                    className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-accent/30 transition-colors"
                                                    onClick={() => toggleChapter(chapter.id)}
                                                >
                                                    <div className="flex items-center gap-3 flex-1">
                                                        <div className="p-2 rounded-lg bg-indigo-500 text-white shadow-sm">
                                                            {isExpanded
                                                                ? <ChevronDown className="h-5 w-5" />
                                                                : <ChevronRight className="h-5 w-5" />
                                                            }
                                                        </div>
                                                        <div className="flex-1">
                                                            <h3 className="font-semibold text-lg">{chapter.name}</h3>
                                                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                                                <span>{chapter.resources_count} ressource(s)</span>
                                                                <span>•</span>
                                                                <span>{chapter.children?.length || 0} catégorie(s)</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        {isUnlocked ? (
                                                            <Badge className="bg-green-50 text-green-700 border-green-200 gap-1">
                                                                <Check className="h-3 w-3" />
                                                                Débloqué
                                                            </Badge>
                                                        ) : (
                                                            <>
                                                                <span className="font-bold text-lg text-primary">{chapter.price} DZD</span>
                                                                <Button
                                                                    size="sm"
                                                                    className="gap-1 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white border-0"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        setPurchaseModal({
                                                                            type: 'chapter',
                                                                            chapterId: chapter.id,
                                                                            chapterName: chapter.name,
                                                                            price: chapter.price,
                                                                        })
                                                                    }}
                                                                >
                                                                    <ShoppingCart className="h-3 w-3" />
                                                                    Acheter
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Chapter Content (Expanded) */}
                                                {isExpanded && (
                                                    <div className="border-t">
                                                        {chapter.children?.map((subFolder: any) => {
                                                            const SubIcon = categoryIcons[subFolder.name] || categoryIcons[subFolder.type] || BookOpen
                                                            const color = categoryColors[subFolder.name] || categoryColors[subFolder.type] || 'bg-gray-500'

                                                            return (
                                                                <div key={subFolder.id}>
                                                                    {/* Sub-folder header */}
                                                                    <div className="px-6 py-3 bg-accent/5 flex items-center gap-3 border-b">
                                                                        <div className={`p-1.5 rounded-md ${color} text-white`}>
                                                                            <SubIcon className="h-4 w-4" />
                                                                        </div>
                                                                        <span className="font-medium text-sm">{subFolder.name}</span>
                                                                        <Badge variant="outline" className="text-xs">
                                                                            {subFolder.resources_count} fichier(s)
                                                                        </Badge>
                                                                    </div>

                                                                    {/* Resources in sub-folder */}
                                                                    {subFolder.resources?.length > 0 ? (
                                                                        <div className="divide-y">
                                                                            {subFolder.resources.map((resource: any) => {
                                                                                const ResIcon = getResourceIcon(resource.mime_type || '')
                                                                                const isLocked = resource.locked

                                                                                return (
                                                                                    <div
                                                                                        key={resource.id}
                                                                                        onClick={() => handleResourceClick(resource)}
                                                                                        className={`px-6 pl-14 py-3 flex items-center justify-between transition-colors cursor-pointer group
                                                                                            ${isLocked ? 'hover:bg-gray-50' : 'hover:bg-accent/30'}`}
                                                                                    >
                                                                                        <div className="flex items-center gap-3">
                                                                                            <div className={`p-1.5 rounded-full ${resource.mime_type?.startsWith('video/')
                                                                                                    ? 'bg-red-50 text-red-500'
                                                                                                    : 'bg-blue-50 text-blue-500'
                                                                                                }`}>
                                                                                                <ResIcon className="h-4 w-4" />
                                                                                            </div>
                                                                                            <div>
                                                                                                <h4 className={`text-sm font-medium ${isLocked ? 'text-muted-foreground' : 'group-hover:text-primary'}`}>
                                                                                                    {resource.name}
                                                                                                </h4>
                                                                                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                                                                                    <span>{formatFileSize(resource.file_size || resource.size)}</span>
                                                                                                    <span>•</span>
                                                                                                    <span className="uppercase">
                                                                                                        {resource.format || (resource.mime_type?.startsWith('video/') ? 'Vidéo' : 'Document')}
                                                                                                    </span>
                                                                                                    {resource.duration && (
                                                                                                        <>
                                                                                                            <span>•</span>
                                                                                                            <span>{resource.duration}</span>
                                                                                                        </>
                                                                                                    )}
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>

                                                                                        <div>
                                                                                            {isLocked ? (
                                                                                                <Lock className="h-4 w-4 text-muted-foreground" />
                                                                                            ) : (
                                                                                                <Unlock className="h-4 w-4 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                )
                                                                            })}
                                                                        </div>
                                                                    ) : (
                                                                        <div className="px-6 pl-14 py-3 text-sm text-muted-foreground italic">
                                                                            Aucun fichier dans cette catégorie
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )
                                                        })}

                                                        {(!chapter.children || chapter.children.length === 0) && (
                                                            <div className="px-6 py-6 text-center text-muted-foreground">
                                                                Aucune catégorie dans ce chapitre
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </Card>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Buy Full Module */}
                        {showBuyFull && (
                            <Card className="border-2 border-primary/20 bg-gradient-to-b from-primary/5 to-transparent">
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Package className="h-5 w-5 text-primary" />
                                        Module Complet
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-primary">{remainingPrice} DZD</div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {enrolled_chapter_ids?.length > 0
                                                ? `${folder_tree.filter((ch: any) => !ch.has_access).length} chapitre(s) restant(s)`
                                                : `Accès à tous les ${stats.total_chapters} chapitres`
                                            }
                                        </p>
                                    </div>
                                    <Button
                                        className="w-full gap-2 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white shadow-lg border-0"
                                        onClick={() => setPurchaseModal({
                                            type: 'full',
                                            price: remainingPrice,
                                        })}
                                    >
                                        <ShoppingCart className="h-4 w-4" />
                                        Acheter le module complet
                                    </Button>
                                    {enrolled_chapter_ids?.length > 0 && (
                                        <p className="text-xs text-muted-foreground text-center">
                                            Prix mis à jour (chapitres déjà achetés exclus)
                                        </p>
                                    )}
                                    <p className="text-xs text-muted-foreground text-center">
                                        Ou achetez chapitre par chapitre
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {/* All Access Badge */}
                        {(has_full_access || allChaptersUnlocked) && (
                            <Card className="border-2 border-green-200 bg-gradient-to-b from-green-50 to-transparent">
                                <CardContent className="pt-6 text-center space-y-2">
                                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                                        <Check className="h-6 w-6 text-green-600" />
                                    </div>
                                    <p className="font-semibold text-green-700">Accès complet débloqué</p>
                                    <p className="text-xs text-muted-foreground">Vous avez accès à tout le contenu</p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Stats Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Contenu du module</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Layers className="h-4 w-4 text-muted-foreground" />
                                        <span>Chapitres</span>
                                    </div>
                                    <span className="font-semibold">{stats.total_chapters}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                        <span>Documents</span>
                                    </div>
                                    <span className="font-semibold">{stats.total_docs}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Video className="h-4 w-4 text-muted-foreground" />
                                        <span>Vidéos</span>
                                    </div>
                                    <span className="font-semibold">{stats.total_videos}</span>
                                </div>
                                <div className="h-px bg-border my-2" />
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">Total ressources</span>
                                    <span className="font-bold text-lg">{stats.total_resources}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Teacher Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Enseignant</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                                        {(module.teacher.pseudo || module.teacher.name).charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-medium">{module.teacher.name}</p>
                                        {module.teacher.pseudo && (
                                            <p className="text-sm text-muted-foreground">@{module.teacher.pseudo}</p>
                                        )}
                                    </div>
                                </div>
                                <Link href={`/student/teachers/${module.teacher.id}`}>
                                    <Button variant="outline" className="w-full mt-4">
                                        Voir le profil
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>

                        {/* Wallet Info */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3">
                                    <Wallet className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Votre solde</p>
                                        <p className="font-bold text-lg">{walletBalance.toFixed(2)} DZD</p>
                                    </div>
                                </div>
                                <Link href="/student/wallet">
                                    <Button variant="outline" size="sm" className="w-full mt-3">
                                        Recharger le portefeuille
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Purchase Confirmation Modal */}
                {purchaseModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <Card className="w-full max-w-md mx-4 shadow-2xl">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg">Confirmer l'achat</CardTitle>
                                    <Button variant="ghost" size="icon" onClick={() => setPurchaseModal(null)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Module</span>
                                        <span className="font-medium">{module.name}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Type</span>
                                        <span className="font-medium">
                                            {purchaseModal.type === 'full' ? 'Module complet' : `Chapitre: ${purchaseModal.chapterName}`}
                                        </span>
                                    </div>
                                    <div className="h-px bg-border" />
                                    <div className="flex justify-between">
                                        <span className="font-medium">Prix</span>
                                        <span className="text-xl font-bold text-primary">{purchaseModal.price} DZD</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Votre solde</span>
                                        <span className={`font-medium ${walletBalance < purchaseModal.price ? 'text-red-500' : 'text-green-600'}`}>
                                            {walletBalance.toFixed(2)} DZD
                                        </span>
                                    </div>
                                    {walletBalance < purchaseModal.price && (
                                        <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                                            <p className="font-medium">Solde insuffisant</p>
                                            <p>Il vous manque {(purchaseModal.price - walletBalance).toFixed(2)} DZD.</p>
                                            <Link href="/student/wallet">
                                                <Button variant="outline" size="sm" className="mt-2 text-red-700 border-red-200 hover:bg-red-100">
                                                    Recharger le portefeuille
                                                </Button>
                                            </Link>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => setPurchaseModal(null)}
                                    >
                                        Annuler
                                    </Button>
                                    <Button
                                        className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white border-0"
                                        disabled={purchasing || walletBalance < purchaseModal.price}
                                        onClick={handlePurchase}
                                    >
                                        {purchasing ? (
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        ) : (
                                            <>
                                                <Check className="h-4 w-4 mr-1" />
                                                Confirmer
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </StudentLayout>
    )
}
