import { useMemo } from "react";

import { apiFetch } from "@/utils/apiFetch";
import useApiFetch from "@/hooks/useApiFetch";

const useService = <T>(service: (fetch?: typeof apiFetch) => T) => {
  const apiFetch = useApiFetch();

  return useMemo(() => service(apiFetch), [apiFetch]);
};

export default useService;
