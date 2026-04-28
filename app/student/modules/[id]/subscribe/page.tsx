'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import StudentLayout from '@/components/layout/StudentLayout'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/ui/page-header'
import { ArrowLeft, Wallet, CheckCircle, AlertCircle, Loader2, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Separator } from '@/components/ui/separator'

export default function SubscribePage() {
    const params = useParams()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)
    const [module, setModule] = useState<any>(null)
    const [walletBalance, setWalletBalance] = useState(0)
    const [pricing, setPricing] = useState<any>(null)

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token')
            if (!token) {
                router.push('/auth/login')
                return
            }

            try {
                // Fetch module details AND wallet balance in parallel
                const [moduleData, walletData] = await Promise.all([
                    api.getStudentModuleDetails(Number(params.id), token),
                    api.getWalletBalance(token)
                ])

                // Check if already enrolled
                if (moduleData.has_access) {
                    toast.info('Vous êtes déjà inscrit à ce module')
                    router.push(`/student/modules/${params.id}`)
                    return
                }

                setModule(moduleData.module)
                setPricing(moduleData.module.pricing)
                setWalletBalance(walletData.balance)
                setLoading(false)
            } catch (error) {
                toast.error('Erreur de chargement')
                router.push('/student/modules')
            }
        }

        fetchData()
    }, [params.id, router])

    const handleSubscribe = async () => {
        if (!pricing || walletBalance < pricing.price) return

        if (!confirm(`Confirmer l'achat pour ${pricing.price} DZD ?`)) return

        setProcessing(true)
        const token = localStorage.getItem('token')

        try {
            await api.enrollInModule({
                module_id: Number(params.id),
                subscription_type: 'full', // Simple simplified model
            }, token!)

            toast.success('Félicitations ! Inscription réussie')
            router.push(`/student/modules/${params.id}`)
        } catch (error: any) {
            toast.error('Erreur lors du paiement', {
                description: error.message
            })
            setProcessing(false)
        }
    }

    if (loading) {
        return (
            <StudentLayout>
                <div className="flex h-full items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </StudentLayout>
        )
    }

    const price = pricing?.price || 0
    const canAfford = walletBalance >= price
    const remainingBalance = walletBalance - price

    return (
        <StudentLayout>
            <div className="container mx-auto p-6 max-w-3xl">
                <div className="flex items-center gap-4 mb-6">
                    <Link href={`/student/modules/${params.id}`}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <PageHeader
                        title="Finaliser l'inscription"
                        description={module.name}
                    />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Purchase Summary */}
                    <Card className="h-fit">
                        <CardHeader>
                            <CardTitle>Résumé de la commande</CardTitle>
                            <CardDescription>Accès complet au module</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">{module.name}</span>
                                <span className="font-medium">{price} DZD</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Frais de service</span>
                                <span className="text-green-600 font-medium">Gratuit</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center text-lg font-bold">
                                <span>Total à payer</span>
                                <span>{price} DZD</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Wallet & Action */}
                    <Card className={canAfford ? 'border-primary/20 bg-primary/5' : 'border-red-200 bg-red-50 dark:bg-red-900/10'}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base">Moyen de paiement</CardTitle>
                                <Badge variant="outline" className="flex items-center gap-1 bg-background">
                                    <Wallet className="h-3 w-3" />
                                    Portefeuille
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-col gap-1 p-4 rounded-lg bg-background border shadow-sm">
                                <span className="text-xs text-muted-foreground uppercase font-semibold">Solde actuel</span>
                                <span className="text-2xl font-bold">{walletBalance} DZD</span>
                            </div>

                            {canAfford ? (
                                <div className="flex items-start gap-3 p-3 rounded-lg bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-sm">
                                    <CheckCircle className="h-5 w-5 shrink-0" />
                                    <div className="space-y-1">
                                        <p className="font-medium">Solde suffisant</p>
                                        <p className="text-xs opacity-90">
                                            Il vous restera <span className="font-bold">{remainingBalance} DZD</span> après l'achat.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-start gap-3 p-3 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">
                                    <AlertCircle className="h-5 w-5 shrink-0" />
                                    <div className="space-y-1">
                                        <p className="font-medium">Solde insuffisant</p>
                                        <p className="text-xs opacity-90">
                                            Il vous manque <span className="font-bold">{price - walletBalance} DZD</span>.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter>
                            {canAfford ? (
                                <Button
                                    className="w-full gap-2 font-semibold"
                                    size="lg"
                                    onClick={handleSubscribe}
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" /> Traitement...
                                        </>
                                    ) : (
                                        <>
                                            Confirmer le paiement <ArrowRight className="h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                            ) : (
                                <Link href="/student/wallet" className="w-full">
                                    <Button variant="destructive" className="w-full gap-2">
                                        <Wallet className="h-4 w-4" />
                                        Recharger mon portefeuille
                                    </Button>
                                </Link>
                            )}
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </StudentLayout>
    )
}
