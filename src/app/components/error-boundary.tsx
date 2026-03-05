import { Component, type ReactNode, type ErrorInfo } from "react";

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("POS Error Boundary caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            return (
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        minHeight: "100vh",
                        padding: "2rem",
                        background: "#0f172a",
                        color: "#e2e8f0",
                        fontFamily: "Inter, system-ui, sans-serif",
                        textAlign: "center",
                    }}
                >
                    <div
                        style={{
                            background: "#1e293b",
                            borderRadius: "1rem",
                            padding: "2.5rem",
                            maxWidth: "480px",
                            width: "100%",
                            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                            border: "1px solid #334155",
                        }}
                    >
                        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
                        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem", color: "#f8fafc" }}>
                            Something went wrong
                        </h2>
                        <p style={{ color: "#94a3b8", marginBottom: "0.25rem", fontSize: "0.875rem" }}>
                            មានបញ្ហាកើតឡើង
                        </p>
                        <p style={{ color: "#64748b", marginBottom: "1.5rem", fontSize: "0.8rem" }}>
                            {this.state.error?.message || "An unexpected error occurred"}
                        </p>
                        <button
                            onClick={() => {
                                this.setState({ hasError: false, error: null });
                                window.location.reload();
                            }}
                            style={{
                                background: "linear-gradient(135deg, #22c55e, #16a34a)",
                                color: "white",
                                border: "none",
                                borderRadius: "0.75rem",
                                padding: "0.75rem 2rem",
                                fontSize: "1rem",
                                fontWeight: 600,
                                cursor: "pointer",
                                transition: "opacity 0.2s",
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.opacity = "0.9")}
                            onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
                        >
                            🔄 Reload App / ផ្ទុកឡើងវិញ
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
