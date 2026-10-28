import genomicsService from "@/utils/services/genomics";
import { createVersionResolver } from "@/utils/version";

/** Resolves the version displayed by this request, falling back to default. */
export const getCurrentVersionName = async (): Promise<string | undefined> => {
  const { fetchPublicVersions } = genomicsService();
  return createVersionResolver(fetchPublicVersions, { fallback: true })();
};
