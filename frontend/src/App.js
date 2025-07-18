import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import './App.css';

function App() {
    return (
        <div className="app">
            <header className="app-header">
                <div className="app-logo">
                    <img src="/images/Media.jpg" alt="CollabDoc" className="app-logo-image" />
                </div>
                <nav className="app-nav">
                    <NavLink to="/documents" className={({ isActive }) => isActive ? 'active-nav-link' : 'nav-link'}>
                        Documents
                    </NavLink>
                    <NavLink to="/templates" className={({ isActive }) => isActive ? 'active-nav-link' : 'nav-link'}>
                        Templates
                    </NavLink>
                    <NavLink to="/editor-test" className={({ isActive }) => isActive ? 'active-nav-link' : 'nav-link'}>
                        Editor Test
                    </NavLink>
                </nav>
            </header>
            <main className="app-main">
                <Outlet />
            </main>
        </div>
    );
}

export default App;