import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { loadCatalogue } from './lib/catalogue';
import { loadSiteSettings } from './lib/siteSettings';
import './index.css';

// Prices, names and visibility from the admin panel (the code values show until it arrives).
void loadCatalogue();
// Announcement, support number and switches from the admin panel's Settings.
void loadSiteSettings();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
