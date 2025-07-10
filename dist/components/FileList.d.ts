import type { UnfilledFile } from '../utils/fileManager.js';
export interface FileListProps {
    files: UnfilledFile[];
    onSelect: (file: UnfilledFile) => void;
    onExit: () => void;
}
export declare function FileList({ files, onSelect, onExit }: FileListProps): import("react/jsx-runtime").JSX.Element;
