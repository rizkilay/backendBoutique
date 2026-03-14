import React from 'react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { logout } = useAuth();

    return (
        <nav id="topbar" className="navbar bg-white border-bottom fixed-top topbar px-3">
            <button id="toggleBtn" className="d-none d-lg-inline-flex btn btn-light btn-icon btn-sm">
                <i className="ti ti-layout-sidebar-left-expand"></i>
            </button>

            <button id="mobileBtn" className="btn btn-light btn-icon btn-sm d-lg-none me-2">
                <i className="ti ti-layout-sidebar-left-expand"></i>
            </button>

            <div>
                <ul className="list-unstyled d-flex align-items-center mb-0 gap-1">
                    <li className="ms-3 dropdown">
                        <a href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <img src="/assets/images/avatar/avatar-1.jpg" alt="" className="avatar avatar-sm rounded-circle" />
                        </a>
                        <div className="dropdown-menu dropdown-menu-end p-0" style={{ minWidth: '200px' }}>
                            <div>
                                <div className="d-flex gap-3 align-items-center border-dashed border-bottom px-3 py-3">
                                    <img src="/assets/images/avatar/avatar-1.jpg" alt="" className="avatar avatar-md rounded-circle" />
                                    <div>
                                        <h4 className="mb-0 small">Shrina Tesla</h4>
                                        <p className="mb-0 small">@imshrina</p>
                                    </div>
                                </div>
                                <div className="p-3 d-flex flex-column gap-1 small lh-lg">
                                    <a href="#!" className=""><span>Home</span></a>
                                    <a href="#!" className=""><span>Account Settings</span></a>
                                    <button onClick={logout} className="btn btn-link p-0 text-start text-danger text-decoration-none small">
                                        <span>Logout</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
