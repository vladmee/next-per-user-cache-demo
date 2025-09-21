"use client";
import { Component, type ReactNode } from "react";

// It renders the error but, in practice, it should show an error related to the module
export default class ErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { error: unknown }
> {
  state = { error: undefined as unknown };

  static getDerivedStateFromError(error: unknown) {
    return { error };
  }

  render() {
    return this.state.error ? this.props.fallback : this.props.children;
  }
}
