import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const THEME_STORAGE_KEY = 'collabdoc.theme';

export const themeOptions = [
    { value: 'light', label: 'Light', summary: 'Bright workspace' },
    { value: 'dark', label: 'Dark', summary: 'Low-light workspace' }
];

const ThemeContext = createContext({
    theme: 'light',
    setTheme: () => {}
});

const normalizeTheme = (theme) => theme === 'dark' ? 'dark' : 'light';

const getInitialTheme = () => {
    if (typeof window === 'undefined') {
        return 'light';
    }

    return normalizeTheme(window.localStorage.getItem(THEME_STORAGE_KEY));
};

export function ThemeProvider({ children }) {
    const [theme, setThemeState] = useState(getInitialTheme);

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    }, [theme]);

    const value = useMemo(() => ({
        theme,
        setTheme: (nextTheme) => setThemeState(normalizeTheme(nextTheme))
    }), [theme]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}