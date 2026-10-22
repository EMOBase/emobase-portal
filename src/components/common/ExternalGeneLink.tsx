import { ExternalLink } from "lucide-react";

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
  const getHref = () => {
    if (assemblyInfoUrl) {
      try {
        const url = new URL(assemblyInfoUrl);
        url.pathname = `/details/${gene}`;
        return url.toString();
      } catch {
        return `${assemblyInfoUrl.replace(/\/$/, "")}/details/${gene}`;
      }
    }
    return "#";
  };

  return (
    <a
      href={getHref()}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-1 text-blue-700 hover:text-blue-800 font-medium hover:underline decoration-blue-700 decoration-2 underline-offset-2 cursor-pointer"
    >
      {gene}
      <ExternalLink className="size-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />
    </a>
  );
};

export default ExternalGeneLink;
