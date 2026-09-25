import { lazy, Suspense } from "react";
import { AuthPage } from "./features/auth/components/auth-page";
import { BrowserRouter, Route, Routes } from "react-router";

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
const PrivacyPolicy = lazy(() =>
  import("./features/blogs/components/landing/privacy-policy").then((module) => ({ default: module.PrivacyPolicy })),
);
const TermsAndConditions = lazy(() =>
  import("./features/blogs/components/landing/terms-and-conditions").then((module) => ({ default: module.TermsAndConditions })),
);
const NotFoundPage = lazy(() =>
  import("./features/blogs/components/not-found-page").then((module) => ({ default: module.NotFoundPage })),
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
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
