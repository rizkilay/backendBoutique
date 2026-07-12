import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import SignIn from './pages/SignIn';
import Dashboard from './pages/Dashboard';
import UserPage from './pages/UserPage';
import User from './pages/user_page';
import MembersPage from './pages/MembersPage';
import StoresPage from './pages/StoresPage';
import VendorsPage from './pages/VendorsPage';
import Layout from './layouts/Layout';
import LandingPage from './pages/LandingPage';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    // Pendant la vérification du token, afficher un loader
    if (loading) {
        return (
            <div className="d-flex align-items-center justify-content-center min-vh-100">
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" role="status">
                        <span className="visually-hidden">Chargement...</span>
                    </div>
                    <p className="text-muted small">Vérification de la session...</p>
                </div>
            </div>
        );
    }

    return isAuthenticated ? children : <Navigate to="/signin" />;
};

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/signin" element={<SignIn />} />
                    <Route path="/user" element={<User />} />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <Dashboard />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/stores"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <StoresPage />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/vendors"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <VendorsPage />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/members"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <MembersPage />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/" element={<LandingPage />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;
