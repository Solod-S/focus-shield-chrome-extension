import React from 'react';
import { createRoot } from 'react-dom/client';
import { SettingsApp } from './SettingsApp.jsx';
import { I18nProvider } from '../i18n/index.js';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <I18nProvider>
      <SettingsApp />
    </I18nProvider>
  );
}
