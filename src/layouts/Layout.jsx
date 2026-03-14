import React from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const Layout = ({ children }) => {
    return (
        <>
            <div id="overlay" className="overlay"></div>
            <Navbar />
            <Sidebar />
            <main id="content" className="content py-10">
                <div className="container-fluid">
                    {children}
                </div>
            </main>
        </>
    );
};

export default Layout;
