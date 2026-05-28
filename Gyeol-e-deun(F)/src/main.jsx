import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './css/index.css'; // 디자인 통일을 위해 가져오기
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
