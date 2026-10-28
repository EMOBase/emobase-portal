export const searchNavigation = {
  goToSearch(term: string) {
    const trimmed = term.trim();
    if (!trimmed) return;
    const url = new URL(
      `/search/${encodeURIComponent(trimmed)}`,
      window.location.origin,
    );
    const versionOverride = new URL(window.location.href).searchParams.get(
      "version",
    );
    if (versionOverride) url.searchParams.set("version", versionOverride);
    window.location.href = `${url.pathname}${url.search}`;
  },
};
