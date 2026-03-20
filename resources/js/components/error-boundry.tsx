import React from 'react';

interface Props {
    children: React.ReactNode;
    fallback?: (error: Error, reset: () => void) => React.ReactNode;
}

interface State {
    error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { error };
    }

    reset = () => {
        this.setState({ error: null });
    };

    componentDidUpdate(prevProps: Props) {
        if (this.state.error && prevProps.children !== this.props.children) {
            this.setState({ error: null });
        }
    }

    render() {
        if (this.state.error) {
            if (this.props.fallback) {
                return this.props.fallback(this.state.error, this.reset);
            }
            return (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                    <div className="mb-1 text-sm font-medium text-red-800">Render Error</div>
                    <pre className="whitespace-pre-wrap text-xs text-red-600">
                        {this.state.error.message}
                    </pre>
                </div>
            );
        }
        return this.props.children;
    }
}
