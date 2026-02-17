import { useEffect, useState } from 'react';
import usePostStore from '../store/postStore';
import { createPost, getPosts, deletePost } from '../services/api';
import useAutoSave from '../hooks/useAutoSave';
import BlockEditor from '../components/Editor/BlockEditor';
import AIModal from '../components/AIModal';
import { PlusIcon, CloudIcon, SparklesIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function EditorPage() {
    const { posts, setPosts, addPost, removePost, setCurrentPost, currentPost, saveStatus, updateCurrentPostContent, setAiToInsert } = usePostStore();
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);

    // Fetch initial posts
    useEffect(() => {
        const loadPosts = async () => {
            try {
                const data = await getPosts();
                // Handle both potential response structures
                const postsData = data.data && Array.isArray(data.data.data) ? data.data.data : (Array.isArray(data) ? data : []);
                setPosts(postsData);
            } catch (e) {
                console.error("Failed to fetch posts", e);
                setPosts([]);
            }
        };
        loadPosts();
    }, [setPosts]);

    // Initialize AutoSave
    useAutoSave();

    const handleNewPost = async () => {
        const title = prompt("Enter the name for your new page:", "Untitled Page");
        if (title === null) return; // User cancelled

        try {
            const finalTitle = title.trim() || "Untitled Page";
            const res = await createPost({ title: finalTitle, content: {}, status: "draft" });
            // API returns { data: [newPost], ... } so res.data is the array [newPost]
            const newPost = (res.data && res.data[0]) ? res.data[0] : res;
            if (newPost) {
                addPost(newPost);
                setCurrentPost(newPost);
            }
        } catch (e) {
            console.error("Failed to create post", e);
        }
    };

    const handleDeletePost = async (e, id) => {
        e.stopPropagation();
        if (confirm("Delete this draft permanently?")) {
            try {
                await deletePost(id);
                removePost(id);
            } catch (e) {
                console.error("Failed to delete post", e);
            }
        }
    };

    const handleInsertAI = (text) => {
        if (!currentPost) return;
        setAiToInsert(text);
        // Modal stays open or closes based on user preference? 
        // User asked: "if i click insert to my work sapce it will paste as it is in main page"
        // Usually insert implies done, so let's close it too if we want, or just let them insert multiple times.
        // The modal component calls onClose() in the onInsert wrapper, so we don't need to do it here.
    };

    return (
        <div className="flex h-screen overflow-hidden text-[#37352f] bg-[#f7f6f3]">
            {/* Sidebar */}
            <div className="w-64 bg-[#fbfbfa] border-r border-[#ececeb] flex flex-col flex-shrink-0 animate-in slide-in-from-left duration-500">
                <div className="p-4 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-[#37352f] rounded flex items-center justify-center text-white text-[10px] font-bold">S</div>
                        <h1 className="text-xs font-bold text-[#37352f] opacity-80 uppercase tracking-widest">Workspace</h1>
                    </div>
                </div>

                <div className="px-3 mb-6">
                    <button
                        onClick={handleNewPost}
                        className="w-full flex items-center gap-2 text-sm font-medium text-[#787774] px-3 py-2 rounded-lg hover:bg-[#efefee] transition-all group"
                    >
                        <div className="p-0.5 rounded bg-white border border-[#ececeb] shadow-sm group-hover:scale-110 transition-transform">
                            <PlusIcon className="w-3.5 h-3.5 text-[#37352f]" />
                        </div>
                        New Page
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto sidebar-scroll px-3">
                    <div className="text-[10px] font-bold text-[#91918e] uppercase px-3 mb-2 tracking-widest opacity-60">Private Drafts</div>
                    <div className="space-y-[1px]">
                        {posts.map((post, idx) => (
                            <div
                                key={post.id || idx}
                                onClick={() => setCurrentPost(post)}
                                className={`group sidebar-item px-3 py-2 rounded-lg cursor-pointer text-sm truncate transition-all ${currentPost?.id === post.id ? 'bg-[#ebebeb] text-[#37352f] font-medium' : 'hover:bg-[#efefee] text-[#787774]'}`}
                            >
                                <span className="truncate flex-grow">{post.title || "Untitled"}</span>
                                <button
                                    onClick={(e) => handleDeletePost(e, post.id)}
                                    className="delete-btn p-1 text-[#a0a09e] hover:text-[#ef4444] rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <TrashIcon className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                    {posts.length === 0 && <div className="text-sm text-[#a0a09e] px-4 py-4 italic font-light opacity-50">No drafts found.</div>}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-grow flex flex-col h-full overflow-hidden relative">
                {/* Top Glass Bar */}
                <div className="h-14 flex items-center justify-between px-8 flex-shrink-0 z-30 transition-all bg-white/50 backdrop-blur-md border-b border-[#ececeb]/50">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1 bg-white border border-[#ececeb] rounded-full shadow-sm text-[12px] font-medium text-[#a0a09e]">
                            {saveStatus === 'saving' && <span className="flex items-center gap-1.5 animate-pulse text-blue-500"><CloudIcon className="w-3.5 h-3.5" /> Syncing...</span>}
                            {saveStatus === 'saved' && <span className="flex items-center gap-1.5 text-[#00a35c]"><CloudIcon className="w-3.5 h-3.5" /> Saved</span>}
                            {saveStatus === 'unsaved' && <span className="text-amber-600 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Unsaved changes</span>}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="text-[12px] text-[#787774] hover:text-[#37352f] px-4 py-1.5 rounded-full hover:bg-white hover:shadow-sm transition-all font-semibold">Publish</button>
                        <button onClick={() => setIsAIModalOpen(true)} className="text-[12px] text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 px-5 py-1.5 rounded-full font-bold flex items-center gap-2 transition-all shadow-md active:scale-95">
                            <SparklesIcon className="w-4 h-4" /> AI Enhance
                        </button>
                    </div>
                </div>

                {/* Centered Canvas Layout */}
                <div className="flex-grow overflow-y-auto scroll-smooth custom-scroll">
                    <div className="writing-canvas animate-in fade-in zoom-in duration-700">
                        <BlockEditor />
                    </div>
                    <div className="h-32" />
                </div>
            </div>

            <AIModal
                isOpen={isAIModalOpen}
                onClose={() => setIsAIModalOpen(false)}
                onInsert={handleInsertAI}
            />
        </div>
    );
}
