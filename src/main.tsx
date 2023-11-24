import './index.css'

import React from 'react'

import ReactDOM from 'react-dom/client'

import App from './App'
import * as contexts from './contexts'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <contexts.MediaStreamProvider audio={true} video={false}>
      <contexts.InputAudioProvider>
        <contexts.AudioAnalyserProvider>
          <App />
        </contexts.AudioAnalyserProvider>
      </contexts.InputAudioProvider>
    </contexts.MediaStreamProvider>
  </React.StrictMode>
)
