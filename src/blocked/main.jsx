import React from 'react';
import { createRoot } from 'react-dom/client';
import { BlockedApp } from './BlockedApp.jsx';
import { I18nProvider } from '../i18n/index.js';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <I18nProvider>
      <BlockedApp />
    </I18nProvider>
  );
}
