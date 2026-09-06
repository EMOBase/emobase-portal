import * as React from "react";
import { ChevronRight, Plus } from "lucide-react";

import AddJBrowseTrackButton from "./AddJBrowseTrackButton";
import FileCard from "./FileCard";
import {
  mockJBrowseTracks,
  mockMainFiles,
  mockSynonyms,
  mockVersion,
  type FileStatus,
} from "./mockData";

export default function VersionUpload({
  versionName,
  speciesName,
}: {
  versionName: string;
  speciesName: string;
}) {
  const [jbrowseTracks, setJBrowseTracks] =
    React.useState<FileStatus[]>(mockJBrowseTracks);
  const [synonyms, setSynonyms] = React.useState<FileStatus[]>(mockSynonyms);

  function handleAddTrack(
    file: File,
    trackName: string,
    category?: string,
    selectInDefaultSession?: boolean,
  ) {
    console.log("track file", file.name, {
      trackName,
      category,
      selectInDefaultSession,
    });
    setJBrowseTracks((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        name: trackName,
        category: "JBrowse2 Track",
        status: "READY",
        progress: 100,
        size: file.size ? (file.size / 1024 / 1024).toFixed(2) + " MB" : "",
        icon: "chart-line",
        theme: "blue",
      },
    ]);
  }

  function handleAddSynonym(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (selected) {
      setSynonyms((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          name: selected.name,
          category: "Synonyms",
          status: "READY",
          progress: 100,
          size:
            selected.size > 0
              ? (selected.size / 1024 / 1024).toFixed(2) + " MB"
              : "",
          icon: "arrows-left-right",
          theme: "blue",
        },
      ]);
    }
    e.target.value = "";
  }

  function handleDeleteJBrowseTrack(id?: string) {
    if (!id) return;
    setJBrowseTracks((prev) => prev.filter((t) => t.id !== id));
  }

  function handleDeleteSynonym(id?: string) {
    if (!id) return;
    setSynonyms((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-slate-400">
        <a href="/admin/versions" className="hover:text-slate-600">
          Genome Versions
        </a>
        <ChevronRight className="mx-0.5 size-3.5" />
        <a
          href={`/admin/versions/${versionName}`}
          className="hover:text-slate-600"
        >
          Version {mockVersion.name}
        </a>
        <ChevronRight className="mx-0.5 size-3.5" />
        <span className="font-semibold text-slate-800">{speciesName}</span>
      </nav>

      {/* Page title */}
      <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900">
        {speciesName}{" "}
        <span className="font-normal text-slate-400">{mockVersion.name}</span>
      </h1>

      {/* Main required files */}
      <div className="grid gap-4">
        {mockMainFiles.map((file) => (
          <FileCard key={file.name} file={file} showStatusBadge />
        ))}
      </div>

      <hr className="border-slate-200" />

      {/* JBrowse2 Track Files */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900">
              JBrowse2 Track Files
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Visualisation tracks for the JBrowse2 genome browser.
            </p>
          </div>
          <AddJBrowseTrackButton onConfirm={handleAddTrack} />
        </div>

        <div className="grid gap-4">
          {jbrowseTracks.length > 0 ? (
            jbrowseTracks.map((track) => (
              <FileCard
                key={track.id}
                file={track}
                canDelete
                onDelete={() => handleDeleteJBrowseTrack(track.id)}
              />
            ))
          ) : (
            <p className="py-8 text-center text-sm text-slate-400">
              No JBrowse2 track files uploaded yet.
            </p>
          )}
        </div>
      </div>

      <hr className="border-slate-200" />

      {/* Synonyms */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900">
              Synonyms
            </h2>
            <p className="mt-1 text-sm text-slate-500">Gene synonym files.</p>
          </div>
          <button
            type="button"
            className="relative inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            <Plus className="size-4" strokeWidth={2.5} />
            Add Synonym File
            <input
              type="file"
              accept=".gz,.bgz"
              className="absolute inset-0 cursor-pointer opacity-0"
              onChange={handleAddSynonym}
            />
          </button>
        </div>

        <div className="grid gap-4">
          {synonyms.length > 0 ? (
            synonyms.map((file) => (
              <FileCard
                key={file.id}
                file={file}
                canDelete
                onDelete={() => handleDeleteSynonym(file.id)}
              />
            ))
          ) : (
            <p className="py-8 text-center text-sm text-slate-400">
              No synonym files uploaded yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
