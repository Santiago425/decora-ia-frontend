import { Component, type ReactNode } from 'react';

/** Hides a decorative 3D scene when WebGL is missing or the chunk fails to load, leaving the page usable. */
export class SceneBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? (this.props.fallback ?? null) : this.props.children;
  }
}
