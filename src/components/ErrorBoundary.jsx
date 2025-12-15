import React from "react";
import ErrorFallback from "./ErrorFallback";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
    this.handleReset = this.handleReset.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error capturado:", error, errorInfo);

    try {
      const message =
        error?.message || (typeof error === "string" ? error : String(error));
      const payload = {
        time: Date.now(),
        message,
        stack: error?.stack || null,
        componentStack: errorInfo?.componentStack || null,
      };
      window?.localStorage?.setItem("pwa_last_error", JSON.stringify(payload));
    } catch {
      void 0;
    }
  }

  handleReset() {
    this.setState({ hasError: false, error: null });
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback error={this.state.error} onReset={this.handleReset} />
      );
    }
    return this.props.children;
  }
}
