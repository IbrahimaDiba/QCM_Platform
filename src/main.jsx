import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

// Diagnostic help for white page issues
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    console.error('GLOBAL ERROR CAUGHT:', event.error);
    const root = document.getElementById('root');
    if (root && root.innerHTML === '') {
      root.innerHTML = `<div style="padding: 20px; color: red;"><h1>App Crash</h1><pre>${event.message}</pre><button onclick="localStorage.clear(); sessionStorage.clear(); location.reload();">Clear Cache & Reload</button></div>`;
    }
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
    {/* Diagnostic helper button (visible if something fails) */}
    <div style={{ position: 'fixed', bottom: '10px', right: '10px', opacity: 0.1 }}>
      <button onClick={() => { localStorage.clear(); location.reload(); }}>Reset</button>
    </div>
  </StrictMode>,
)
