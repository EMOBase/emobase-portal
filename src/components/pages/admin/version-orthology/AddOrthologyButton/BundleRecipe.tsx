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

type BundleRecipeProps = {
  onDownloadTemplate: () => void;
  downloadingTemplate: boolean;
};

// The recipe that tells the user how to assemble a bundle archive the backend
// accepts: flat files, a manifest at the root, one archive.
export function BundleRecipe({
  onDownloadTemplate,
  downloadingTemplate,
}: BundleRecipeProps) {
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
          Put every orthology file you want to upload into one folder (e.g.{" "}
          <code className="font-mono text-xs">orthologies</code>), together with
          the downloaded manifest.csv.
        </p>
        <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-slate-500">
          <li>
            Every file must end up at the top level of the archive, no folders -
            manifest.csv included.
          </li>
          <li>Data files may be plain or already gzipped.</li>
        </ul>
      </Step>

      <Step n={3} title="Fill in the manifest">
        <p className="text-sm leading-relaxed text-slate-600">
          One row per data file, with the columns{" "}
          <code className="font-mono text-xs">fileName</code>,{" "}
          <code className="font-mono text-xs">order</code>,{" "}
          <code className="font-mono text-xs">algorithm</code>.
        </p>
        <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-slate-500">
          <li>
            <code className="font-mono text-xs">fileName</code> - the name of
            the file inside the archive, spelled exactly like it.
          </li>
          <li>
            <code className="font-mono text-xs">order</code> - the display order
            of the dataset, an integer (1, 2, 3...).
          </li>
          <li>
            <code className="font-mono text-xs">algorithm</code> - the tool that
            produced the mapping, e.g. OrthoFinder 2.0.
          </li>
        </ul>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">
          Remember to list all the files in the folder in the manifest.csv. If
          one is not listed there, the system will return an error.
        </p>
      </Step>

      <Step n={4} title="Create the archive">
        <p className="text-sm leading-relaxed text-slate-600">
          Run the command in the folder that holds{" "}
          <code className="font-mono text-xs">orthologies</code>, so the files
          land at the top level of the archive.
        </p>
        <div className="mt-1.5 grid gap-2 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold text-slate-700">
              macOS / Linux
            </p>
            <code className="mt-0.5 block break-words rounded bg-slate-50 px-2 py-1 font-mono text-xs text-slate-700">
              zip -j bundle.zip orthologies/*
            </code>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-700">
              Windows (PowerShell)
            </p>
            <code className="mt-0.5 block break-words rounded bg-slate-50 px-2 py-1 font-mono text-xs text-slate-700">
              Compress-Archive -Path .\orthologies\* -DestinationPath bundle.zip
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
