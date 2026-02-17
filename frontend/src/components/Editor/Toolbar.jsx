import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { FORMAT_TEXT_COMMAND, TOGGLE_LINK_COMMAND, UNDO_COMMAND, REDO_COMMAND } from 'lexical';
import { useCallback } from 'react';
import { ArrowUturnLeftIcon, ArrowUturnRightIcon } from '@heroicons/react/24/outline'; // Assuming heroicons installed

export default function Toolbar() {
    const [editor] = useLexicalComposerContext();

    const onClick = (command, value) => {
        editor.dispatchCommand(command, value);
    };

    return (
        <div className="sticky top-0 z-20 flex items-center gap-1 p-2 bg-white/80 backdrop-blur-md border-b border-[#f1f1ef]">
            <button onClick={() => onClick(UNDO_COMMAND)} className="p-1.5 hover:bg-[#f1f1ef] rounded transition-colors text-[#787774]">
                <ArrowUturnLeftIcon className="w-4 h-4" />
            </button>
            <button onClick={() => onClick(REDO_COMMAND)} className="p-1.5 hover:bg-[#f1f1ef] rounded transition-colors text-[#787774]">
                <ArrowUturnRightIcon className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-[#f1f1ef] mx-1" />
            <button onClick={() => onClick(FORMAT_TEXT_COMMAND, 'bold')} className="w-8 h-8 flex items-center justify-center hover:bg-[#f1f1ef] rounded transition-colors font-bold text-[#37352f] text-sm">
                B
            </button>
            <button onClick={() => onClick(FORMAT_TEXT_COMMAND, 'italic')} className="w-8 h-8 flex items-center justify-center hover:bg-[#f1f1ef] rounded transition-colors italic text-[#37352f] text-sm font-serif">
                I
            </button>
            <button onClick={() => onClick(FORMAT_TEXT_COMMAND, 'underline')} className="w-8 h-8 flex items-center justify-center hover:bg-[#f1f1ef] rounded transition-colors underline text-[#37352f] text-sm">
                U
            </button>
        </div>
    );
}
