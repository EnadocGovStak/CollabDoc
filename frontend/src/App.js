import React from 'react';
import { Link, Outlet, NavLink } from 'react-router-dom';
import {
    Bell,
    CircleHelp,
    FileText,
    LayoutDashboard,
    Library,
    Moon,
    PencilLine,
    Plus,
    Search,
    Settings,
    Sun,
    UserCircle
} from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './theme/ThemeContext';
import './App.css';

const primaryNavItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/documents', label: 'Documents', icon: FileText },
    { to: '/templates', label: 'Templates', icon: Library },
    { to: '/field-library', label: 'Field Library', icon: Library },
    { to: '/editor', label: 'Editor', icon: PencilLine }
];

const accountNavItems = [
    { to: '/profile', label: 'Profile', icon: UserCircle },
    { to: '/settings', label: 'Settings', icon: Settings }
];

function getUserDisplayName(user) {
    return user?.name || user?.email || 'Workspace User';
}

function getUserInitials(user) {
    const source = getUserDisplayName(user);
    const parts = source
        .replace(/@.*/, '')
        .split(/[\s._-]+/)
        .filter(Boolean);

    return (parts.length > 1
        ? `${parts[0][0]}${parts[1][0]}`
        : source.slice(0, 2)
    ).toUpperCase();
}

function getUserSubtitle(user) {
    if (user?.email) {
        return user.email;
    }

    if (user?.roles?.length) {
        return user.roles.slice(0, 2).join(', ');
    }

    return 'Workspace member';
}

function AuthStatusScreen({ title, message, action }) {
    return (
        <main className="app-auth-screen">
            <section className="app-auth-panel" aria-live="polite">
                <div className="app-auth-kicker">Identity</div>
                <h1>{title}</h1>
                <p>{message}</p>
                {action && (
                    <button type="button" className="app-auth-action" onClick={action.onClick}>
                        {action.label}
                    </button>
                )}
            </section>
        </main>
    );
}

function ShellNavLink({ item, mobile = false }) {
    const Icon = item.icon;

    return (
        <NavLink
            to={item.to}
            end={item.end}
            className={({ isActive }) => `${mobile ? 'app-mobile-link' : 'app-shell-link'}${isActive ? ' active' : ''}`}
        >
            <span className="app-shell-icon" aria-hidden="true">
                <Icon size={17} strokeWidth={2.2} />
            </span>
            <span>{item.label}</span>
        </NavLink>
    );
}

function AppShell() {
    const { theme, setTheme } = useTheme();
    const { user, isLoading, isAuthenticated, authError, login } = useAuth();
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    const displayName = getUserDisplayName(user);
    const initials = getUserInitials(user);
    const subtitle = getUserSubtitle(user);

    if (isLoading) {
        return (
            <AuthStatusScreen
                title="Signing you in"
                message="Connecting your SFlow identity to the document workspace."
            />
        );
    }

    if (authError || !isAuthenticated) {
        return (
            <AuthStatusScreen
                title="Sign in needs attention"
                message={authError?.message || 'Your SFlow session could not be loaded.'}
                action={{ label: 'Try again', onClick: () => login('/') }}
            />
        );
    }

    return (
        <div className="app">
            <aside className="app-sidebar" aria-label="Workspace navigation">
                <div className="app-sidebar-brand">
                    <Link to="/" className="app-logo-link" aria-label="evia collab dashboard">
                        <img src="/images/Media.jpg" alt="evia collab" className="app-logo-image" />
                        <span className="app-brand-copy">
                            <strong>Evia Collab</strong>
                            <span>Professional Workspace</span>
                        </span>
                    </Link>
                </div>

                <nav className="app-sidebar-nav" aria-label="Primary">
                    {primaryNavItems.map(item => <ShellNavLink key={item.to} item={item} />)}
                </nav>

                <div className="app-sidebar-footer">
                    <nav className="app-sidebar-nav account" aria-label="Account">
                        {accountNavItems.map(item => <ShellNavLink key={item.to} item={item} />)}
                    </nav>
                    <div className="app-user-card">
                        <span className="app-user-avatar" aria-hidden="true">{initials}</span>
                        <span>
                            <strong>{displayName}</strong>
                            <small>{subtitle}</small>
                        </span>
                    </div>
                </div>
            </aside>

            <header className="app-topbar">
                <Link to="/" className="app-mobile-brand" aria-label="evia collab dashboard">
                    <img src="/images/Media.jpg" alt="evia collab" className="app-mobile-logo" />
                    <span>Evia Collab</span>
                </Link>

                <div className="app-search" role="search">
                    <label htmlFor="workspace-search" className="sr-only">Search workspace</label>
                    <Search className="app-search-icon" size={16} strokeWidth={2.1} aria-hidden="true" />
                    <input id="workspace-search" type="search" placeholder="Search workspace..." />
                </div>

                <div className="app-topbar-actions">
                    <button type="button" className="app-icon-button" aria-label="Notifications" title="Notifications">
                        <Bell size={17} strokeWidth={2.1} aria-hidden="true" />
                    </button>
                    <button type="button" className="app-icon-button" aria-label="Help" title="Help">
                        <CircleHelp size={17} strokeWidth={2.1} aria-hidden="true" />
                    </button>
                    <button
                        type="button"
                        className="app-icon-button"
                        aria-label={`Switch to ${nextTheme} mode`}
                        title={`Switch to ${nextTheme} mode`}
                        onClick={() => setTheme(nextTheme)}
                    >
                        {theme === 'dark'
                            ? <Sun size={17} strokeWidth={2.1} aria-hidden="true" />
                            : <Moon size={17} strokeWidth={2.1} aria-hidden="true" />}
                    </button>
                    <Link to="/editor" className="app-primary-action">
                        <Plus size={16} strokeWidth={2.4} aria-hidden="true" />
                        <span>New Document</span>
                    </Link>
                </div>
            </header>

            <main className="app-main">
                <Outlet />
            </main>

            <nav className="app-mobile-nav" aria-label="Mobile primary navigation">
                {[primaryNavItems[1], primaryNavItems[2], primaryNavItems[3], accountNavItems[0]].map(item => (
                    <ShellNavLink key={item.to} item={item} mobile />
                ))}
            </nav>
        </div>
    );
}

function App() {
    return (
        <ThemeProvider>
            <AppShell />
        </ThemeProvider>
    );
}

export default App;