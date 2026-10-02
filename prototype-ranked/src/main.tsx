import ReactDOM from 'react-dom/client';
import '@fontsource-variable/bricolage-grotesque/standard.css';
import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import './index.css';
import App from './App';
import { ErrorBoundary } from './components/layout/ErrorBoundary';

// No StrictMode: the game fires one-shot sounds and anime.js timelines from
// effects, and dev-mode double invocation would play every one of them twice.
ReactDOM.createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
);
