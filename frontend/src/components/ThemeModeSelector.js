import React from 'react';
import { themeOptions, useTheme } from '../theme/ThemeContext';

const ThemeModeSelector = ({ compact = false }) => {
    const { theme, setTheme } = useTheme();

    return (
        <div className={`theme-mode-selector${compact ? ' compact' : ''}`} role="radiogroup" aria-label="Appearance mode">
            {themeOptions.map((option) => {
                const isSelected = theme === option.value;

                return (
                    <button
                        key={option.value}
                        type="button"
                        className={`theme-mode-option${isSelected ? ' active' : ''}`}
                        aria-pressed={isSelected}
                        onClick={() => setTheme(option.value)}
                    >
                        <span>{option.label}</span>
                        {!compact && <small>{option.summary}</small>}
                    </button>
                );
            })}
        </div>
    );
};

export default ThemeModeSelector;