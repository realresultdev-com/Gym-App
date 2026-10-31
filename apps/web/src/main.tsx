import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'
import './index.css'
import App from './App.tsx'

// On Native Android / iOS, enable native mobile styles and dark status bar icons
if (Capacitor.isNativePlatform()) {
  document.documentElement.classList.add('is-native-mobile');
  StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
  StatusBar.setBackgroundColor({ color: '#ffffff' }).catch(() => {});
  StatusBar.setOverlaysWebView({ overlay: true }).catch(() => {});
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

