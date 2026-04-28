export default function TeacherRegisterPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center px-4 py-12">
            <div className="max-w-md w-full">
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
                    <h1 className="text-3xl font-bold text-white mb-2 text-center">
                        Inscription Enseignant
                    </h1>
                    <p className="text-purple-200 text-center mb-8">Partagez vos connaissances</p>

                    <form className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="firstName" className="block text-sm font-medium text-purple-200 mb-2">
                                    Prénom
                                </label>
                                <input
                                    type="text"
                                    id="firstName"
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Prénom"
                                />
                            </div>
                            <div>
                                <label htmlFor="lastName" className="block text-sm font-medium text-purple-200 mb-2">
                                    Nom
                                </label>
                                <input
                                    type="text"
                                    id="lastName"
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Nom"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-purple-200 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="votre@email.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="pseudo" className="block text-sm font-medium text-purple-200 mb-2">
                                Pseudonyme
                            </label>
                            <input
                                type="text"
                                id="pseudo"
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="prof_example"
                            />
                        </div>

                        <div>
                            <label htmlFor="domain" className="block text-sm font-medium text-purple-200 mb-2">
                                Domaine d&apos;intérêt
                            </label>
                            <input
                                type="text"
                                id="domain"
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="Ex: Informatique"
                            />
                        </div>

                        <div>
                            <label htmlFor="year" className="block text-sm font-medium text-purple-200 mb-2">
                                Année
                            </label>
                            <input
                                type="text"
                                id="year"
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="2024-2025"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-purple-200 mb-2">
                                Mot de passe
                            </label>
                            <input
                                type="password"
                                id="password"
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105"
                        >
                            Soumettre ma candidature
                        </button>
                    </form>

                    <div className="mt-4 p-4 bg-yellow-500/20 border border-yellow-400/30 rounded-lg">
                        <p className="text-xs text-yellow-100">
                            ⚠️ Votre compte sera en attente de validation par l&apos;administration
                        </p>
                    </div>

                    <div className="mt-6 text-center">
                        <a href="/" className="text-purple-300 hover:text-white text-sm transition-colors">
                            ← Retour à l&apos;accueil
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}
