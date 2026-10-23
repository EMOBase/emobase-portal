export const searchNavigation = {
  goToSearch(term: string) {
    const trimmed = term.trim();
    if (!trimmed) return;
    window.location.href = `/search/${encodeURIComponent(trimmed)}`;
  },
};
