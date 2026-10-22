type ExternalGeneLinkProps = {
  gene: string;
  species?: string;
  assemblyInfoUrl?: string;
};

const ExternalGeneLink: React.FC<ExternalGeneLinkProps> = ({
  gene,
  species,
  assemblyInfoUrl,
}) => {
  // If we have infoUrl from assembly, link to that species site
  // Try to construct gene details URL pattern or use assembly site
  if (assemblyInfoUrl) {
    try {
      const url = new URL(assemblyInfoUrl);
      // Common patterns - try to link to gene details if possible
      // Otherwise just link to the species site
      url.pathname = `/details/${gene}`;
      return (
        <a
          href={url.toString()}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-700 hover:text-blue-800 font-medium hover:underline decoration-blue-700 decoration-2 underline-offset-2 cursor-pointer"
        >
          {gene}
        </a>
      );
    } catch {
      // fallback
    }
  }

  return (
    <a
      href={assemblyInfoUrl ? `${assemblyInfoUrl.replace(/\/$/, "")}/details/${gene}` : "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-700 hover:text-blue-800 font-medium hover:underline decoration-blue-700 decoration-2 underline-offset-2 cursor-pointer"
    >
      {gene}
    </a>
  );
};

export default ExternalGeneLink;
