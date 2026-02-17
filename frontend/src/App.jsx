import { Component, useEffect, useState } from 'react';
import EditorPage from './pages/EditorPage'

class ErrorBoundary extends Component {
    state = { hasError: false, error: null };
    static getDerivedStateFromError(error) { return { hasError: true, error }; }
    render() {
        if (this.state.hasError) return (
            <div style={{ padding: '50px', background: '#fee2e2', color: '#b91c1c', border: '2px solid #b91c1c', margin: '20px', borderRadius: '8px' }}>
                <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>Frontend Crash Detected</h1>
                <p>Error: {this.state.error?.message}</p>
                <button onClick={() => window.location.reload()} style={{ marginTop: '20px', padding: '10px 20px', background: '#b91c1c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Reload Page</button>
            </div>
        );
        return this.props.children;
    }
}

function App() {
    const [health, setHealth] = useState('Checking...');

    useEffect(() => {
        fetch('/api/posts/')
            .then(res => res.status === 200 ? setHealth('CONNECTED') : setHealth('SERVER ERROR'))
            .catch(err => setHealth('OFFLINE'));
    }, []);

    return (
        <div className="min-h-screen flex flex-col" style={{ background: '#fbfbfa', fontFamily: 'Inter, system-ui, sans-serif' }}>
            {/* Global Style Injection Fallback */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                body { margin: 0; background: #fbfbfa; }
                .editor-input { min-height: 500px; outline: none; font-size: 17px; line-height: 1.6; color: #37352f; }
            `}</style>

            <div style={{ padding: '6px 12px', background: '#37352f', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', fontWeight: 'bold', letterSpacing: '1px' }}>
                <span>SMART EDITOR ENGINE v1.2</span>
                <span style={{ color: health === 'CONNECTED' ? '#4ade80' : '#f87171' }}>BACKEND: {health}</span>
            </div>
            <ErrorBoundary>
                <EditorPage />
            </ErrorBoundary>
        </div>
    )
}

export default App
