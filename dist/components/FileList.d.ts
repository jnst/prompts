import type { OutputFile, UnfilledFile } from '../utils/fileManager.js';
type FileType = UnfilledFile | OutputFile;
export interface FileListProps {
    files: FileType[];
    onSelect: (file: FileType) => void;
    onExit: () => void;
}
export declare function FileList({ files, onSelect, onExit }: FileListProps): import("react/jsx-runtime").JSX.Element;
export {};
