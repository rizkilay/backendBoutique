import React, { useState } from 'react';

const MembersPage = () => {
    const [members, setMembers] = useState([
        { id: 1, name: 'Alice Member', email: 'alice@company.com', role: 'Administrateur', lastLogin: 'Il y a 2 heures' },
        { id: 2, name: 'Bob Editor', email: 'bob@company.com', role: 'Éditeur', lastLogin: 'Hier' },
        { id: 3, name: 'Charlie Viewer', email: 'charlie@company.com', role: 'Lecteur', lastLogin: 'Il y a 3 jours' },
    ]);

    const [showModal, setShowModal] = useState(false);
    const [newMember, setNewMember] = useState({ name: '', email: '', role: 'Éditeur' });

    const handleAddMember = (e) => {
        e.preventDefault();
        const memberWithId = { ...newMember, id: members.length + 1, lastLogin: 'Jamais' };
        setMembers([...members, memberWithId]);
        setNewMember({ name: '', email: '', role: 'Éditeur' });
        setShowModal(false);
    };

    return (
        <div className="container-fluid py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="h3 mb-0">Utilisateurs du Compte</h1>
                    <p className="text-muted small mb-0">Gérez les personnes qui ont accès à ce tableau de bord.</p>
                </div>
                <button
                    className="btn btn-primary d-flex align-items-center gap-2"
                    onClick={() => setShowModal(true)}
                >
                    <i className="ti ti-user-plus fs-4"></i>
                    <span>Ajouter un membre</span>
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
                                    <th className="py-3 border-0">Dernière Connexion</th>
                                    <th className="px-4 py-3 border-0 text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {members.map((member) => (
                                    <tr key={member.id}>
                                        <td className="px-4 py-3">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="avatar avatar-sm rounded-circle bg-info bg-opacity-10 text-info d-flex align-items-center justify-content-center fw-bold">
                                                    {member.name.charAt(0)}
                                                </div>
                                                <span className="fw-medium">{member.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 text-secondary">{member.email}</td>
                                        <td className="py-3">
                                            <span className={`badge border ${member.role === 'Administrateur' ? 'bg-primary-subtle text-primary border-primary' : 'bg-light text-dark'}`}>
                                                {member.role}
                                            </span>
                                        </td>
                                        <td className="py-3 text-muted small">{member.lastLogin}</td>
                                        <td className="px-4 py-3 text-end">
                                            <button className="btn btn-link btn-sm text-secondary p-0 me-2"><i className="ti ti-settings fs-5"></i></button>
                                            <button className="btn btn-link btn-sm text-danger p-0"><i className="ti ti-user-minus fs-5"></i></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow">
                            <div className="modal-header border-bottom-0 pt-4 px-4">
                                <h5 className="modal-title fw-bold">Nouvel Accès Utilisateur</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleAddMember}>
                                <div className="modal-body p-4">
                                    <div className="mb-3">
                                        <label className="form-label small fw-semibold">Nom Complet</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Ex: Alice Liddell"
                                            required
                                            value={newMember.name}
                                            onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-semibold">Adresse Email Professionnelle</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            placeholder="alice@entreprise.com"
                                            required
                                            value={newMember.email}
                                            onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="mb-0">
                                        <label className="form-label small fw-semibold">Rôle / Niveau d'accès</label>
                                        <select
                                            className="form-select"
                                            value={newMember.role}
                                            onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                                        >
                                            <option value="Administrateur">Administrateur (Accès total)</option>
                                            <option value="Éditeur">Éditeur (Modifications limitées)</option>
                                            <option value="Lecteur">Lecteur (Consultation seule)</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-footer border-top-0 pb-4 px-4">
                                    <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Annuler</button>
                                    <button type="submit" className="btn btn-primary px-4">Donner l'accès</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MembersPage;
