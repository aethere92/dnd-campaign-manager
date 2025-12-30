import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from './ui/Button';

class ErrorBoundary extends Component {
	constructor(props) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error) {
		return { hasError: true, error };
	}

	componentDidCatch(error, errorInfo) {
		console.error('Error caught by boundary:', error, errorInfo);
	}

	handleReset = () => {
		this.setState({ hasError: false, error: null });
		window.location.reload();
	};

	render() {
		if (this.state.hasError) {
			return (
				<div className='min-h-screen flex items-center justify-center bg-muted p-4'>
					<div className='max-w-md w-full text-center'>
						<div className='mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100'>
							<AlertTriangle className='w-8 h-8 text-red-600' />
						</div>
						<h1 className='text-2xl font-serif font-bold text-foreground mb-3'>Something went wrong</h1>
						<p className='text-gray-600 mb-6'>Don't worry, your data is safe. Try refreshing the page to continue.</p>
						{process.env.NODE_ENV === 'development' && this.state.error && (
							<details className='mb-6 text-left bg-red-50 border border-red-200 rounded-lg p-4'>
								<summary className='cursor-pointer font-semibold text-red-900 mb-2'>Error Details</summary>
								<pre className='text-xs text-red-800 overflow-auto'>{this.state.error.toString()}</pre>
							</details>
						)}
						<Button onClick={this.handleReset} icon={RefreshCw}>
							Reload Application
						</Button>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
