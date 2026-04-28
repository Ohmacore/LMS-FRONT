'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import TeacherLayout from '@/components/layout/TeacherLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { TrendingUp, Wallet, DollarSign, Clock, ArrowDownToLine, Send, CreditCard, AlertCircle } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'

type TabKey = 'revenues' | 'withdrawals'

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; color: string }> = {
    pending: { label: 'En attente', variant: 'outline', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
    in_treatment: { label: 'En traitement', variant: 'secondary', color: 'bg-blue-100 text-blue-800 border-blue-300' },
    transferred: { label: 'Transféré', variant: 'default', color: 'bg-green-100 text-green-800 border-green-300' },
    rejected: { label: 'Rejeté', variant: 'destructive', color: 'bg-red-100 text-red-800 border-red-300' },
}

const PAYMENT_METHODS = [
    { value: 'CCP', label: 'CCP' },
    { value: 'Baridimob', label: 'Baridimob' },
    { value: 'BaridiPay', label: 'BaridiPay' },
]

export default function EarningsPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<TabKey>('revenues')
    const [earnings, setEarnings] = useState({
        total: 0,
        pending: 0,
        thisMonth: 0,
        transactions: [] as any[]
    })
    const [withdrawals, setWithdrawals] = useState<any[]>([])
    const [withdrawalsLoading, setWithdrawalsLoading] = useState(false)

    // Dialog state
    const [dialogOpen, setDialogOpen] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [withdrawalForm, setWithdrawalForm] = useState({
        amount: '',
        payment_method: 'CCP',
        payment_details: '',
    })
    const [formError, setFormError] = useState('')

    useEffect(() => {
        const loadEarnings = async () => {
            const token = localStorage.getItem('token')
            if (!token) {
                router.push('/auth/login')
                return
            }

            try {
                const data = await api.getTeacherEarnings(token)

                setEarnings({
                    total: data.total_earnings || 0,
                    pending: data.pending_earnings || 0,
                    thisMonth: data.this_month_earnings || 0,
                    transactions: data.transactions || []
                })
                setLoading(false)
            } catch (error) {
                console.error('Failed to load earnings:', error)
                setLoading(false)
            }
        }

        loadEarnings()
    }, [router])

    const loadWithdrawals = async () => {
        const token = localStorage.getItem('token')
        if (!token) return

        setWithdrawalsLoading(true)
        try {
            const data = await api.getTeacherWithdrawals(token)
            setWithdrawals(data.withdrawals || [])
        } catch (error) {
            console.error('Failed to load withdrawals:', error)
        } finally {
            setWithdrawalsLoading(false)
        }
    }

    useEffect(() => {
        if (activeTab === 'withdrawals') {
            loadWithdrawals()
        }
    }, [activeTab])

    const handleSubmitWithdrawal = async () => {
        setFormError('')
        const token = localStorage.getItem('token')
        if (!token) return

        const amount = parseFloat(withdrawalForm.amount)
        if (isNaN(amount) || amount < 100) {
            setFormError('Le montant minimum est de 100 DZD.')
            return
        }
        if (!withdrawalForm.payment_details.trim() || withdrawalForm.payment_details.trim().length < 5) {
            setFormError('Veuillez entrer les détails de paiement (min 5 caractères).')
            return
        }

        setSubmitting(true)
        try {
            await api.requestWithdrawal({
                amount,
                payment_method: withdrawalForm.payment_method,
                payment_details: withdrawalForm.payment_details.trim(),
            }, token)

            setDialogOpen(false)
            setWithdrawalForm({ amount: '', payment_method: 'CCP', payment_details: '' })
            loadWithdrawals()

            // Reload earnings to reflect updated available balance
            const data = await api.getTeacherEarnings(token)
            setEarnings({
                total: data.total_earnings || 0,
                pending: data.pending_earnings || 0,
                thisMonth: data.this_month_earnings || 0,
                transactions: data.transactions || []
            })
        } catch (error: any) {
            setFormError(error.message || 'Erreur lors de la demande de retrait.')
        } finally {
            setSubmitting(false)
        }
    }

    // Calculate withdrawn/in-progress amounts for display
    const withdrawnAmount = withdrawals
        .filter((w: any) => ['pending', 'in_treatment', 'transferred'].includes(w.status))
        .reduce((sum: number, w: any) => sum + parseFloat(w.amount), 0)

    const availableBalance = earnings.total - withdrawnAmount

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
                    title="Mes Revenus"
                    description="Suivez vos gains, transactions et demandes de retrait"
                />

                {/* Tab Navigation */}
                <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
                    <button
                        onClick={() => setActiveTab('revenues')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                            activeTab === 'revenues'
                                ? 'bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Revenus
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('withdrawals')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                            activeTab === 'withdrawals'
                                ? 'bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <ArrowDownToLine className="h-4 w-4" />
                            Retraits
                        </div>
                    </button>
                </div>

                {/* ===== REVENUES TAB ===== */}
                {activeTab === 'revenues' && (
                    <>
                        {/* Stats Cards */}
                        <div className="grid gap-3 md:grid-cols-3">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        Revenus Totaux
                                    </CardTitle>
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{earnings.total.toFixed(2)} DZD</div>
                                    <p className="text-xs text-muted-foreground">
                                        Depuis le début
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        Ce Mois
                                    </CardTitle>
                                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{earnings.thisMonth.toFixed(2)} DZD</div>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        Disponible
                                    </CardTitle>
                                    <Wallet className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{availableBalance.toFixed(2)} DZD</div>
                                    <p className="text-xs text-muted-foreground">
                                        Prêt à retirer
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Transactions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Historique des Revenus</CardTitle>
                                <CardDescription>Vos transactions et ventes de modules</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {earnings.transactions.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold mb-2">Aucune transaction</h3>
                                        <p className="text-muted-foreground text-sm">
                                            Vos revenus apparaîtront ici une fois que des étudiants achètent vos modules
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {earnings.transactions.map((transaction: any) => (
                                            <div
                                                key={transaction.id}
                                                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 rounded-full bg-green-100">
                                                        <TrendingUp className="h-5 w-5 text-green-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">
                                                            Vente de module
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {transaction.description}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {new Date(transaction.created_at).toLocaleString('fr-FR')}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-bold text-green-600">
                                                        +{transaction.amount} DZD
                                                    </p>
                                                    <Badge variant="outline">
                                                        {transaction.status === 'completed' ? 'Validé' : 'En attente'}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </>
                )}

                {/* ===== WITHDRAWALS TAB ===== */}
                {activeTab === 'withdrawals' && (
                    <>
                        {/* Withdrawal Action Card */}
                        <Card className="border-dashed">
                            <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-full bg-primary/10">
                                        <Send className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-lg">Solde disponible</p>
                                        <p className="text-2xl font-bold text-primary">{availableBalance.toFixed(2)} DZD</p>
                                    </div>
                                </div>
                                <Button
                                    size="lg"
                                    onClick={() => {
                                        setFormError('')
                                        setDialogOpen(true)
                                    }}
                                    disabled={availableBalance < 100}
                                    className="gap-2"
                                >
                                    <ArrowDownToLine className="h-4 w-4" />
                                    Demander un retrait
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Withdrawal History */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Historique des Retraits</CardTitle>
                                <CardDescription>Suivez l&apos;état de vos demandes de retrait</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {withdrawalsLoading ? (
                                    <div className="flex justify-center py-12">
                                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary"></div>
                                    </div>
                                ) : withdrawals.length === 0 ? (
                                    <div className="text-center py-12">
                                        <ArrowDownToLine className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold mb-2">Aucune demande de retrait</h3>
                                        <p className="text-muted-foreground text-sm">
                                            Vos demandes de retrait apparaîtront ici
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {withdrawals.map((withdrawal: any) => {
                                            const statusConfig = STATUS_CONFIG[withdrawal.status] || STATUS_CONFIG.pending
                                            return (
                                                <div
                                                    key={withdrawal.id}
                                                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-3 rounded-full bg-primary/10">
                                                            <CreditCard className="h-5 w-5 text-primary" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">
                                                                Retrait via {withdrawal.payment_method}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {withdrawal.payment_details}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                {new Date(withdrawal.created_at).toLocaleString('fr-FR')}
                                                            </p>
                                                            {withdrawal.admin_notes && (
                                                                <p className="text-xs text-orange-600 mt-1">
                                                                    Note: {withdrawal.admin_notes}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-lg font-bold">
                                                            {parseFloat(withdrawal.amount).toFixed(2)} DZD
                                                        </p>
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                                                            {statusConfig.label}
                                                        </span>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>

            {/* Withdrawal Request Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Demander un retrait</DialogTitle>
                        <DialogDescription>
                            Entrez le montant et les détails de paiement pour votre demande de retrait.
                            Solde disponible: <strong>{availableBalance.toFixed(2)} DZD</strong>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        {/* Amount */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium" htmlFor="withdrawal-amount">
                                Montant (DZD) *
                            </label>
                            <Input
                                id="withdrawal-amount"
                                type="number"
                                min="100"
                                step="0.01"
                                placeholder="Ex: 1000"
                                value={withdrawalForm.amount}
                                onChange={(e) => setWithdrawalForm({ ...withdrawalForm, amount: e.target.value })}
                            />
                            <p className="text-xs text-muted-foreground">Montant minimum: 100 DZD</p>
                        </div>

                        {/* Payment Method */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium" htmlFor="payment-method">
                                Méthode de paiement *
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {PAYMENT_METHODS.map((method) => (
                                    <button
                                        key={method.value}
                                        type="button"
                                        onClick={() => setWithdrawalForm({ ...withdrawalForm, payment_method: method.value })}
                                        className={`px-3 py-2 rounded-md border text-sm font-medium transition-all duration-200 ${
                                            withdrawalForm.payment_method === method.value
                                                ? 'border-primary bg-primary/10 text-primary'
                                                : 'border-border hover:border-primary/50 text-muted-foreground'
                                        }`}
                                    >
                                        {method.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Payment Details */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium" htmlFor="payment-details">
                                Détails de paiement (RIB/RIP/N° Compte) *
                            </label>
                            <textarea
                                id="payment-details"
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Ex: CCP 1234567890 CLÉ 42"
                                value={withdrawalForm.payment_details}
                                onChange={(e) => setWithdrawalForm({ ...withdrawalForm, payment_details: e.target.value })}
                            />
                        </div>

                        {/* Error message */}
                        {formError && (
                            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                {formError}
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>
                            Annuler
                        </Button>
                        <Button onClick={handleSubmitWithdrawal} disabled={submitting} className="gap-2">
                            {submitting ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                    Envoi...
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4" />
                                    Envoyer la demande
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </TeacherLayout>
    )
}
