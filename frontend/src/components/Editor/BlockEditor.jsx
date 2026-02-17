import { useEffect } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { CodeNode } from "@lexical/code";
import { TRANSFORMERS } from "@lexical/markdown";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { LinkNode, AutoLinkNode } from "@lexical/link";
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";
import { $createParagraphNode, $createTextNode, $getRoot } from "lexical";

import Toolbar from './Toolbar';
import usePostStore from '../../store/postStore';

const theme = {
    paragraph: 'mb-4',
    heading: {
        h1: 'editor-heading-h1',
        h2: 'editor-heading-h2',
        h3: 'text-xl font-bold mt-4 mb-2',
    },
    list: {
        ul: 'editor-list-ul',
        ol: 'editor-list-ol',
        listitem: 'mb-1',
    },
    text: {
        bold: 'editor-text-bold',
        italic: 'editor-text-italic',
        underline: 'editor-text-underline',
    },
    quote: 'editor-quote',
    code: 'editor-code',
};

// Plugin to load initial content
function LoadContentPlugin() {
    const [editor] = useLexicalComposerContext();
    const { currentPost } = usePostStore();

    useEffect(() => {
        if (currentPost && currentPost.content && JSON.stringify(currentPost['content']) !== '{}') {
            try {
                const editorState = editor.parseEditorState(currentPost.content);
                editor.setEditorState(editorState);
            } catch (e) {
                console.error("Failed to parse editor state", e);
            }
        }
    }, [editor, currentPost?.id]); // Added currentPost.id to dependencies

    return null;
}

function AIInsertPlugin() {
    const [editor] = useLexicalComposerContext();
    const { aiToInsert, setAiToInsert } = usePostStore();

    useEffect(() => {
        if (aiToInsert) {
            editor.update(() => {
                const root = $getRoot();
                const paragraph = $createParagraphNode();
                const text = $createTextNode(aiToInsert);
                paragraph.append(text);
                root.append(paragraph);
                paragraph.select(); // Selects the newly inserted paragraph
            });
            setAiToInsert(null); // Clear the buffer
        }
    }, [aiToInsert, editor, setAiToInsert, $createParagraphNode, $createTextNode, $getRoot]);

    return null;
}

export default function BlockEditor() {
    const { currentPost, updateCurrentPost, updateCurrentPostContent } = usePostStore();

    if (!currentPost) return (
        <div className="flex-grow flex flex-col items-center justify-center text-[#a0a09e]">
            <div className="max-w-md text-center p-8">
                <h2 className="text-xl font-semibold text-[#37352f] mb-2">Welcome to your workspace</h2>
                <p className="text-sm">Select a post from the sidebar to start writing, or create a new one to capture your thoughts.</p>
            </div>
        </div>
    );

    const initialConfig = {
        namespace: 'MyEditor',
        theme,
        onError(error) {
            console.error(error);
        },
        nodes: [
            HeadingNode, QuoteNode, ListNode, ListItemNode, CodeNode,
            LinkNode, AutoLinkNode, HorizontalRuleNode
        ]
    };

    return (
        <div className="flex-grow flex flex-col items-center bg-white px-4 md:px-0">
            <div className="w-full max-w-3xl pt-16 pb-32">
                {/* Post Title */}
                <input
                    type="text"
                    placeholder="Untitled"
                    value={currentPost.title}
                    onChange={(e) => updateCurrentPost({ title: e.target.value })}
                    className="w-full text-5xl font-bold text-[#37352f] placeholder-[#dfdfde] outline-none border-none mb-8 bg-transparent"
                />

                <LexicalComposer initialConfig={initialConfig} key={currentPost.id}>
                    <div className="relative">
                        <Toolbar />
                        <div className="relative mt-8">
                            <RichTextPlugin
                                contentEditable={<ContentEditable className="editor-input" />}
                                placeholder={<div className="editor-placeholder">Press '/' for commands...</div>}
                                ErrorBoundary={LexicalErrorBoundary}
                            />
                            <HistoryPlugin />
                            <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
                            <OnChangePlugin onChange={(editorState) => {
                                const json = editorState.toJSON();
                                updateCurrentPostContent(json);
                            }} />
                            <LoadContentPlugin />
                            <AIInsertPlugin />
                        </div>
                    </div>
                </LexicalComposer>
            </div>
        </div>
    );
}
