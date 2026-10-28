import { useEffect, useState } from "react";

import { getCookie, VERSION_COOKIE_NAME } from "@/utils/cookie";
import genomicsService from "@/utils/services/genomics";

type NoticeState = {
  viewingVersion: string;
  selectedVersion: string;
} | null;

const fallbackVersion = (versions: { name: string; isDefault?: boolean }[]) =>
  versions.find((version) => version.isDefault)?.name ?? versions[0]?.name;

/** Shows when a shared-link override differs from the user's saved choice. */
export default function VersionOverrideNotice() {
  const [notice, setNotice] = useState<NoticeState>(null);

  useEffect(() => {
    if (window.location.pathname.startsWith("/admin")) return;

    const requestedVersion = new URL(window.location.href).searchParams.get(
      "version",
    );
    if (!requestedVersion) return;

    let cancelled = false;
    const load = async () => {
      try {
        const { fetchPublicVersions } = genomicsService();
        const versions = await fetchPublicVersions();
        if (cancelled || !versions.some((v) => v.name === requestedVersion))
          return;

        const defaultVersion = fallbackVersion(versions);
        if (!defaultVersion) return;
        const cookieVersion = getCookie(VERSION_COOKIE_NAME);
        const selectedVersion = versions.some((v) => v.name === cookieVersion)
          ? (cookieVersion as string)
          : defaultVersion;

        if (requestedVersion !== selectedVersion) {
          setNotice({ viewingVersion: requestedVersion, selectedVersion });
        }
      } catch {
        // Do not display an unvalidated notice when the versions request fails.
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!notice) return null;

  const navigateWithoutOverride = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("version");
    window.location.assign(`${url.pathname}${url.search}${url.hash}`);
  };

  return (
    <section
      className="mx-auto mt-6 w-full max-w-7xl px-4"
      aria-label="Version viewing override"
    >
      <div className="flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 sm:flex-row sm:items-center sm:justify-between">
        <p>
          You are viewing version <strong>{notice.viewingVersion}</strong> from
          a shared link. Your selected version is{" "}
          <strong>{notice.selectedVersion}</strong>.
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={navigateWithoutOverride}
            className="rounded px-2.5 py-1.5 font-medium text-amber-900 hover:bg-amber-100"
          >
            Return to {notice.selectedVersion}
          </button>
        </div>
      </div>
    </section>
  );
}
