'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function StudentRegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        referral_code: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const data = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                referral_code: formData.referral_code || undefined
            };

            await api.registerStudent(data);
            
            toast.success("Inscription réussie !", {
                description: "Votre compte étudiant a été créé."
            });
            
            router.push('/auth/login');
        } catch (error: any) {
            toast.error("Erreur d'inscription", {
                description: "Vérifiez vos informations ou si l'e-mail est déjà utilisé."
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-2xl">
                    <h1 className="text-3xl font-bold text-white mb-2 text-center">
                        Inscription Étudiant
                    </h1>
                    <p className="text-purple-200 text-center mb-8">Créez votre compte rapidement</p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-purple-200 mb-1">
                                Nom Complet
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                required
                                className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Votre nom"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-purple-200 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                required
                                className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="votre@email.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-purple-200 mb-1">
                                Mot de passe
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                required
                                minLength={6}
                                className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg text-white font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Création en cours..." : "Créer mon compte"}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <a href="/auth/login" className="text-purple-300 hover:text-white text-sm transition-colors">
                            ← Retour pour se connecter
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}
