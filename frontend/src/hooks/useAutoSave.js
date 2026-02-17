import { useEffect, useCallback, useRef } from 'react';
import usePostStore from '../store/postStore';
import { updatePost } from '../services/api';

const useAutoSave = (debounceTime = 2000) => {
    const { currentPost, saveStatus, setSaveStatus } = usePostStore();
    const timerRef = useRef(null);

    const saveContent = useCallback(async () => {
        if (!currentPost || !currentPost.id) return;

        setSaveStatus('saving');
        try {
            await updatePost(currentPost.id, {
                content: currentPost.content,
                title: currentPost.title,
                status: currentPost.status
            });
            setSaveStatus('saved');
        } catch (error) {
            console.error("Auto-save failed", error);
            setSaveStatus('error');
        }
    }, [currentPost, setSaveStatus]);

    useEffect(() => {
        if (saveStatus === 'unsaved') {
            if (timerRef.current) clearTimeout(timerRef.current);

            timerRef.current = setTimeout(() => {
                saveContent();
            }, debounceTime);
        }

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [currentPost, saveStatus, debounceTime, saveContent]);
};

export default useAutoSave;
