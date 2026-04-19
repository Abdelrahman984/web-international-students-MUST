import './index.css';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';

const container = document.getElementById('root');

if (!container) {
throw new Error('root element not found');
}

const root = createRoot(container);

root.render(<App />);
