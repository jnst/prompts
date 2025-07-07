import type { PromptInfo } from '../utils/promptManager.js';
interface PromptListProps {
    prompts: PromptInfo[];
    onSelect: (prompt: PromptInfo) => void;
    onExit: () => void;
}
export declare function PromptList({ prompts, onSelect, onExit }: PromptListProps): import("react/jsx-runtime").JSX.Element;
export {};
