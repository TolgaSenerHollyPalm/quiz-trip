import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'kitshelf-ui/styles/fonts.css'
import 'kitshelf-ui/styles/tokens.css'
import 'kitshelf-ui/styles/base.css'
import App from './app/App.tsx'
import { watchAppearance } from 'kitshelf-ui/app/appearance.ts'

// The same key and page colours as the inline script in index.html.
watchAppearance({ key: 'tripkit-appearance', themeColors: { light: '#f7f5f0', dark: '#111615' } })
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
