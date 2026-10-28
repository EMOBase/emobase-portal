import { useEffect, useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCookie, setCookie, VERSION_COOKIE_NAME } from "@/utils/cookie";
import genomicsService, {
  type PublicVersionItem,
} from "@/utils/services/genomics";

const getDefaultVersion = (versions: PublicVersionItem[]) =>
  versions.find((version) => version.isDefault)?.name ?? versions[0]?.name;

/**
 * The portal's saved preference selector. A URL `version` parameter is not
 * read here because it is a temporary viewing override, not a selection.
 */
export default function VersionSelector() {
  const [versions, setVersions] = useState<PublicVersionItem[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<string>();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { fetchPublicVersions } = genomicsService();
        const publicVersions = await fetchPublicVersions();
        if (cancelled) return;
        setVersions(publicVersions);

        const cookieVersion = getCookie(VERSION_COOKIE_NAME);
        const selected = publicVersions.some((v) => v.name === cookieVersion)
          ? (cookieVersion as string)
          : getDefaultVersion(publicVersions);
        setSelectedVersion(selected);
      } catch {
        if (!cancelled) setVersions([]);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectVersion = (version: string) => {
    setCookie(VERSION_COOKIE_NAME, version);
    // Choosing a version is explicit, so stop viewing any shared-link
    // override and render the current page with the newly selected version.
    const url = new URL(window.location.href);
    url.searchParams.delete("version");
    window.location.assign(`${url.pathname}${url.search}${url.hash}`);
  };

  if (versions.length === 0) return null;

  return (
    <Select
      value={selectedVersion}
      onValueChange={(version) => {
        if (version) selectVersion(version);
      }}
    >
      <SelectTrigger size="sm" className="min-w-32 bg-slate-50 text-xs">
        <SelectValue placeholder="Select version" />
      </SelectTrigger>
      <SelectContent align="start">
        {versions.map((version) => (
          <SelectItem key={version.id} value={version.name} className="text-xs">
            {version.name}
            {version.isDefault ? " (default)" : ""}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
