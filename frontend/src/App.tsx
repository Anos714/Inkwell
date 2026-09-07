import { AuthPage } from './features/auth/components/auth-page'
import { BlogHome } from './features/blogs/components/blog-home'
import { BlogDetail } from './features/blogs/components/blog-detail'
import { AdminDashboard } from './features/blogs/components/admin-dashboard'
import { AdminCreatePage, AdminEditPage, AdminManagePage } from './features/blogs/components/admin-pages'
import { BlogListPage } from './features/blogs/components/blog-list-page'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BlogHome />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/home" element={<BlogHome />} />
        <Route path="/blogs/:blogId" element={<BlogDetail />} />
        <Route path="/blogs" element={<BlogListPage />} />
        <Route path="/admin/blogs" element={<AdminDashboard />} />
        <Route path="/admin/blogs/create" element={<AdminCreatePage />} />
        <Route path="/admin/blogs/manage" element={<AdminManagePage />} />
        <Route path="/admin/blogs/edit/:blogId" element={<AdminEditPage />} />
        <Route path="/api/auth/google/callback" element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
