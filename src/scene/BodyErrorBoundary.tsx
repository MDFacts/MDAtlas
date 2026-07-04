import { Component } from 'react'
import type { ReactNode } from 'react'

interface Props {
  fallback: ReactNode
  children: ReactNode
}

interface State {
  failed: boolean
}

/** Renders the procedural fallback body if the realistic GLB fails to load
 * (missing file, decode error). Keeps the app usable before the model is sourced. */
export class BodyErrorBoundary extends Component<Props, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  render() {
    if (this.state.failed) {
      return this.props.fallback
    }
    return this.props.children
  }
}
