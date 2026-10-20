import { apiFetch } from "@/utils/apiFetch";
import { createVersionResolver } from "@/utils/version";

export type VersionItem = {
  id: string;
  name: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  isDefault: boolean;
  status: "DRAFT" | "PROCESSING" | "ERROR" | "READY" | "MISSING_REQUIRED_FILE";
  totalFileSize: number;
};

type FetchVersionsResponse = {
  data: {
    page: number;
    pageSize: number;
    total: number;
    versions: VersionItem[];
  };
  requestId: string;
};

export type PublicVersionItem = {
  id: number;
  name: string;
  isDefault: boolean;
  status: "DRAFT" | "PROCESSING" | "ERROR" | "READY" | "MISSING_REQUIRED_FILE";
  createdAt: string;
};

type FetchPublicVersionsResponse = {
  data: PublicVersionItem[];

  requestId: string;
};

type CreateVersionInput = {
  name: string;
};

type CreateVersionResponse = {
  data: {
    id: string;
    name: string;
    createdAt: string;
    createdBy: string;
  };
  requestId: string;
};

export type AssemblyVersion = {
  id: number;
  versionId: number;
  name: string;
  species: string;
  imagePath?: string | null;
  infoUrl?: string | null;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
};

type CreateAssemblyVersionInput = {
  name: string;
  species: string;
  infoUrl?: string;
};

type UpdateAssemblyVersionInput = {
  name?: string;
  infoUrl?: string;
};

type CreateAssemblyVersionResponse = {
  data: AssemblyVersion;
  requestId: string;
};

type JobItem = {
  id: string;
  versionId: string;
  type:
    | "GENOMIC.FNA"
    | "GENOMIC.GFF"
    | "RNA.FNA"
    | "CDS.FNA"
    | "PROTEIN.FAA"
    | "ORTHOLOGY.TSV"
    | "SYNONYM";
  status: "PENDING" | "RUNNING" | "DONE" | "FAILED";
  error?: string;
};

type FetchJobResponse = {
  data: JobItem[];
  requestId: string;
};

export type FileJobSummary = {
  id: number;
  type: JobItem["type"] | string;
  description: string;
  status: "PENDING" | "RUNNING" | "DONE" | "FAILED";
  payload: any;
  error?: string | null;
};

export type FileDetail = {
  id: string;
  filePath: string;
  fileSize: number;
  uploadStatus: "UPLOADING" | "COMPLETED" | "FAILED";
  createdAt: string;
  createdBy: string;
  completedAt?: string | null;
  jobs: FileJobSummary[];
};

export type VersionDetailFiles = {
  "genomic.fna"?: FileDetail | null;
  "genomic.gff"?: FileDetail | null;
  "rna.fna"?: FileDetail | null;
  "cds.fna"?: FileDetail | null;
  "protein.faa"?: FileDetail | null;
  "dsrna.csv"?: FileDetail | null;
  "jbrowse.track"?: FileDetail[];
  "orthology.tsv"?: FileDetail[];
  "species.synonym"?: FileDetail[];
};

export type AssemblyVersionDetail = AssemblyVersion & {
  status: "DRAFT" | "PROCESSING" | "READY" | "ERROR" | "MISSING_REQUIRED_FILE";
  files: VersionDetailFiles;
};

type FetchVersionDetailResponse = {
  data: {
    id: number;
    name: string;
    isDefault: boolean;
    status:
      "DRAFT" | "PROCESSING" | "READY" | "ERROR" | "MISSING_REQUIRED_FILE";
    createdAt: string;
    createdBy: string;
    updatedAt: string;
    updatedBy: string;
    totalFileSize: number;
    orthologyTSV: FileDetail[];
    orthologyBundles: FileDetail[];
    assemblies: AssemblyVersionDetail[];
  };
  requestId: string;
};

type FetchAssemblyVersionDetailResponse = {
  data: AssemblyVersionDetail;
  requestId: string;
};

export type GeneSequence = {
  id: string;
  seq: string;
};

export type GeneDetail = {
  id: string;
  symbol?: string;
  fullname?: string;
  annotationId?: string;
  seqname?: string;
  start?: number;
  end?: number;
  strand?: string;
  mRNAs?: GeneSequence[];
  CDS?: GeneSequence[];
  proteins?: GeneSequence[];
};

export type GeneSearchResult = {
  genes?: string[];
  orthologies?: {
    source: string;
    group: string;
    orthologs: {
      species: string;
      genes: {
        gene: string;
        synonyms: string[];
      }[];
    }[];
  }[];
  otherGenes?: {
    species: string;
    gene: string;
  }[];
};

export type OrthologItem = {
  gene: string;
  source: string;
};

export type GeneOrthology = {
  gene: string;
  orthologs: OrthologItem[];
};

export type SilencingSeq = {
  id: string;
  geneIds: string[];
  seq: string;
  leftPrimer: string;
  rightPrimer: string;
};

const genomicsService = (fetch: typeof apiFetch = apiFetch) => {
  const fetchPublicVersions = async () => {
    const res = await fetch<FetchPublicVersionsResponse>(
      "genomicsservice",
      "/public/versions",
      {
        query: { status: "READY" },
      },
    );
    return res.data;
  };

  const resolveVersion = createVersionResolver(fetchPublicVersions);

  const fetchVersions = async (opts?: { page: number; pageSize: number }) => {
    const { page = 1, pageSize = 10 } = opts ?? {};
    const url = `/versions?page=${page}&page_size=${pageSize}`;

    return await fetch<FetchVersionsResponse>("genomicsservice", url);
  };

  const createVersion = async (versionInput: CreateVersionInput) => {
    return await fetch<CreateVersionResponse>("genomicsservice", "/versions", {
      method: "POST",
      body: {
        ...versionInput,
      },
    });
  };

  const createAssemblyVersion = async (
    version: string,
    assemblyInput: CreateAssemblyVersionInput,
  ) => {
    return await fetch<CreateAssemblyVersionResponse>(
      "genomicsservice",
      `/versions/${version}/assemblies`,
      {
        method: "POST",
        body: {
          ...assemblyInput,
        },
      },
    );
  };

  const updateAssemblyVersion = async (
    version: string,
    id: string | number,
    assemblyInput: UpdateAssemblyVersionInput,
  ) => {
    return await fetch<CreateAssemblyVersionResponse>(
      "genomicsservice",
      `/versions/${version}/assemblies/${id}`,
      {
        method: "PATCH",
        body: {
          ...assemblyInput,
        },
      },
    );
  };

  const setAssemblyVersionImage = async (
    version: string,
    id: string | number,
    file: File,
  ) => {
    const formData = new FormData();
    formData.append("image", file);
    return await fetch<CreateAssemblyVersionResponse>(
      "genomicsservice",
      `/versions/${version}/assemblies/${id}/image`,
      {
        method: "PUT",
        body: formData,
      },
    );
  };

  const deleteAssemblyVersionImage = async (
    version: string,
    id: string | number,
  ) => {
    return await fetch<undefined>(
      "genomicsservice",
      `/versions/${version}/assemblies/${id}/image`,
      {
        method: "DELETE",
      },
    );
  };

  const fetchJobs = async (version: string) => {
    return await fetch<FetchJobResponse>("genomicsservice", "/jobs", {
      query: {
        version,
      },
    });
  };

  const fetchVersionDetail = async (version: string) => {
    return await fetch<FetchVersionDetailResponse>(
      "genomicsservice",
      `/versions/${version}/detail`,
      {
        query: {
          name: version,
        },
      },
    );
  };

  const deleteUploadFile = async (id: string) => {
    return await fetch<{ data: FileJobSummary; requestId: string }>(
      "genomicsservice",
      `/upload-files/${id}`,
      {
        method: "DELETE",
      },
    );
  };

  const deleteVersion = async (version: string) => {
    return await fetch<undefined>("genomicsservice", `/versions/${version}`, {
      method: "DELETE",
    });
  };

  const deleteAssemblyVersion = async (
    version: string,
    id: string | number,
  ) => {
    return await fetch<undefined>(
      "genomicsservice",
      `/versions/${version}/assemblies/${id}`,
      {
        method: "DELETE",
      },
    );
  };

  const fetchAssemblyVersionDetail = async (
    version: string,
    id: string | number,
  ) => {
    return await fetch<FetchAssemblyVersionDetailResponse>(
      "genomicsservice",
      `/versions/${version}/assemblies/${id}`,
    );
  };

  const releaseVersion = async (version: string) => {
    return await fetch<{ data: any; requestId: string }>(
      "genomicsservice",
      `/versions/${version}/release`,
      {
        method: "POST",
      },
    );
  };

  const search = async (query: string) => {
    const version = await resolveVersion();
    let url = `/search?query=${encodeURIComponent(query)}`;
    if (version) url += `&version=${encodeURIComponent(version)}`;
    const res = await fetch<{
      data: GeneSearchResult;
      requestId: string;
    }>("genomicsservice", url);
    return res.data;
  };

  const suggest = async (query: string) => {
    const version = await resolveVersion();
    let url = `/search/_suggest?query=${encodeURIComponent(query)}`;
    if (version) url += `&version=${encodeURIComponent(version)}`;
    const res = await fetch<{
      data: string[];
      requestId: string;
    }>("genomicsservice", url);
    return res.data;
  };

  const fetchGenes = async (species: string, ids: string[]) => {
    if (ids.length === 0) return [];
    const version = await resolveVersion();
    let url = `/genes/${species}?ids=${ids.join(",")}`;
    if (version) url += `&version=${encodeURIComponent(version)}`;
    const res = await fetch<{
      data: GeneDetail[];
      requestId: string;
    }>("genomicsservice", url);
    return res.data;
  };

  const fetchIBs = async (gene: string) => {
    const version = await resolveVersion();
    let url = `/silencingseqs?geneIds=${gene}`;
    if (version) url += `&version=${encodeURIComponent(version)}`;
    const res = await fetch<{
      data: SilencingSeq[];
      requestId: string;
    }>("genomicsservice", url);
    return res.data || [];
  };

  const fetchOrthology = async (gene: string) => {
    const version = await resolveVersion();
    let url = `/orthology/Tcas?genes=${gene}`;
    if (version) url += `&version=${encodeURIComponent(version)}`;
    const res = await fetch<{
      data: GeneOrthology[];
      requestId: string;
    }>("genomicsservice", url);
    return res.data[0] || { gene, orthologs: [] };
  };

  return {
    fetchPublicVersions,
    fetchVersions,
    createVersion,
    createAssemblyVersion,
    updateAssemblyVersion,
    setAssemblyVersionImage,
    deleteAssemblyVersionImage,
    fetchJobs,
    fetchVersionDetail,
    deleteUploadFile,
    deleteVersion,
    deleteAssemblyVersion,
    fetchAssemblyVersionDetail,
    releaseVersion,
    fetchGenes,
    fetchIBs,
    fetchOrthology,
    search,
    suggest,
  };
};

export default genomicsService;
