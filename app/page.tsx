import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-4">
            Plateforme E-Learning
          </h1>
          <p className="text-xl text-purple-200">
            Votre espace d&apos;apprentissage en ligne
          </p>
        </div>

        {/* Main Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Student Card */}
          <Link href="/auth/register/student">
            <div className="group relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 p-8 hover:bg-white/20 transition-all duration-300 cursor-pointer transform hover:scale-105">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/30 to-transparent rounded-full -mr-16 -mt-16"></div>
              
              <div className="relative z-10">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                
                <h2 className="text-3xl font-bold text-white mb-3">
                  Je suis Étudiant
                </h2>
                <p className="text-purple-200 mb-6">
                  Accédez à des milliers de cours, TD, TP et enregistrements de qualité
                </p>
                
                <ul className="space-y-2 text-sm text-purple-100">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Inscription rapide par email
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Accès aux lives et enregistrements
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Système de parrainage
                  </li>
                </ul>

                <div className="mt-6 text-blue-300 font-semibold group-hover:text-blue-200 transition-colors">
                  Commencer →
                </div>
              </div>
            </div>
          </Link>

          {/* Teacher Card */}
          <Link href="/auth/register/teacher">
            <div className="group relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 p-8 hover:bg-white/20 transition-all duration-300 cursor-pointer transform hover:scale-105">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/30 to-transparent rounded-full -mr-16 -mt-16"></div>
              
              <div className="relative z-10">
                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                
                <h2 className="text-3xl font-bold text-white mb-3">
                  Je suis Enseignant
                </h2>
                <p className="text-purple-200 mb-6">
                  Partagez vos connaissances et générez des revenus
                </p>
                
                <ul className="space-y-2 text-sm text-purple-100">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Gestion facile de vos modules
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Cours en direct via Zoom
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Statistiques détaillées
                  </li>
                </ul>

                <div className="mt-6 text-purple-300 font-semibold group-hover:text-purple-200 transition-colors">
                  Commencer →
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Login Link */}
        <div className="text-center mt-12">
          <p className="text-purple-200 mb-4">
            Vous avez déjà un compte ?
          </p>
          <Link 
            href="/auth/login"
            className="inline-block px-8 py-3 bg-white/20 backdrop-blur-lg border border-white/30 rounded-full text-white font-semibold hover:bg-white/30 transition-all duration-300"
          >
            Se connecter
          </Link>
        </div>

        {/* Features */}
        <div className="mt-20 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="w-12 h-12 bg-pink-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-pink-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-2">Accès 24/7</h3>
            <p className="text-purple-200 text-sm">
              Apprenez à votre rythme, quand vous voulez
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-blue-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-2">Cours en direct</h3>
            <p className="text-purple-200 text-sm">
              Interactions en temps réel avec vos enseignants
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-2">Contenu sécurisé</h3>
            <p className="text-purple-200 text-sm">
              Protection DRM de tous vos documents et vidéos
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-20 text-center text-purple-300 text-sm">
          <p>© 2026 Plateforme E-Learning. Tous droits réservés.</p>
          <p className="mt-2">
            <Link href="/auth/login" className="hover:text-white transition-colors">
              Connexion Admin
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
