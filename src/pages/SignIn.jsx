import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SignIn = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        // In a real app, you would validate credentials here
        login();
        navigate('/dashboard');
    };

    return (
        <div className="container d-flex align-items-center justify-content-center min-vh-100">
            <div className="card" style={{ maxWidth: '420px', width: '100%' }}>
                <div className="card-body p-5">
                    <div className="text-center mb-3">
                        <Link to="/" className="mb-4 d-inline-block">
                            <img src="/assets/images/logo-icon.svg" alt="" width="36" />
                            <span className="ms-2">
                                <img src="/assets/images/logo.svg" alt="" />
                            </span>
                        </Link>
                        <h1 className="card-title mb-5 h5">Sign in to your account</h1>
                    </div>

                    <form className="needs-validation mt-3" noValidate onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">Email address</label>
                            <input
                                id="email"
                                type="email"
                                className="form-control"
                                placeholder="name@example.com"
                                required
                                autoFocus
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <div className="invalid-feedback">Please enter a valid email.</div>
                        </div>

                        <div className="mb-3">
                            <label htmlFor="password" d-flex justify-content-between className="form-label d-flex justify-content-between">
                                <span>Password</span>
                                <Link to="#" className="small link-primary">Forgot Password?</Link>
                            </label>
                            <input
                                id="password"
                                type="password"
                                className="form-control"
                                placeholder="Password"
                                required
                                minLength="6"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <div className="invalid-feedback">Please provide a password (min 6 characters).</div>
                        </div>

                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div className="form-check">
                                <input id="remember" className="form-check-input" type="checkbox" />
                                <label className="form-check-label small" htmlFor="remember">Remember me</label>
                            </div>
                        </div>

                        <button className="btn btn-primary w-100" type="submit">Sign in</button>
                    </form>

                    <div className="text-center mt-3 small text-muted">
                        Don't have an account? <Link to="/signup" className="link-primary">Sign up</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignIn;
