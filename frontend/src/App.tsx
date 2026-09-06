import { AuthPage } from './features/auth/components/auth-page'
import { BlogHome } from './features/blogs/components/blog-home'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BlogHome />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/home" element={<BlogHome />} />
        <Route path="/api/auth/google/callback" element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
