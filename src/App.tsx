import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/institutional/Landing'
import Login from './pages/auth/Login'
import RegisterStudentMentor from './pages/auth/RegisterStudentMentor'
import RegisterCompany from './pages/auth/RegisterCompany'

import StudentDashboard from './pages/student/Dashboard'
import ExploreCourses from './pages/student/ExploreCourses'
import CourseDetail from './pages/student/CourseDetail'
import Mentorship from './pages/student/Mentorship'
import StudentProfile from './pages/student/Profile'
import StudentJobs from './pages/student/Jobs'

import CompanyDashboard from './pages/company/Dashboard'
import StudentsManagement from './pages/company/StudentsManagement'
import MentorsManagement from './pages/company/MentorsManagement'
import CoursesManagement from './pages/company/CoursesManagement'
import ProgramsManagement from './pages/company/ProgramsManagement'
import JobsManagement from './pages/company/JobsManagement'
import Reports from './pages/company/Reports'
import CompanySettings from './pages/company/Settings'

import MentorDashboard from './pages/mentor/Dashboard'
import MentorAvailability from './pages/mentor/Availability'
import MyStudents from './pages/mentor/MyStudents'
import MentorHistory from './pages/mentor/History'
import MentorProfile from './pages/mentor/Profile'

import { ProtectedRoute } from './components/ProtectedRoute'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<RegisterStudentMentor />} />
      <Route path="/cadastro/empresa" element={<RegisterCompany />} />

      {/* Painel do Aluno */}
      <Route
        path="/aluno"
        element={
          <ProtectedRoute accountType="student">
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/aluno/cursos"
        element={
          <ProtectedRoute accountType="student">
            <ExploreCourses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/aluno/cursos/:courseId"
        element={
          <ProtectedRoute accountType="student">
            <CourseDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/aluno/mentoria"
        element={
          <ProtectedRoute accountType="student">
            <Mentorship />
          </ProtectedRoute>
        }
      />
      <Route
        path="/aluno/vagas"
        element={
          <ProtectedRoute accountType="student">
            <StudentJobs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/aluno/perfil"
        element={
          <ProtectedRoute accountType="student">
            <StudentProfile />
          </ProtectedRoute>
        }
      />

      {/* Painel da Empresa */}
      <Route
        path="/empresa"
        element={
          <ProtectedRoute accountType="company">
            <CompanyDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/empresa/alunos"
        element={
          <ProtectedRoute accountType="company">
            <StudentsManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/empresa/mentores"
        element={
          <ProtectedRoute accountType="company">
            <MentorsManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/empresa/cursos"
        element={
          <ProtectedRoute accountType="company">
            <CoursesManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/empresa/treinamentos"
        element={
          <ProtectedRoute accountType="company">
            <ProgramsManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/empresa/vagas"
        element={
          <ProtectedRoute accountType="company">
            <JobsManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/empresa/relatorios"
        element={
          <ProtectedRoute accountType="company">
            <Reports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/empresa/configuracoes"
        element={
          <ProtectedRoute accountType="company">
            <CompanySettings />
          </ProtectedRoute>
        }
      />

      {/* Painel do Mentor */}
      <Route
        path="/mentor"
        element={
          <ProtectedRoute accountType="mentor">
            <MentorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mentor/horarios"
        element={
          <ProtectedRoute accountType="mentor">
            <MentorAvailability />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mentor/alunos"
        element={
          <ProtectedRoute accountType="mentor">
            <MyStudents />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mentor/historico"
        element={
          <ProtectedRoute accountType="mentor">
            <MentorHistory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mentor/perfil"
        element={
          <ProtectedRoute accountType="mentor">
            <MentorProfile />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
