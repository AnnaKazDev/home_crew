// Apply theme immediately to prevent flash of wrong theme
const savedTheme = localStorage.getItem('theme');
const theme = savedTheme || 'dark'; // Default to dark
if (theme === 'dark') {
  document.documentElement.classList.add('dark');
}
