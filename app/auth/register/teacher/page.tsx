'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function TeacherRegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        pseudo: '',
        domain_of_interest: '',
        year: '',
        password: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await api.registerTeacher(formData);
            
            toast.success("Candidature envoyée !", {
                description: "Votre compte sera en attente de validation."
            });
            
            router.push('/auth/login');
        } catch (error: any) {
            toast.error("Erreur d'inscription", {
                description: "Vérifiez vos informations ou si l'e-mail/pseudo est déjà utilisé."
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center px-4 py-12">
            <div className="max-w-md w-full">
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-2xl">
                    <h1 className="text-3xl font-bold text-white mb-2 text-center">
                        Inscription Enseignant
                    </h1>
                    <p className="text-purple-200 text-center mb-8">Partagez vos connaissances</p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="firstName" className="block text-sm font-medium text-purple-200 mb-1">
                                    Prénom
                                </label>
                                <input
                                    type="text"
                                    id="firstName"
                                    value={formData.first_name}
                                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                                    required
                                    className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Prénom"
                                />
                            </div>
                            <div>
                                <label htmlFor="lastName" className="block text-sm font-medium text-purple-200 mb-1">
                                    Nom
                                </label>
                                <input
                                    type="text"
                                    id="lastName"
                                    value={formData.last_name}
                                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                                    required
                                    className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Nom"
                                />
                            </div>
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
                                className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="votre@email.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="pseudo" className="block text-sm font-medium text-purple-200 mb-1">
                                Pseudonyme
                            </label>
                            <input
                                type="text"
                                id="pseudo"
                                value={formData.pseudo}
                                onChange={(e) => setFormData({...formData, pseudo: e.target.value})}
                                required
                                className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="prof_example"
                            />
                        </div>

                        <div>
                            <label htmlFor="domain" className="block text-sm font-medium text-purple-200 mb-1">
                                Domaine d&apos;intérêt
                            </label>
                            <input
                                type="text"
                                id="domain"
                                value={formData.domain_of_interest}
                                onChange={(e) => setFormData({...formData, domain_of_interest: e.target.value})}
                                required
                                className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="Ex: Informatique"
                            />
                        </div>

                        <div>
                            <label htmlFor="year" className="block text-sm font-medium text-purple-200 mb-1">
                                Année
                            </label>
                            <input
                                type="text"
                                id="year"
                                value={formData.year}
                                onChange={(e) => setFormData({...formData, year: e.target.value})}
                                required
                                className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="2024-2025"
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
                                className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Envoi en cours..." : "Soumettre ma candidature"}
                        </button>
                    </form>

                    <div className="mt-4 p-4 bg-yellow-500/20 border border-yellow-400/30 rounded-lg">
                        <p className="text-xs text-yellow-100">
                            ⚠️ Votre compte sera en attente de validation par l&apos;administration
                        </p>
                    </div>

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
