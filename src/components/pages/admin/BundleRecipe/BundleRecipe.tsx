import * as React from "react";

type StepProps = {
  n: number;
  title: string;
  children: React.ReactNode;
};

// One numbered step of the bundle recipe. The number sits in the left gutter
// so the steps read as a sequence without a card per step - cards of uneven
// height only waste vertical space.
function Step({ n, title, children }: StepProps) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold text-white">
        {n}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        {children}
      </div>
    </li>
  );
}

export type BundleRecipeColumn = {
  /** The column header in manifest.csv, e.g. "fileName". */
  name: string;
  /** What goes into it, in one sentence. */
  hint: string;
};

/**
 * The recipe that tells the user how to assemble a bundle archive the system
 * accepts: flat files, a manifest at the root, one archive. The orthology
 * and the JBrowse2 track bundles differ only in their files and their
 * manifest columns, so the steps live here and each caller supplies its own.
 */
export function BundleRecipe({
  onDownloadTemplate,
  downloadingTemplate,
  folderName,
  itemLabel,
  fileTypesHint,
  columns,
}: {
  onDownloadTemplate: () => void;
  downloadingTemplate: boolean;
  /** The folder the files are collected in, e.g. "orthologies". */
  folderName: string;
  /** What one file is called, e.g. "orthology file". */
  itemLabel: string;
  /** Which file types the items may use. */
  fileTypesHint: string;
  /** The manifest columns, in the order the template lists them. */
  columns: BundleRecipeColumn[];
}) {
  return (
    <ol className="mt-6 space-y-3">
      <Step n={1} title="Get the manifest template">
        <button
          type="button"
          onClick={onDownloadTemplate}
          disabled={downloadingTemplate}
          className="mt-1 text-sm font-semibold text-blue-600 underline underline-offset-2 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {downloadingTemplate
            ? "Downloading…"
            : "Download manifest.csv template"}
        </button>
      </Step>

      <Step n={2} title="Collect the files in one folder">
        <p className="text-sm leading-relaxed text-slate-600">
          Put every {itemLabel} you want to upload into one folder (e.g.{" "}
          <code className="font-mono text-xs">{folderName}</code>), together
          with the downloaded manifest.csv.
        </p>
        <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-slate-500">
          <li>
            Every file must end up at the top level of the archive, no folders -
            manifest.csv included.
          </li>
          <li>{fileTypesHint}</li>
        </ul>
      </Step>

      <Step n={3} title="Fill in the manifest">
        <p className="text-sm leading-relaxed text-slate-600">
          One row per data file, with the columns{" "}
          {columns.map((column, index) => (
            <React.Fragment key={column.name}>
              {index > 0 ? ", " : ""}
              <code className="font-mono text-xs">{column.name}</code>
            </React.Fragment>
          ))}
          .
        </p>
        <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-slate-500">
          {columns.map((column) => (
            <li key={column.name}>
              <code className="font-mono text-xs">{column.name}</code> -{" "}
              {column.hint}
            </li>
          ))}
        </ul>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">
          Remember to list all the files in the folder in the manifest.csv. If
          one is not listed there, the system will return an error.
        </p>
      </Step>

      <Step n={4} title="Create the archive">
        <p className="text-sm leading-relaxed text-slate-600">
          Run the command in the folder that holds{" "}
          <code className="font-mono text-xs">{folderName}</code>, so the files
          land at the top level of the archive.
        </p>
        <div className="mt-1.5 grid gap-2 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold text-slate-700">
              macOS / Linux
            </p>
            <code className="mt-0.5 block break-words rounded bg-slate-50 px-2 py-1 font-mono text-xs text-slate-700">
              zip -j bundle.zip {folderName}/*
            </code>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-700">
              Windows (PowerShell)
            </p>
            <code className="mt-0.5 block break-words rounded bg-slate-50 px-2 py-1 font-mono text-xs text-slate-700">
              Compress-Archive -Path .\{folderName}\* -DestinationPath
              bundle.zip
            </code>
          </div>
        </div>
        <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-xs text-slate-500">
          <li>
            Compress the files inside the folder instead of the folder itself.
          </li>
        </ul>
      </Step>
    </ol>
  );
}
