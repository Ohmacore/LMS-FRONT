'use client'

import { ReactNode, useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import {
    LayoutDashboard,
    Users,
    BookOpen,
    Wallet,
    LogOut,
    Menu,
    X,
    Bell,
    Sun,
    Moon,
    User,
    Search
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'

interface StudentLayoutProps {
    children: ReactNode
}

const menuItems = [
    {
        label: 'Tableau de bord',
        href: '/student/dashboard',
        icon: LayoutDashboard
    },
    {
        label: 'Enseignants',
        href: '/student/teachers',
        icon: Users
    },
    {
        label: 'Explorer les Modules',
        href: '/student/modules',
        icon: Search
    },
    {
        label: 'Mes Modules',
        href: '/student/my-modules',
        icon: BookOpen
    },
    {
        label: 'Portefeuille',
        href: '/student/wallet',
        icon: Wallet
    },
]

export default function StudentLayout({ children }: StudentLayoutProps) {
    const pathname = usePathname()
    const router = useRouter()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [user, setUser] = useState<any>(null)
    const [mounted, setMounted] = useState(false)
    const { theme, setTheme } = useTheme()

    useEffect(() => {
        setMounted(true)
        const userData = localStorage.getItem('user')
        if (userData) {
            setUser(JSON.parse(userData))
        }
    }, [])

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/')
    }

    const getUserInitials = () => {
        if (!user?.name) return 'ET'
        return user.name
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark')
    }

    return (
        <div className="flex h-screen bg-background">
            {/* Sidebar - Desktop */}
            <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r lg:bg-card">
                {/* Logo */}
                <div className="flex h-16 items-center gap-2 border-b px-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                        <BookOpen className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg font-semibold">E-Learning</span>
                        <span className="text-xs text-muted-foreground">Espace Étudiant</span>
                    </div>
                </div>

                {/* Navigation */}
                <ScrollArea className="flex-1 px-4 py-4">
                    <nav className="space-y-1">
                        {menuItems.map((item) => {
                            const Icon = item.icon
                            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive
                                            ? 'bg-primary text-primary-foreground'
                                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                        }`}
                                >
                                    <Icon className="h-5 w-5" />
                                    {item.label}
                                </Link>
                            )
                        })}
                    </nav>
                </ScrollArea>

                {/* User Profile */}
                <div className="border-t p-4">
                    <div className="flex items-center gap-3 rounded-lg p-2 hover:bg-accent">
                        <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary text-primary-foreground">
                                {getUserInitials()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 overflow-hidden">
                            <p className="truncate text-sm font-medium">
                                {user?.name || 'Étudiant'}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Mobile Sidebar */}
            {sidebarOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />

                    <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-card lg:hidden">
                        <div className="flex h-16 items-center justify-between border-b px-6">
                            <div className="flex items-center gap-2">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                                    <BookOpen className="h-6 w-6 text-primary-foreground" />
                                </div>
                                <span className="text-lg font-semibold">E-Learning</span>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSidebarOpen(false)}
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        <ScrollArea className="flex-1 px-4 py-4">
                            <nav className="space-y-1">
                                {menuItems.map((item) => {
                                    const Icon = item.icon
                                    const isActive = pathname === item.href

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setSidebarOpen(false)}
                                            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'text-muted-foreground hover:bg-accent'
                                                }`}
                                        >
                                            <Icon className="h-5 w-5" />
                                            {item.label}
                                        </Link>
                                    )
                                })}
                            </nav>
                        </ScrollArea>

                        <div className="border-t p-4">
                            <div className="flex items-center gap-3 rounded-lg p-2">
                                <Avatar className="h-10 w-10">
                                    <AvatarFallback className="bg-primary text-primary-foreground">
                                        {getUserInitials()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 overflow-hidden">
                                    <p className="truncate text-sm font-medium">
                                        {user?.name || 'Étudiant'}
                                    </p>
                                    <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                                </div>
                            </div>
                        </div>
                    </aside>
                </>
            )}

            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Top Bar */}
                <header className="flex h-16 items-center justify-between border-b bg-card px-6">
                    {/* Mobile Menu Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="h-5 w-5" />
                    </Button>

                    {/* Desktop: Empty space */}
                    <div className="hidden lg:block flex-1" />

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-2">
                        {/* Notifications */}
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="h-5 w-5" />
                            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                                3
                            </Badge>
                        </Button>

                        {/* Theme Toggle */}
                        {mounted && (
                            <Button variant="ghost" size="icon" onClick={toggleTheme}>
                                {theme === 'dark' ? (
                                    <Sun className="h-5 w-5" />
                                ) : (
                                    <Moon className="h-5 w-5" />
                                )}
                            </Button>
                        )}

                        {/* User Menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="gap-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                                            {getUserInitials()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="hidden md:inline-block text-sm font-medium">
                                        {user?.name || 'Étudiant'}
                                    </span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>Mon Compte</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    <User className="mr-2 h-4 w-4" />
                                    Profil
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Wallet className="mr-2 h-4 w-4" />
                                    Portefeuille
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Déconnexion
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto bg-background">
                    {children}
                </main>
            </div>
        </div>
    )
}
