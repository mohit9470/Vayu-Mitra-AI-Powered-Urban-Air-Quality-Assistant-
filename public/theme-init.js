(function () {
  try {
    var saved = localStorage.getItem('vayumitra_theme');
    var isDark =
      saved === 'dark' ||
      (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', isDark);
  } catch (e) {
    // Ignore storage restrictions
  }
})();
