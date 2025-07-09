export interface ActionInfo {
    id: string;
    name: string;
    description: string;
}
interface ActionListProps {
    actions: ActionInfo[];
    onSelect: (action: ActionInfo) => void;
    onExit: () => void;
}
export declare function ActionList({ actions, onSelect, onExit }: ActionListProps): import("react/jsx-runtime").JSX.Element;
export {};
