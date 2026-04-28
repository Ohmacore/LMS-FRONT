'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import StudentLayout from '@/components/layout/StudentLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, BookOpen, Users, Filter, Check, LockOpen } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

export default function ModulesExplorerPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [modules, setModules] = useState<any[]>([])
    const [search, setSearch] = useState('')
    const [minPrice, setMinPrice] = useState<string>('')
    const [maxPrice, setMaxPrice] = useState<string>('')
    const [debouncedSearch, setDebouncedSearch] = useState('')

    // Delay search triggering by 500ms
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search)
        }, 500)
        return () => clearTimeout(handler)
    }, [search])

    const fetchModules = async () => {
        const token = localStorage.getItem('token')
        if (!token) {
            router.push('/auth/login')
            return
        }

        setLoading(true)
        try {
            const params: any = {}
            if (debouncedSearch) params.search = debouncedSearch
            if (minPrice) params.min_price = Number(minPrice)
            if (maxPrice) params.max_price = Number(maxPrice)

            const data = await api.searchModules(params, token)
            setModules(data.modules || [])
        } catch (error) {
            console.error('Error fetching modules:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchModules()
    }, [debouncedSearch]) // Refetch when debounced search term changes

    const handleApplyFilters = () => {
        fetchModules()
    }

    const handleClearFilters = () => {
        setMinPrice('')
        setMaxPrice('')
        setSearch('') // also clear search
        // The clear of search will trigger effect via debouncedSearch eventually,
        // but we might want to also fetch immediately just in case
    }

    return (
        <StudentLayout>
            <div className="container mx-auto p-6 space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Explorer les Modules</h1>
                        <p className="text-muted-foreground">Trouvez des cours, cherchez par professeur ou par matière.</p>
                    </div>
                </div>

                {/* Filters Section */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher par module, sujet, ou enseignant..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <Filter className="h-4 w-4" />
                                Prix
                                {(minPrice || maxPrice) && (
                                    <Badge variant="secondary" className="ml-1 px-1.5 h-5 rounded-sm">1</Badge>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64 p-4 space-y-4">
                            <h4 className="font-medium text-sm">Filtrer par Prix (DZD)</h4>
                            <div className="flex items-center gap-2">
                                <div className="space-y-1 flex-1">
                                    <span className="text-xs text-muted-foreground">Min</span>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(e.target.value)}
                                        className="h-8"
                                    />
                                </div>
                                <span className="text-muted-foreground mt-5">-</span>
                                <div className="space-y-1 flex-1">
                                    <span className="text-xs text-muted-foreground">Max</span>
                                    <Input
                                        type="number"
                                        placeholder="10000"
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                        className="h-8"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-between pt-2">
                                <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                                    Réinitialiser
                                </Button>
                                <Button size="sm" onClick={handleApplyFilters}>
                                    Appliquer
                                </Button>
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Results Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
                    </div>
                ) : modules.length === 0 ? (
                    <Card className="border-dashed bg-transparent">
                        <CardContent className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                            <Search className="h-12 w-12 mb-4 text-muted-foreground/50" />
                            <h3 className="text-lg font-medium text-foreground mb-1">Aucun module trouvé</h3>
                            <p className="max-w-md">Nous n'avons trouvé aucun module correspondant à vos critères de recherche. Essayez de modifier vos filtres.</p>
                            <Button variant="outline" className="mt-4" onClick={handleClearFilters}>
                                Réinitialiser les filtres
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {modules.map((module) => (
                            <Link key={module.id} href={`/student/modules/${module.id}`}>
                                <Card className="h-full hover:shadow-lg transition-all cursor-pointer group flex flex-col relative overflow-hidden">
                                    {module.possession_status === 'full' && (
                                        <div className="absolute top-0 right-0">
                                            <div className="bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg shadow-sm flex items-center gap-1 z-10">
                                                <Check className="h-3 w-3" /> Possédé
                                            </div>
                                        </div>
                                    )}
                                    {module.possession_status === 'partial' && (
                                        <div className="absolute top-0 right-0">
                                            <div className="bg-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg shadow-sm flex items-center gap-1 z-10">
                                                <LockOpen className="h-3 w-3" /> Partiellement possédé
                                            </div>
                                        </div>
                                    )}

                                    <CardHeader className="pb-3 flex-none">
                                        <div className="flex items-start justify-between mb-2">
                                            <Badge variant="outline" className="text-xs bg-primary/5">{module.level || 'Tous niveaux'}</Badge>
                                        </div>
                                        <CardTitle className="text-xl line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                                            {module.name}
                                        </CardTitle>
                                        <CardDescription className="flex items-center gap-2 mt-1.5">
                                            <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold">
                                                {(module.teacher.pseudo || module.teacher.name).charAt(0)}
                                            </div>
                                            <span className="truncate">{module.teacher.name}</span>
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent className="flex flex-col flex-1 pb-4">
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                                            <span className="flex items-center gap-1">
                                                <BookOpen className="h-3.5 w-3.5" />
                                                {module.chapters_count || 0} chapitre(s)
                                            </span>
                                            {module.subject && (
                                                <span className="flex items-center gap-1 truncate max-w-[120px]">
                                                    <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                                                    {module.subject}
                                                </span>
                                            )}
                                        </div>

                                        <div className="mt-auto pt-4 border-t flex items-center justify-between">
                                            <div className="flex flex-col">
                                                {module.possession_status === 'partial' ? (
                                                    <>
                                                        <span className="text-[10px] text-muted-foreground">Reste à payer</span>
                                                        <span className="text-lg font-bold text-primary leading-none">
                                                            {module.remaining_price || 0} DZD
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground mt-0.5 line-through">
                                                            {module.total_price || 0} DZD
                                                        </span>
                                                    </>
                                                ) : module.possession_status === 'full' ? (
                                                    <>
                                                        <span className="text-[10px] text-green-600">Accès complet</span>
                                                        <span className="text-lg font-bold text-green-600 leading-none">Acquis</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="text-[10px] text-muted-foreground">Prix total</span>
                                                        <span className="text-lg font-bold text-primary leading-none">
                                                            {module.total_price || 0} DZD
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                            
                                            <Button variant={module.possession_status !== 'none' ? "outline" : "default"} size="sm" className="h-8 text-xs shrink-0">
                                                {module.possession_status === 'full' ? 'Ouvrir' : 'Détails'}
                                            </Button>
                                        </div>
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
