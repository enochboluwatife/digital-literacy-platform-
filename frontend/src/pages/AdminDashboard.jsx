"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { BookOpen, Users, TrendingUp, Award, Plus, Edit, Trash2, Eye } from "lucide-react"
import { coursesApi } from "../services/api"

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    completionRate: 0,
    certificatesIssued: 0,
  })
  const [courses, setCourses] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch courses
        const coursesResponse = await coursesApi.getCourses();
        const coursesData = coursesResponse.data || [];
        
        // Mock stats for now - in a real app, these would come from analytics API
        const mockStats = {
          totalStudents: 3250,
          totalCourses: coursesData.length,
          completionRate: 78,
          certificatesIssued: 1890,
        }

        // Mock students for now - in a real app, these would come from users API
        const mockStudents = [
          {
            id: 1,
            name: "Adebayo Johnson",
            email: "adebayo.j@university.edu.ng",
            institution: "University of Lagos",
            coursesEnrolled: 3,
            coursesCompleted: 2,
            joinDate: "2024-01-15",
          },
          {
            id: 2,
            name: "Fatima Hassan",
            email: "fatima.h@university.edu.ng",
            institution: "Ahmadu Bello University",
            coursesEnrolled: 2,
            coursesCompleted: 1,
            joinDate: "2024-02-20",
          },
          {
            id: 3,
            name: "Chidi Okafor",
            email: "chidi.o@university.edu.ng",
            institution: "University of Nigeria",
            coursesEnrolled: 4,
            coursesCompleted: 3,
            joinDate: "2024-01-08",
          },
        ]

        setStats(mockStats)
        setCourses(coursesData)
        setStudents(mockStudents)
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Fallback to empty data
        setStats({ totalStudents: 0, totalCourses: 0, completionRate: 0, certificatesIssued: 0 });
        setCourses([]);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">DigiLearn Admin</h1>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/admin" className="text-foreground font-medium">
              Dashboard
            </Link>
            <Link to="/admin/courses" className="text-muted-foreground hover:text-foreground transition-colors">
              Courses
            </Link>
            <Link to="/admin/students" className="text-muted-foreground hover:text-foreground transition-colors">
              Students
            </Link>
          </nav>
          <div className="flex items-center space-x-3">
            <Link to="/" className="btn btn-outline">
              View Site
            </Link>
            <button className="btn btn-primary">Logout</button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your digital literacy platform</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="card-content p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total Students</p>
                  <p className="text-2xl font-bold text-foreground">
                    {loading ? "..." : stats.totalStudents.toLocaleString()}
                  </p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-content p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total Courses</p>
                  <p className="text-2xl font-bold text-foreground">{loading ? "..." : stats.totalCourses}</p>
                </div>
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-content p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Completion Rate</p>
                  <p className="text-2xl font-bold text-foreground">{loading ? "..." : `${stats.completionRate}%`}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-content p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Certificates Issued</p>
                  <p className="text-2xl font-bold text-foreground">
                    {loading ? "..." : stats.certificatesIssued.toLocaleString()}
                  </p>
                </div>
                <Award className="h-8 w-8 text-primary" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Courses Management */}
          <div className="card">
            <div className="card-header p-6 pb-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">Course Management</h2>
                <button className="btn btn-primary btn-sm flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Add Course</span>
                </button>
              </div>
            </div>
            <div className="card-content p-6 pt-0">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-muted rounded mb-2"></div>
                      <div className="h-3 bg-muted rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {courses.map((course) => (
                    <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium text-foreground">{course.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {course.students} students • {course.completion}% completion
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-muted-foreground hover:text-foreground">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-muted-foreground hover:text-foreground">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Students Management */}
          <div className="card">
            <div className="card-header p-6 pb-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">Recent Students</h2>
                <Link to="/admin/students" className="text-primary hover:underline text-sm">
                  View All
                </Link>
              </div>
            </div>
            <div className="card-content p-6 pt-0">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-muted rounded mb-2"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {students.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium text-foreground">{student.name}</h3>
                        <p className="text-sm text-muted-foreground">{student.institution}</p>
                        <p className="text-xs text-muted-foreground">
                          {student.coursesCompleted}/{student.coursesEnrolled} courses completed
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          Joined {new Date(student.joinDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
