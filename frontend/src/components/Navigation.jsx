import { Link, useLocation } from 'react-router-dom'

export function Navigation() {
    const location = useLocation()

    // Don't show nav on the actual game playing screen to preserve immersion
    // Assuming game playing is handled on the root '/' route when phase is 'playing' 
    // Wait, the user might want a way to escape playing phase, but let's provide it everywhere for now

    // Helper to determine active link styling
    const isActive = (path) => {
        if (path === '/' && location.pathname !== '/') return false
        return location.pathname.startsWith(path)
    }

    const navItems = [
        { name: 'Home', path: '/' },
        { name: 'Create World', path: '/create' },
        { name: 'Saved Worlds', path: '/bibles' },
    ]

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-neutral-800 bg-neutral-950/80 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/60">
            <div className="container mx-auto flex h-14 items-center px-4 md:px-8">
                <div className="mr-8 flex items-center gap-2">
                    <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-neutral-100 to-neutral-500 tracking-tight">
                        StoryForge
                    </span>
                </div>

                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end text-sm font-medium">
                    <div className="flex items-center gap-6">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`transition-colors hover:text-neutral-50 ${isActive(item.path)
                                        ? 'text-neutral-50 font-semibold'
                                        : 'text-neutral-400'
                                    }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </nav>
    )
}
