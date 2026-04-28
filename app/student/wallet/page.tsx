'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import StudentLayout from '@/components/layout/StudentLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, TrendingDown, TrendingUp, Clock, CheckCircle2, XCircle, Loader } from 'lucide-react'
import { toast } from 'sonner'

export default function WalletPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [balance, setBalance] = useState(0)
    const [transactions, setTransactions] = useState<any[]>([])
    const [showRechargeModal, setShowRechargeModal] = useState(false)
    const [rechargeAmount, setRechargeAmount] = useState('')
    const [receiptFile, setReceiptFile] = useState<File | null>(null)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        loadWalletData()
    }, [])

    const loadWalletData = async () => {
        const token = localStorage.getItem('token')
        if (!token) {
            router.push('/auth/login')
            return
        }

        try {
            const walletData = await api.getWalletBalance(token)
            setBalance(parseFloat(walletData.balance) || 0)

            const transData = await api.getTransactions(token)
            setTransactions(transData.transactions)

            setLoading(false)
        } catch (error) {
            console.error('Failed to load wallet:', error)
            setLoading(false)
        }
    }

    const handleRecharge = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!receiptFile) {
            toast.error('Veuillez uploader un reçu')
            return
        }

        const token = localStorage.getItem('token')!
        setSubmitting(true)

        try {
            await api.rechargeWallet(parseFloat(rechargeAmount), receiptFile, token)
            toast.success('Demande de recharge envoyée !', {
                description: 'Vous serez notifié une fois validée.'
            })
            setShowRechargeModal(false)
            setRechargeAmount('')
            setReceiptFile(null)
            loadWalletData()
        } catch (error: any) {
            toast.error('Erreur lors de la recharge', {
                description: error.message
            })
        } finally {
            setSubmitting(false)
        }
    }

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

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle2 className="h-4 w-4 text-green-600" />
            case 'pending':
                return <Clock className="h-4 w-4 text-yellow-600" />
            case 'rejected':
                return <XCircle className="h-4 w-4 text-red-600" />
            default:
                return null
        }
    }

    const getStatusBadge = (status: string) => {
        const variants: Record<string, string> = {
            completed: 'bg-green-100 text-green-800 border-green-200',
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            rejected: 'bg-red-100 text-red-800 border-red-200',
        }

        const labels: Record<string, string> = {
            completed: 'Complété',
            pending: 'En attente',
            rejected: 'Refusé',
        }

        return (
            <Badge variant="outline" className={variants[status] || ''}>
                {labels[status] || status}
            </Badge>
        )
    }

    return (
        <StudentLayout>
            <div className="container mx-auto p-6 space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold">Portefeuille</h1>
                    <p className="text-muted-foreground mt-1">Gérez votre solde et vos transactions</p>
                </div>

                {/* Balance Card */}
                <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0">
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div>
                                <p className="text-blue-100 text-sm font-medium mb-1">Solde Disponible</p>
                                <p className="text-5xl font-bold">{balance.toFixed(2)} DZD</p>
                            </div>
                            <Button
                                onClick={() => setShowRechargeModal(true)}
                                variant="secondary"
                                size="lg"
                                className="gap-2"
                            >
                                <Plus className="h-5 w-5" />
                                Recharger le portefeuille
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Transactions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Historique des Transactions</CardTitle>
                        <CardDescription>Toutes vos transactions récentes</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {transactions.length === 0 ? (
                            <div className="text-center py-12">
                                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">Aucune transaction</h3>
                                <p className="text-muted-foreground text-sm">Vos transactions apparaîtront ici</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {transactions.map((transaction) => (
                                    <div
                                        key={transaction.id}
                                        className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-full ${transaction.amount > 0 ? 'bg-green-100' : 'bg-red-100'
                                                }`}>
                                                {transaction.amount > 0 ? (
                                                    <TrendingUp className="h-5 w-5 text-green-600" />
                                                ) : (
                                                    <TrendingDown className="h-5 w-5 text-red-600" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium">
                                                    {transaction.type === 'deposit' ? 'Recharge' :
                                                        transaction.type === 'purchase' ? 'Achat de module' : 'Parrainage'}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {transaction.description}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {new Date(transaction.created_at).toLocaleString('fr-FR')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right flex flex-col items-end gap-2">
                                            <p className={`text-lg font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                {transaction.amount > 0 ? '+' : ''}{transaction.amount} DZD
                                            </p>
                                            {getStatusBadge(transaction.status)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recharge Modal */}
                {showRechargeModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <Card className="w-full max-w-md">
                            <CardHeader>
                                <CardTitle>Recharger le Portefeuille</CardTitle>
                                <CardDescription>Uploadez votre reçu de paiement BaridiMob</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleRecharge} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Montant (DZD)</label>
                                        <input
                                            type="number"
                                            min="100"
                                            step="100"
                                            required
                                            value={rechargeAmount}
                                            onChange={(e) => setRechargeAmount(e.target.value)}
                                            className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                            placeholder="5000"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Reçu BaridiMob</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            required
                                            onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                                            className="w-full px-4 py-2 rounded-lg border bg-background file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-primary file:text-primary-foreground file:cursor-pointer"
                                        />
                                        <p className="text-xs text-muted-foreground">Format: JPG, PNG (max 5MB)</p>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="flex-1"
                                            onClick={() => setShowRechargeModal(false)}
                                        >
                                            Annuler
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="flex-1 gap-2"
                                            disabled={submitting}
                                        >
                                            {submitting ? (
                                                <>
                                                    <Loader className="h-4 w-4 animate-spin" />
                                                    Envoi...
                                                </>
                                            ) : (
                                                'Soumettre'
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </StudentLayout>
    )
}
