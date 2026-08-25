import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const location = useLocation();
    const isActive = (path) => (location.pathname === path ? 'active' : '');

    return (
        <aside id="sidebar" className="sidebar">
            <div className="logo-area">
                <Link to="/dashboard" className="d-inline-flex align-items-center text-decoration-none">
                    <img src="/assets/images/logo.png" alt="Adék Logo" className="sidebar-brand-logo" />
                    <span className="logo-text ms-2 fw-bold text-dark fs-5">
                        Adék
                    </span>
                </Link>
            </div>

            <ul className="nav flex-column">
                <li className="px-4 py-2">
                    <small className="nav-text"></small>
                </li>

                <li>
                    <Link
                        className={`nav-link ${isActive('/dashboard')}`}
                        to="/dashboard"
                    >
                        <i className="ti ti-layout-dashboard"></i>
                        <span className="nav-text">Dashboard</span>
                    </Link>
                </li>

                <li>
                    <Link
                        className={`nav-link ${isActive('/stores')}`}
                        to="/stores"
                    >
                        <i className="ti ti-building-store"></i>
                        <span className="nav-text">Boutiques</span>
                    </Link>
                </li>

                <li>
                    <Link
                        className={`nav-link ${isActive('/vendors')}`}
                        to="/vendors"
                    >
                        <i className="ti ti-user-dollar"></i>
                        <span className="nav-text">Vendeurs</span>
                    </Link>
                </li>

                <li>
                    <Link
                        className={`nav-link ${isActive('/members')}`}
                        to="/members"
                    >
                        <i className="ti ti-id-badge-2"></i>
                        <span className="nav-text">Membres</span>
                    </Link>
                </li>

                <li className="px-4 pt-4 pb-2">
                    <small className="nav-text">Autre</small>
                </li>

                <li>
                    <Link className="nav-link" to="/signup">
                        <i className="ti ti-logout"></i>
                        <span className="nav-text">Se déconnecter</span>
                    </Link>
                </li>
            </ul>
        </aside>
    );
};

export default Sidebar;