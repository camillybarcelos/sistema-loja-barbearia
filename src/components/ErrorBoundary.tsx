import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    // Atualiza o estado para que a próxima renderização mostre a UI de fallback.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
    console.error("Erro não capturado pela fronteira de erro:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 text-red-700 p-4">
            <div className="text-center p-8 border border-red-200 rounded-lg bg-white shadow-xl max-w-2xl w-full">
                <h1 className="text-2xl font-bold mb-4">Ops! Algo deu errado.</h1>
                <p className="mb-4">Houve um erro inesperado ao tentar carregar a página.</p>
                <details className="text-left bg-gray-100 dark:bg-gray-800 p-4 rounded border dark:border-gray-700 cursor-pointer">
                    <summary className="font-medium text-gray-800 dark:text-gray-200">Detalhes Técnicos do Erro</summary>
                    <pre className="mt-2 text-sm text-red-600 dark:text-red-400 whitespace-pre-wrap break-all">
                        {this.state.error && this.state.error.toString()}
                        <br />
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </pre>
                </details>
            </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 