(function () {
    const storageKey = 'ikbw_theme';
    const root = document.documentElement;

    function getStoredTheme() {
        try {
            const t = localStorage.getItem(storageKey);
            return (t === 'dark' || t === 'light') ? t : 'light';
        } catch (e) {
            return 'light';
        }
    }

    function applyTheme(theme) {
        root.setAttribute('data-theme', theme);
    }

    function setTheme(theme) {
        try {
            localStorage.setItem(storageKey, theme);
        } catch (e) {}
        applyTheme(theme);
    }

    function toggleTheme() {
        const current = getStoredTheme();
        const next = current === 'light' ? 'dark' : 'light';
        setTheme(next);
    }

    // expose for other scripts
    window.getStoredTheme = getStoredTheme;
    window.toggleTheme = toggleTheme;

    // On load, ensure the stored theme is applied
    document.addEventListener('DOMContentLoaded', () => {
        applyTheme(getStoredTheme());
    });
})();