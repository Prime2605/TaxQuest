import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-indigo-950 text-white flex flex-col items-center justify-center p-6 text-center">
                    <div className="bg-red-500/10 p-4 rounded-2xl mb-6 border border-red-500/20">
                        <AlertTriangle className="text-red-500 w-12 h-12" />
                    </div>
                    <h2 className="text-2xl font-black mb-2 uppercase tracking-tight">System Glitch Detected</h2>
                    <p className="text-indigo-300 text-sm mb-8 max-w-xs font-medium">
                        The TaxQuest engine encountered an unexpected error. Don't worry, your data is safe.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="btn-primary"
                    >
                        <RefreshCw size={18} />
                        Reboot Application
                    </button>

                    <div className="mt-8 p-4 glass-card bg-black/20 w-full max-w-sm text-left">
                        <p className="text-[10px] font-mono text-indigo-400 overflow-hidden text-ellipsis">
                            {this.state.error?.message || "Unknown error"}
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
