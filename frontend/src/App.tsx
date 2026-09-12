import { lazy, Suspense } from "react";
import { AuthPage } from "./features/auth/components/auth-page";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";

const BlogHome = lazy(() =>
  import("./features/blogs/components/blog-home").then((module) => ({ default: module.BlogHome })),
);
const BlogDetail = lazy(() =>
  import("./features/blogs/components/blog-detail").then((module) => ({ default: module.BlogDetail })),
);
const BlogListPage = lazy(() =>
  import("./features/blogs/components/blog-list-page").then((module) => ({ default: module.BlogListPage })),
);
const ProfilePage = lazy(() =>
  import("./features/auth/components/profile-page").then((module) => ({ default: module.ProfilePage })),
);
const AdminDashboard = lazy(() =>
  import("./features/blogs/components/admin-dashboard").then((module) => ({ default: module.AdminDashboard })),
);
const AdminCreatePage = lazy(() =>
  import("./features/blogs/components/admin-pages").then((module) => ({ default: module.AdminCreatePage })),
);
const AdminManagePage = lazy(() =>
  import("./features/blogs/components/admin-pages").then((module) => ({ default: module.AdminManagePage })),
);
const AdminEditPage = lazy(() =>
  import("./features/blogs/components/admin-pages").then((module) => ({ default: module.AdminEditPage })),
);

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<main className="min-h-screen bg-inkwell-950" />}>
        <Routes>
          <Route path="/" element={<BlogHome />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/home" element={<BlogHome />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/blogs/:slug" element={<BlogDetail />} />
          <Route path="/blogs" element={<BlogListPage />} />
          <Route path="/admin/blogs" element={<AdminDashboard />} />
          <Route path="/admin/blogs/create" element={<AdminCreatePage />} />
          <Route path="/admin/blogs/manage" element={<AdminManagePage />} />
          <Route path="/admin/blogs/edit/:blogId" element={<AdminEditPage />} />
          <Route path="/api/auth/google/callback" element={<AuthPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
