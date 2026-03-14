import React, { useState } from 'react';

const UserPage = () => {
    const [users, setUsers] = useState([
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active' },
        { id: 3, name: 'Robert Johnson', email: 'robert@example.com', role: 'Editor', status: 'Inactive' },
    ]);

    const [showModal, setShowModal] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', role: 'User' });

    const handleCreateUser = (e) => {
        e.preventDefault();
        const userWithId = { ...newUser, id: users.length + 1, status: 'Active' };
        setUsers([...users, userWithId]);
        setNewUser({ name: '', email: '', role: 'User' });
        setShowModal(false);
    };

    return (
        <div className="container-fluid py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="h3 mb-0">Liste des Utilisateurs</h1>
                    <p className="text-muted small mb-0">Gérez vos clients et membres d'équipe ici.</p>
                </div>
                <button
                    className="btn btn-primary d-flex align-items-center gap-2"
                    onClick={() => setShowModal(true)}
                >
                    <i className="ti ti-plus fs-4"></i>
                    <span>Créer un utilisateur</span>
                </button>
            </div>

            <div className="card border-0 shadow-sm">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th className="px-4 py-3 border-0">Nom</th>
                                    <th className="py-3 border-0">Email</th>
                                    <th className="py-3 border-0">Rôle</th>
                                    <th className="py-3 border-0">Statut</th>
                                    <th className="px-4 py-3 border-0 text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id}>
                                        <td className="px-4 py-3">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="avatar avatar-sm rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center fw-bold">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <span className="fw-medium">{user.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 text-secondary">{user.email}</td>
                                        <td className="py-3">
                                            <span className="badge bg-light text-dark border">{user.role}</span>
                                        </td>
                                        <td className="py-3">
                                            <span className={`badge ${user.status === 'Active' ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-end">
                                            <button className="btn btn-link btn-sm text-secondary p-0 me-2"><i className="ti ti-pencil fs-5"></i></button>
                                            <button className="btn btn-link btn-sm text-danger p-0"><i className="ti ti-trash fs-5"></i></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Basic Bootstrap Modal (Simulated with conditional rendering for simplicity in this React setup) */}
            {showModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow">
                            <div className="modal-header border-bottom-0 pt-4 px-4">
                                <h5 className="modal-title fw-bold">Nouveau Utilisateur</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleCreateUser}>
                                <div className="modal-body p-4">
                                    <div className="mb-3">
                                        <label className="form-label small fw-semibold">Nom Complet</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Ex: Jean Dupont"
                                            required
                                            value={newUser.name}
                                            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-semibold">Adresse Email</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            placeholder="nom@exemple.com"
                                            required
                                            value={newUser.email}
                                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="mb-0">
                                        <label className="form-label small fw-semibold">Rôle</label>
                                        <select
                                            className="form-select"
                                            value={newUser.role}
                                            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                        >
                                            <option value="User">Utilisateur</option>
                                            <option value="Admin">Administrateur</option>
                                            <option value="Editor">Éditeur</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-footer border-top-0 pb-4 px-4">
                                    <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Annuler</button>
                                    <button type="submit" className="btn btn-primary px-4">Créer</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserPage;
