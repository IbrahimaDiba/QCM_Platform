import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';
import Register from './pages/Register';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import { AuthProvider } from './contexts/AuthContext';
import { SchoolProvider } from './contexts/SchoolContext';
import ProtectedRoute from './components/ProtectedRoute';

import DashboardLayout from './layouts/DashboardLayout';
import AdminOverview from './pages/admin/AdminOverview';
import UserManagement from './pages/admin/UserManagement';
import AdminResults from './pages/admin/AdminResults';
import SchoolManagement from './pages/admin/SchoolManagement';
import AdminExams from './pages/admin/AdminExams';

import TeacherOverview from './pages/teacher/TeacherOverview';
import QuizList from './pages/teacher/QuizList';
import QuizEditor from './pages/teacher/QuizEditor';
import TeacherResults from './pages/teacher/TeacherResults';
import TeacherResultDetail from './pages/teacher/TeacherResultDetail';

import StudentOverview from './pages/student/StudentOverview';
import QuizTaker from './pages/student/QuizTaker';
import QuizResult from './pages/student/QuizResult';
import StudentResults from './pages/student/StudentResults';
import StudentTeachers from './pages/student/StudentTeachers';

function App() {
  return (
    <SchoolProvider>
      <AuthProvider>
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
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route path="/student" element={<DashboardLayout role="student" />}>
              <Route index element={<StudentOverview />} />
              <Route path="results" element={<StudentResults />} />
              <Route path="quiz/:id" element={<QuizTaker />} />
              <Route path="result/:id" element={<QuizResult />} />
              <Route path="teachers" element={<StudentTeachers />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </SchoolProvider>
  );
}

export default App;

