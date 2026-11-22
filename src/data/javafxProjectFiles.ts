import JSZip from 'jszip';
import { JAVAFX_CORE_FILES, JavaFxProjectFile } from './javafxCoreFiles';
import { JAVAFX_UI_FILES } from './javafxUiFiles';

export type { JavaFxProjectFile };

export const ALL_JAVAFX_FILES: JavaFxProjectFile[] = [
  ...JAVAFX_CORE_FILES,
  ...JAVAFX_UI_FILES,
];

export async function downloadJavaFxProjectZip(): Promise<void> {
  const zip = new JSZip();
  const rootFolder = zip.folder('smart-expense-tracker-jdk25');
  if (!rootFolder) return;

  for (const file of ALL_JAVAFX_FILES) {
    rootFolder.file(file.path, file.content);
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'smart-expense-tracker-javafx-jdk25.zip';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
