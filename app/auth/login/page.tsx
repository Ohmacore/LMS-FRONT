'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const response = await api.login({ email, password })

            // Store token in localStorage
            localStorage.setItem('token', response.token)
            localStorage.setItem('user', JSON.stringify(response.user))

            // Redirect based on role
            if (response.user.role === 'admin') {
                router.push('/admin/dashboard')
            } else if (response.user.role === 'teacher') {
                router.push('/teacher/dashboard')
            } else {
                router.push('/student/dashboard')
            }
        } catch (err: any) {
            setError(err.message || 'Login failed. Please check your credentials.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
                    <h1 className="text-3xl font-bold text-white mb-8 text-center">
                        Connexion
                    </h1>

                    {error && (
                        <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                            <p className="text-red-200 text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-purple-200 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="votre@email.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-purple-200 mb-2">
                                Mot de passe
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Connexion...' : 'Se connecter'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <a href="/" className="text-purple-300 hover:text-white text-sm transition-colors">
                            ← Retour à l&apos;accueil
                        </a>
                    </div>

                    <div className="mt-8 p-4 bg-blue-500/20 border border-blue-400/30 rounded-lg">
                        <p className="text-sm text-blue-200 font-semibold mb-2">Comptes de test :</p>
                        <div className="text-xs text-blue-100 space-y-1">
                            <p>Admin: admin@elearning.com / password</p>
                            <p>Enseignant: ahmed@elearning.com / password</p>
                            <p>Étudiant: student1@elearning.com / password</p>
                        </div>
                    </div>

                    {process.env.NODE_ENV === 'development' && (
                        <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-400/30 rounded-lg">
                            <p className="text-xs text-yellow-100">
                                ⚠️ <strong>Base de données requise:</strong> Exécutez <code className="bg-black/30 px-1 rounded">./setup.sh</code> dans le dossier backend
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
