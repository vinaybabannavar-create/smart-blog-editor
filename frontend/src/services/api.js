import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
});

export const createPost = async (arg = "Untitled") => {
    const title = typeof arg === 'object' && arg !== null ? arg.title || "Untitled" : arg;
    const response = await api.post('/posts/', {
        title,
        content: {
            root: {
                children: [
                    {
                        children: [],
                        direction: null,
                        format: "",
                        indent: 0,
                        type: "paragraph",
                        version: 1,
                    },
                ],
                direction: null,
                format: "",
                indent: 0,
                type: "root",
                version: 1,
            },
        },
        status: 'draft'
    });
    return response.data; // Return the full response data which likely contains { data: [...] }
};

export const updatePost = async (id, data) => {
    const response = await api.patch(`/posts/${id}`, data);
    return response.data;
};

export const getPosts = async () => {
    const response = await api.get('/posts/');
    return response.data.data[0];
};

export const fetchPost = async (id) => {
    const response = await api.get(`/posts/${id}`);
    return response.data;
};

export const deletePost = async (id) => {
    const response = await api.delete(`/posts/${id}`);
    return response.data;
};

export const generateAI = async (prompt, imageFile = null) => {
    const formData = new FormData();
    formData.append('prompt', prompt);
    if (imageFile) {
        formData.append('image', imageFile);
    }

    const response = await fetch('/api/ai/generate', {
        method: 'POST',
        body: formData, // No Content-Type header needed, browser sets it for FormData
    });
    return response.body;
};
