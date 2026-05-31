import React, { useMemo, useState } from 'react';

const MembersPage = () => {
    const [members, setMembers] = useState([
        { id: 1, name: 'Alice Member', email: 'alice@company.com', role: 'Administrateur', lastLogin: 'Il y a 2 heures', status: 'Actif' },
        { id: 2, name: 'Bob Editor', email: 'bob@company.com', role: 'Éditeur', lastLogin: 'Hier', status: 'Actif' },
        { id: 3, name: 'Charlie Viewer', email: 'charlie@company.com', role: 'Lecteur', lastLogin: 'Il y a 3 jours', status: 'Actif' },
    ]);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [currentMember, setCurrentMember] = useState({ id: null, name: '', email: '', role: 'Éditeur', lastLogin: 'Jamais', status: 'Actif' });

    const activeMembers = useMemo(
        () => members.filter((member) => member.status === 'Actif'),
        [members]
    );

    const openCreateModal = () => {
        setModalMode('create');
        setCurrentMember({ id: null, name: '', email: '', role: 'Éditeur', lastLogin: 'Jamais', status: 'Actif' });
        setShowModal(true);
    };

    const openEditModal = (member) => {
        setModalMode('edit');
        setCurrentMember(member);
        setShowModal(true);
    };

    const handleSaveMember = (e) => {
        e.preventDefault();
        if (modalMode === 'edit') {
            setMembers((prev) => prev.map((member) =>
                member.id === currentMember.id ? currentMember : member
            ));
        } else {
            const newMember = {
                ...currentMember,
                id: members.length + 1,
                lastLogin: 'Jamais',
                status: 'Actif',
            };
            setMembers((prev) => [...prev, newMember]);
        }
        setShowModal(false);
    };

    const handleDeleteMember = (memberId) => {
        setMembers((prev) => prev.map((member) =>
            member.id === memberId ? { ...member, status: 'Inactif' } : member
        ));
    };

    return (
        <div className="container-fluid py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="h3 mb-0">Utilisateurs du Compte</h1>
                    <p className="text-muted small mb-0">Gérez les membres et leurs accès</p>
                </div>
                <button
                    className="btn btn-primary d-flex align-items-center gap-2"
                    onClick={openCreateModal}
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
                                {activeMembers.length > 0 ? (
                                    activeMembers.map((member) => (
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
                                                <button
                                                    className="btn btn-link btn-sm text-secondary p-0 me-2"
                                                    onClick={() => openEditModal(member)}
                                                >
                                                    <i className="ti ti-pencil fs-5"></i>
                                                </button>
                                                <button
                                                    className="btn btn-link btn-sm text-danger p-0"
                                                    onClick={() => handleDeleteMember(member.id)}
                                                >
                                                    <i className="ti ti-user-minus fs-5"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-5 text-muted">
                                            Aucun membre actif trouvé.
                                        </td>
                                    </tr>
                                )}
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
                                <h5 className="modal-title fw-bold">{modalMode === 'edit' ? 'Modifier un membre' : 'Nouvel Accès Utilisateur'}</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleSaveMember}>
                                <div className="modal-body p-4">
                                    <div className="mb-3">
                                        <label className="form-label small fw-semibold">Nom Complet</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Ex: Alice Liddell"
                                            required
                                            value={currentMember.name}
                                            onChange={(e) => setCurrentMember({ ...currentMember, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-semibold">Adresse Email Professionnelle</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            placeholder="alice@entreprise.com"
                                            required
                                            value={currentMember.email}
                                            onChange={(e) => setCurrentMember({ ...currentMember, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-semibold">Rôle / Niveau d'accès</label>
                                        <select
                                            className="form-select"
                                            value={currentMember.role}
                                            onChange={(e) => setCurrentMember({ ...currentMember, role: e.target.value })}
                                        >
                                            <option value="Administrateur">Administrateur (Accès total)</option>
                                            <option value="Éditeur">Éditeur (Modifications limitées)</option>
                                            <option value="Lecteur">Lecteur (Consultation seule)</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-footer border-top-0 pb-4 px-4">
                                    <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Annuler</button>
                                    <button type="submit" className="btn btn-primary px-4">
                                        {modalMode === 'edit' ? 'Enregistrer les modifications' : "Donner l'accès"}
                                    </button>
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
