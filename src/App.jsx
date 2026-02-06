import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SchoolProvider } from './contexts/SchoolContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

// Lazy load components
const Login = lazy(() => import('./pages/Login'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Register = lazy(() => import('./pages/Register'));
const AdminOverview = lazy(() => import('./pages/admin/AdminOverview'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
const AdminResults = lazy(() => import('./pages/admin/AdminResults'));
const SchoolManagement = lazy(() => import('./pages/admin/SchoolManagement'));
const AdminExams = lazy(() => import('./pages/admin/AdminExams'));
const TeacherOverview = lazy(() => import('./pages/teacher/TeacherOverview'));
const QuizList = lazy(() => import('./pages/teacher/QuizList'));
const QuizEditor = lazy(() => import('./pages/teacher/QuizEditor'));
const TeacherResults = lazy(() => import('./pages/teacher/TeacherResults'));
const TeacherResultDetail = lazy(() => import('./pages/teacher/TeacherResultDetail'));
const StudentOverview = lazy(() => import('./pages/student/StudentOverview'));
const QuizTaker = lazy(() => import('./pages/student/QuizTaker'));
const QuizResult = lazy(() => import('./pages/student/QuizResult'));
const StudentResults = lazy(() => import('./pages/student/StudentResults'));
const StudentTeachers = lazy(() => import('./pages/student/StudentTeachers'));
const HelpCenter = lazy(() => import('./pages/HelpCenter'));

// Loading component
const PageLoader = () => (
  <div style={{
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }}>
    <div className="animate-spin" style={{
      width: '40px',
      height: '40px',
      border: '4px solid #f3f3f3',
      borderTop: '4px solid #4F46E5',
      borderRadius: '50%'
    }} />
  </div>
);

function App() {
  return (
    <SchoolProvider>
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin" element={<DashboardLayout role="admin" />}>
                <Route index element={<AdminOverview />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="results" element={<AdminResults />} />
                <Route path="schools" element={<SchoolManagement />} />
                <Route path="exams" element={<AdminExams />} />
                <Route path="exams/:id" element={<QuizEditor />} />
                <Route path="help" element={<HelpCenter />} />
              </Route>
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
              <Route path="/teacher" element={<DashboardLayout role="teacher" />}>
                <Route index element={<TeacherOverview />} />
                <Route path="quizzes" element={<QuizList />} />
                <Route path="quizzes/new" element={<QuizEditor />} />
                <Route path="quizzes/:id/edit" element={<QuizEditor />} />
                <Route path="results" element={<TeacherResults />} />
                <Route path="results/:id" element={<TeacherResultDetail />} />
                <Route path="help" element={<HelpCenter />} />
              </Route>
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['student']} />}>
              <Route path="/student" element={<DashboardLayout role="student" />}>
                <Route index element={<StudentOverview />} />
                <Route path="results" element={<StudentResults />} />
                <Route path="quiz/:id" element={<QuizTaker />} />
                <Route path="result/:id" element={<QuizResult />} />
                <Route path="teachers" element={<StudentTeachers />} />
                <Route path="help" element={<HelpCenter />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </SchoolProvider>
  );
}

export default App;

