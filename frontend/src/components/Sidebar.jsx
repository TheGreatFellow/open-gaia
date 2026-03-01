import { Link, useLocation } from 'react-router-dom'

const navItems = [
    { name: 'Home', path: '/', icon: HomeIcon },
    { name: 'My Worlds', path: '/bibles', icon: BookIcon },
    { name: 'Generate', path: '/create', icon: SparkleIcon },
]

export function Sidebar() {
    const location = useLocation()

    const isActive = (path) => {
        if (path === '/' && location.pathname !== '/') return false
        return location.pathname.startsWith(path)
    }

    return (
        <aside className="fixed left-0 top-0 bottom-0 w-60 bg-[#0a0a0a] border-r-2 border-[#333] flex flex-col z-40">
            {/* Logo */}
            <div className="px-5 py-5 flex items-center gap-3">
                <div className="w-8 h-8 border-2 border-[#39ff14] flex items-center justify-center shadow-[0_0_12px_rgba(57,255,20,0.3)]">
                    <span className="text-[#39ff14] text-sm">⬢</span>
                </div>
                <span className="text-[#39ff14] text-sm font-normal tracking-widest uppercase" style={{ fontFamily: 'RetroGaming, monospace', textShadow: '0 0 8px rgba(57,255,20,0.4)' }}>
                    Open Gaia
                </span>
            </div>

            {/* Separator */}
            <div className="pixel-sep mx-4" />

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`sidebar-link ${isActive(item.path) ? 'active' : ''}`}
                    >
                        <item.icon className="w-4 h-4 shrink-0" />
                        {item.name}
                    </Link>
                ))}
            </nav>

            {/* Bottom */}
            <div className="px-3 pb-4 space-y-1">
                <div className="pixel-sep mx-1 mb-3" />
                <div className="sidebar-link opacity-40 cursor-default">
                    <CommunityIcon className="w-4 h-4 shrink-0" />
                    Community
                    <span className="ml-auto text-[8px] uppercase tracking-wider text-[#ff00ff] font-normal" style={{ fontFamily: 'RetroGaming, monospace' }}>Soon</span>
                </div>
            </div>
        </aside>
    )
}

/* ─── Inline SVG Icons ─── */

function HomeIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
    )
}

function BookIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
    )
}

function SparkleIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z" />
        </svg>
    )
}

function CommunityIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    )
}
