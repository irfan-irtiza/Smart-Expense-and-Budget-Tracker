import React, { useMemo, useState } from 'react';
import { Check, Copy, Download, FileCode2, FolderOpen, Terminal } from 'lucide-react';
import {
  ALL_JAVAFX_FILES,
  downloadJavaFxProjectZip,
  JavaFxProjectFile,
} from '../data/javafxProjectFiles';

interface JavaFxCodeExplorerViewProps {
  selectedFilePath: string;
  onSelectFilePath: (path: string) => void;
}

const LAYER_ORDER: JavaFxProjectFile['layer'][] = [
  'Build & Module',
  'Model',
  'Repository',
  'Service',
  'UI & Controller',
  'Resources',
  'Tests',
];

export const JavaFxCodeExplorerView: React.FC<JavaFxCodeExplorerViewProps> = ({
  selectedFilePath,
  onSelectFilePath,
}) => {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const activeFile = useMemo(
    () => ALL_JAVAFX_FILES.find((f) => f.path === selectedFilePath) ?? ALL_JAVAFX_FILES[0],
    [selectedFilePath]
  );

  const groupedFiles = useMemo(() => {
    const groups = new Map<JavaFxProjectFile['layer'], JavaFxProjectFile[]>();
    for (const layer of LAYER_ORDER) {
      groups.set(
        layer,
        ALL_JAVAFX_FILES.filter((f) => f.layer === layer)
      );
    }
    return groups;
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard fallback ignored
    }
  };

  const handleDownloadZip = async () => {
    setDownloading(true);
    try {
      await downloadJavaFxProjectZip();
    } finally {
      setDownloading(false);
    }
  };

  const codeLines = activeFile.content.split('\n');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            JavaFX JDK 25 Source Code
          </h1>
          <p className="text-sm text-slate-600 dark:text-neutral-400 mt-1">
            Complete Maven project (<span className="font-mono tabular-nums">{ALL_JAVAFX_FILES.length}</span> files) using JDK 25, JavaFX 25, sealed domain classes, records, and JUnit 5 tests.
          </p>
        </div>

        <button
          type="button"
          disabled={downloading}
          onClick={handleDownloadZip}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-teal-700 hover:bg-teal-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black transition-colors whitespace-nowrap shrink-0 disabled:opacity-60"
        >
          <Download className="w-4 h-4" />
          {downloading ? 'Packaging ZIP...' : 'Download Maven Project (.zip)'}
        </button>
      </div>

      {/* Quick Run Instructions Strip */}
      <div className="rounded-xl bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 px-5 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-neutral-300">
          <Terminal className="w-4 h-4 text-teal-700 dark:text-white shrink-0" />
          <span>Extract ZIP, open in IntelliJ IDEA (SDK: JDK 25), or run via Maven:</span>
        </div>
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-slate-800 dark:text-white">
          <code className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-neutral-900 dark:border dark:border-neutral-800">
            mvn clean javafx:run
          </code>
          <code className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-neutral-900 dark:border dark:border-neutral-800">
            mvn test
          </code>
        </div>
      </div>

      {/* Split Explorer & Code Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Package / Layer Tree */}
        <aside className="lg:col-span-4 xl:col-span-3 rounded-xl bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 p-3 max-h-[680px] overflow-y-auto">
          <div className="space-y-4">
            {LAYER_ORDER.map((layer) => {
              const files = groupedFiles.get(layer) ?? [];
              if (files.length === 0) return null;
              return (
                <div key={layer}>
                  <div className="px-2 pb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-neutral-500">
                    <FolderOpen className="w-3.5 h-3.5 shrink-0" />
                    <span>{layer}</span>
                  </div>
                  <div className="space-y-0.5">
                    {files.map((file) => {
                      const active = file.path === activeFile.path;
                      return (
                        <button
                          key={file.path}
                          type="button"
                          onClick={() => onSelectFilePath(file.path)}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center gap-2 transition-colors ${
                            active
                              ? 'bg-teal-50 dark:bg-white text-teal-800 dark:text-black font-medium'
                              : 'text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-900 dark:hover:text-white'
                          }`}
                        >
                          <FileCode2 className="w-3.5 h-3.5 shrink-0 opacity-70" />
                          <span className="truncate">{file.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Source Code Pane */}
        <div className="lg:col-span-8 xl:col-span-9 rounded-xl bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-mono text-slate-900 dark:text-white font-semibold truncate">
                {activeFile.path}
              </p>
              <p className="text-xs text-slate-600 dark:text-neutral-400 mt-0.5">
                {activeFile.oopHighlight}
              </p>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-neutral-700 text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-neutral-900 transition-colors whitespace-nowrap shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-white" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy File'}
            </button>
          </div>

          <div className="bg-slate-950 dark:bg-black text-slate-100 dark:text-neutral-100 overflow-x-auto max-h-[600px] overflow-y-auto p-4 font-mono text-xs leading-relaxed">
            <table className="w-full border-collapse">
              <tbody>
                {codeLines.map((line, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/70 dark:hover:bg-neutral-900/70">
                    <td className="select-none pr-4 text-right text-slate-500 dark:text-neutral-600 tabular-nums align-top w-10">
                      {idx + 1}
                    </td>
                    <td className="whitespace-pre text-slate-200 dark:text-neutral-200">{line || ' '}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
