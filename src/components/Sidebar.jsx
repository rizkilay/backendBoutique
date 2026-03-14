import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const location = useLocation();
    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <aside id="sidebar" className="sidebar">
            <div className="logo-area">
                <Link to="/dashboard" className="d-inline-flex">
                    <img src="/assets/images/logo-icon.svg" alt="" width="24" />
                    <span className="logo-text ms-2">
                        <img src="/assets/images/logo.svg" alt="" />
                    </span>
                </Link>
            </div>
            <ul className="nav flex-column">
                <li className="px-4 py-2"><small className="nav-text"></small></li>
                <li>
                    <Link className={`nav-link ${isActive('/dashboard')}`} to="/dashboard">
                        <i className="ti ti-home"></i>
                        <span className="nav-text">Dashboard</span>
                    </Link>
                </li>
                <li>
                    <Link className={`nav-link ${isActive('/user')}`} to="/user">
                        <i className="ti ti-users"></i>
                        <span className="nav-text">Clients</span>
                    </Link>
                </li>
                <li>
                    <Link className={`nav-link ${isActive('/members')}`} to="/members">
                        <i className="ti ti-box-seam"></i>
                        <span className="nav-text">Utilisateur</span>
                    </Link>
                </li>

                <li className="px-4 pt-4 pb-2"><small className="nav-text">Autre</small></li>
                <li>
                    <Link className="nav-link" to="/signup">
                        <i className="ti ti-user-plus"></i>
                        <span className="nav-text">Se déconnecter</span>
                    </Link>
                </li>
            </ul>
        </aside>
    );
};

export default Sidebar;
