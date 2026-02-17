import { create } from 'zustand';

const usePostStore = create((set) => ({
    posts: [],
    currentPost: null,
    saveStatus: 'saved', // 'saved', 'saving', 'unsaved'

    setPosts: (posts) => set({ posts }),
    setCurrentPost: (post) => set({ currentPost: post }),
    setSaveStatus: (status) => set({ saveStatus: status }),

    updateCurrentPost: (updates) => set((state) => {
        const updatedPost = state.currentPost ? { ...state.currentPost, ...updates } : null;
        return {
            currentPost: updatedPost,
            posts: state.posts.map(p => p.id === updatedPost?.id ? updatedPost : p),
            saveStatus: 'unsaved'
        };
    }),

    updateCurrentPostContent: (content) => set((state) => {
        const updatedPost = state.currentPost ? { ...state.currentPost, content } : null;
        return {
            currentPost: updatedPost,
            posts: state.posts.map(p => p.id === updatedPost?.id ? updatedPost : p),
            saveStatus: 'unsaved'
        };
    }),

    addPost: (post) => set((state) => ({
        posts: [post, ...state.posts],
        currentPost: post
    })),

    aiToInsert: null,
    setAiToInsert: (text) => set({ aiToInsert: text }),

    removePost: (id) => set((state) => ({
        posts: state.posts.filter((p) => p.id !== id),
        currentPost: state.currentPost?.id === id ? null : state.currentPost
    })),
}));

export default usePostStore;
