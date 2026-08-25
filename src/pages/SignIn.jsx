import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SignIn = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Identifiants incorrects. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container d-flex align-items-center justify-content-center min-vh-100">
            <div className="card" style={{ maxWidth: '420px', width: '100%' }}>
                <div className="card-body p-5">
                    <div className="text-center mb-3">
                        <Link to="/" className="mb-4 d-inline-block">
                            <img src="/assets/images/logo.svg" alt="" width="36" />
                            <span className="ms-2">
                                <img src="/assets/images/logo.svg" alt="" />
                            </span>
                        </Link>
                        <h1 className="card-title mb-1 h5">Connexion au Back-Office</h1>
                        <p className="text-muted small mb-4">Entrez vos identifiants pour accéder au tableau de bord</p>
                    </div>

                    {error && (
                        <div className="alert alert-danger d-flex align-items-center gap-2 py-2 mb-3" role="alert">
                            <i className="ti ti-alert-circle fs-5 text-danger"></i>
                            <span className="small">{error}</span>
                        </div>
                    )}

                    <form className="needs-validation mt-3" noValidate onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">Adresse email</label>
                            <input
                                id="email"
                                type="email"
                                className="form-control"
                                placeholder="exemple@boutique.com"
                                required
                                autoFocus
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="password" className="form-label d-flex justify-content-between">
                                <span>Mot de passe</span>
                            </label>
                            <div className="input-group">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    className="form-control border-end-0"
                                    placeholder="Votre mot de passe"
                                    required
                                    minLength="6"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary border-start-0"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                >
                                    <i className={`ti ${showPassword ? 'ti-eye-off' : 'ti-eye'}`}></i>
                                </button>
                            </div>
                        </div>

                        <button
                            className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    <span>Connexion en cours...</span>
                                </>
                            ) : (
                                <>
                                    <i className="ti ti-login fs-5"></i>
                                    <span>Se connecter</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="text-center mt-4 p-3 bg-light rounded small text-muted">
                        <strong>Compte par défaut :</strong><br />
                        <span className="text-primary">admin@boutique.com</span> / <span className="text-primary">Admin@1234</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignIn;
