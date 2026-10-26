import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { INFO_PAGES } from './pages/institutional/infoPages'
import { ProtectedRoute } from './components/ProtectedRoute'

// Cada tela vira um pedaço separado do bundle, baixado só quando a rota é aberta (antes tudo ia num
// único arquivo de ~720 kB, acima do limite recomendado pelo Vite).
const Landing = lazy(() => import('./pages/institutional/Landing'))
const InfoPage = lazy(() => import('./pages/institutional/InfoPage'))
const Login = lazy(() => import('./pages/auth/Login'))
const RegisterStudentMentor = lazy(() => import('./pages/auth/RegisterStudentMentor'))
const RegisterCompany = lazy(() => import('./pages/auth/RegisterCompany'))

const StudentDashboard = lazy(() => import('./pages/student/Dashboard'))
const ExploreCourses = lazy(() => import('./pages/student/ExploreCourses'))
const CourseDetail = lazy(() => import('./pages/student/CourseDetail'))
const CoursePlayer = lazy(() => import('./pages/student/CoursePlayer'))
const Certificate = lazy(() => import('./pages/student/Certificate'))
const StudentActivities = lazy(() => import('./pages/student/Activities'))
const Mentorship = lazy(() => import('./pages/student/Mentorship'))
const StudentDoubts = lazy(() => import('./pages/student/Doubts'))
const StudentProfile = lazy(() => import('./pages/student/Profile'))
const StudentJobs = lazy(() => import('./pages/student/Jobs'))

const CompanyDashboard = lazy(() => import('./pages/company/Dashboard'))
const StudentsManagement = lazy(() => import('./pages/company/StudentsManagement'))
const MentorsManagement = lazy(() => import('./pages/company/MentorsManagement'))
const CoursesManagement = lazy(() => import('./pages/company/CoursesManagement'))
const ProgramsManagement = lazy(() => import('./pages/company/ProgramsManagement'))
const JobsManagement = lazy(() => import('./pages/company/JobsManagement'))
const Reports = lazy(() => import('./pages/company/Reports'))
const CompanySettings = lazy(() => import('./pages/company/Settings'))

const MentorDashboard = lazy(() => import('./pages/mentor/Dashboard'))
const MentorAvailability = lazy(() => import('./pages/mentor/Availability'))
const MyStudents = lazy(() => import('./pages/mentor/MyStudents'))
const MentorActivities = lazy(() => import('./pages/mentor/Activities'))
const MentorDoubts = lazy(() => import('./pages/mentor/Doubts'))
const MentorHistory = lazy(() => import('./pages/mentor/History'))
const MentorProfile = lazy(() => import('./pages/mentor/Profile'))

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface">
      <div role="status" aria-label="Carregando" className="h-8 w-8 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        {INFO_PAGES.map((slug) => (
          <Route key={slug} path={`/${slug}`} element={<InfoPage slug={slug} />} />
        ))}
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
          path="/aluno/cursos/:courseId/aulas"
          element={
            <ProtectedRoute accountType="student">
              <CoursePlayer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/aluno/certificados/:certificateId"
          element={
            <ProtectedRoute accountType="student">
              <Certificate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/aluno/atividades"
          element={
            <ProtectedRoute accountType="student">
              <StudentActivities />
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
          path="/aluno/duvidas"
          element={
            <ProtectedRoute accountType="student">
              <StudentDoubts />
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
          path="/mentor/atividades"
          element={
            <ProtectedRoute accountType="mentor">
              <MentorActivities />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mentor/duvidas"
          element={
            <ProtectedRoute accountType="mentor">
              <MentorDoubts />
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
    </Suspense>
  )
}
