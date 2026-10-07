export const API_SERVICES = [
  "phenotypeservice",
  "imageservice",
  "ontologyservice",
  "goannotationservice",
  "publicationservice",
  "querypipelineservice",
  "geneservice",
  "genomicsservice",
] as const;

export type ApiService = (typeof API_SERVICES)[number];

export const API_SERVICE_ENVS: Record<ApiService, string> = {
  phenotypeservice: "PUBLIC_API_PHENOTYPE_SERVICE",
  imageservice: "PUBLIC_API_IMAGE_SERVICE",
  ontologyservice: "PUBLIC_API_ONTOLOGY_SERVICE",
  goannotationservice: "PUBLIC_API_GO_ANNOTATION_SERVICE",
  publicationservice: "PUBLIC_API_PUBLICATION_SERVICE",
  querypipelineservice: "PUBLIC_API_QUERY_PIPELINE_SERVICE",
  geneservice: "PUBLIC_API_GENE_SERVICE",
  genomicsservice: "PUBLIC_API_GENOMICS_SERVICE",
};
