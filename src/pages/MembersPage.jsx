import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const MembersPage = () => {
    const { authFetch, user: currentUser } = useAuth();

    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [saving, setSaving] = useState(false);
    const [modalError, setModalError] = useState('');
    const [currentMember, setCurrentMember] = useState({
        id: null, name: '', email: '', password: '', role: 'Éditeur', status: 'Actif'
    });

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [memberToDelete, setMemberToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const showSuccess = (msg) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(''), 4000);
    };

    const fetchMembers = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await authFetch('/api/members');
            if (!res.ok) throw new Error('Erreur lors du chargement des membres');
            const data = await res.json();
            setMembers(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [authFetch]);

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    const formatLastLogin = (dateStr) => {
        if (!dateStr) return 'Jamais';
        const date = new Date(dateStr);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);
        if (diff < 60) return 'À l\'instant';
        if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
        if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
        if (diff < 172800) return 'Hier';
        return date.toLocaleDateString('fr-FR');
    };

    const openCreateModal = () => {
        setModalMode('create');
        setModalError('');
        setCurrentMember({ id: null, name: '', email: '', password: '', role: 'Éditeur', status: 'Actif' });
        setShowModal(true);
    };

    const openEditModal = (member) => {
        setModalMode('edit');
        setModalError('');
        setCurrentMember({ ...member, password: '' });
        setShowModal(true);
    };

    const handleSaveMember = async (e) => {
        e.preventDefault();
        setSaving(true);
        setModalError('');

        try {
            let res;
            if (modalMode === 'edit') {
                res = await authFetch(`/api/members/${currentMember.id}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        name: currentMember.name,
                        email: currentMember.email,
                        role: currentMember.role,
                        status: currentMember.status,
                        password: currentMember.password || undefined
                    })
                });
            } else {
                if (!currentMember.password) {
                    setModalError('Le mot de passe est requis pour créer un membre');
                    setSaving(false);
                    return;
                }
                res = await authFetch('/api/members', {
                    method: 'POST',
                    body: JSON.stringify({
                        name: currentMember.name,
                        email: currentMember.email,
                        password: currentMember.password,
                        role: currentMember.role
                    })
                });
            }

            const data = await res.json();
            if (!res.ok) {
                setModalError(data.error || 'Une erreur est survenue');
                return;
            }

            setShowModal(false);
            await fetchMembers();
            showSuccess(modalMode === 'edit'
                ? `Membre "${data.name}" modifié avec succès`
                : `Membre "${data.name}" créé avec succès`
            );
        } catch (err) {
            setModalError('Erreur réseau. Vérifiez votre connexion.');
        } finally {
            setSaving(false);
        }
    };

    const confirmDelete = (member) => {
        setMemberToDelete(member);
        setShowDeleteConfirm(true);
    };

    const handleDeleteMember = async () => {
        if (!memberToDelete) return;
        setDeleting(true);
        try {
            const res = await authFetch(`/api/members/${memberToDelete.id}`, { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Erreur lors de la suppression');
            } else {
                setShowDeleteConfirm(false);
                setMemberToDelete(null);
                await fetchMembers();
                showSuccess(data.message || 'Membre supprimé avec succès');
            }
        } catch (err) {
            setError('Erreur réseau lors de la suppression');
        } finally {
            setDeleting(false);
        }
    };

    const getRoleBadge = (role) => {
        const map = {
            'Administrateur': 'bg-danger-subtle text-danger border-danger',
            'Éditeur': 'bg-primary-subtle text-primary border-primary',
            'Lecteur': 'bg-secondary-subtle text-secondary border-secondary'
        };
        return map[role] || 'bg-light text-dark';
    };

    const getStatusBadge = (status) => {
        return status === 'Actif'
            ? 'bg-success-subtle text-success'
            : 'bg-warning-subtle text-warning';
    };

    const getInitials = (name) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <div className="container-fluid py-4">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="h3 mb-0">Utilisateurs du Compte</h1>
                    <p className="text-muted small mb-0">Gérez les membres et leurs accès au back-office</p>
                </div>
                <button
                    className="btn btn-primary d-flex align-items-center gap-2"
                    onClick={openCreateModal}
                >
                    <i className="ti ti-user-plus fs-5"></i>
                    <span>Ajouter un membre</span>
                </button>
            </div>

            {/* Messages de feedback */}
            {successMsg && (
                <div className="alert alert-success d-flex align-items-center gap-2 py-2 mb-3">
                    <i className="ti ti-circle-check fs-5"></i>
                    <span>{successMsg}</span>
                </div>
            )}
            {error && (
                <div className="alert alert-danger d-flex align-items-center gap-2 py-2 mb-3">
                    <i className="ti ti-alert-circle fs-5"></i>
                    <span>{error}</span>
                    <button type="button" className="btn-close ms-auto" onClick={() => setError('')}></button>
                </div>
            )}

            {/* Table */}
            <div className="card border-0 shadow-sm">
                <div className="card-body p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Chargement...</span>
                            </div>
                            <p className="text-muted mt-2 small">Chargement des membres...</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="px-4 py-3 border-0">Membre</th>
                                        <th className="py-3 border-0">Email</th>
                                        <th className="py-3 border-0">Rôle</th>
                                        <th className="py-3 border-0">Statut</th>
                                        <th className="py-3 border-0">Dernière Connexion</th>
                                        <th className="px-4 py-3 border-0 text-end">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {members.length > 0 ? (
                                        members.map((member) => (
                                            <tr key={member.id}>
                                                <td className="px-4 py-3">
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div
                                                            className="avatar avatar-sm rounded-circle bg-info bg-opacity-10 text-info d-flex align-items-center justify-content-center fw-bold"
                                                            style={{ width: 36, height: 36, fontSize: 13 }}
                                                        >
                                                            {getInitials(member.name)}
                                                        </div>
                                                        <div>
                                                            <div className="fw-medium">{member.name}</div>
                                                            {currentUser && currentUser.id === member.id && (
                                                                <span className="badge bg-info-subtle text-info border border-info" style={{ fontSize: 10 }}>Vous</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 text-secondary">{member.email}</td>
                                                <td className="py-3">
                                                    <span className={`badge border ${getRoleBadge(member.role)}`}>
                                                        {member.role}
                                                    </span>
                                                </td>
                                                <td className="py-3">
                                                    <span className={`badge ${getStatusBadge(member.status)}`}>
                                                        {member.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 text-muted small">{formatLastLogin(member.last_login)}</td>
                                                <td className="px-4 py-3 text-end">
                                                    <button
                                                        className="btn btn-link btn-sm text-secondary p-0 me-2"
                                                        title="Modifier"
                                                        onClick={() => openEditModal(member)}
                                                    >
                                                        <i className="ti ti-pencil fs-5"></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-link btn-sm text-danger p-0"
                                                        title="Supprimer"
                                                        onClick={() => confirmDelete(member)}
                                                        disabled={currentUser && currentUser.id === member.id}
                                                    >
                                                        <i className="ti ti-user-minus fs-5"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center py-5 text-muted">
                                                <i className="ti ti-users-group fs-1 d-block mb-2 opacity-25"></i>
                                                Aucun membre trouvé.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Créer / Modifier */}
            {showModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow">
                            <div className="modal-header border-bottom-0 pt-4 px-4">
                                <h5 className="modal-title fw-bold">
                                    {modalMode === 'edit' ? 'Modifier le membre' : 'Nouvel Accès Utilisateur'}
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleSaveMember}>
                                <div className="modal-body p-4">
                                    {modalError && (
                                        <div className="alert alert-danger py-2 small mb-3">
                                            <i className="ti ti-alert-circle me-1"></i>
                                            {modalError}
                                        </div>
                                    )}

                                    <div className="mb-3">
                                        <label className="form-label small fw-semibold">Nom Complet *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Ex: Alice Dupont"
                                            required
                                            value={currentMember.name}
                                            onChange={(e) => setCurrentMember({ ...currentMember, name: e.target.value })}
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label small fw-semibold">Adresse Email *</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            placeholder="alice@boutique.com"
                                            required
                                            value={currentMember.email}
                                            onChange={(e) => setCurrentMember({ ...currentMember, email: e.target.value })}
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label small fw-semibold">
                                            {modalMode === 'edit'
                                                ? 'Nouveau mot de passe (laisser vide pour ne pas changer)'
                                                : 'Mot de passe *'}
                                        </label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            placeholder={modalMode === 'edit' ? '••••••••' : 'Minimum 6 caractères'}
                                            required={modalMode === 'create'}
                                            minLength="6"
                                            value={currentMember.password}
                                            onChange={(e) => setCurrentMember({ ...currentMember, password: e.target.value })}
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

                                    {modalMode === 'edit' && (
                                        <div className="mb-0">
                                            <label className="form-label small fw-semibold">Statut</label>
                                            <select
                                                className="form-select"
                                                value={currentMember.status}
                                                onChange={(e) => setCurrentMember({ ...currentMember, status: e.target.value })}
                                            >
                                                <option value="Actif">Actif</option>
                                                <option value="Inactif">Inactif</option>
                                            </select>
                                        </div>
                                    )}
                                </div>
                                <div className="modal-footer border-top-0 pb-4 px-4">
                                    <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>
                                        Annuler
                                    </button>
                                    <button type="submit" className="btn btn-primary px-4" disabled={saving}>
                                        {saving ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Enregistrement...
                                            </>
                                        ) : (
                                            modalMode === 'edit' ? 'Enregistrer les modifications' : "Créer le membre"
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Confirmation Suppression */}
            {showDeleteConfirm && memberToDelete && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered modal-sm">
                        <div className="modal-content border-0 shadow">
                            <div className="modal-body p-4 text-center">
                                <div className="avatar avatar-lg rounded-circle bg-danger bg-opacity-10 text-danger d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: 60, height: 60, fontSize: 24 }}>
                                    <i className="ti ti-user-minus"></i>
                                </div>
                                <h6 className="fw-bold mb-1">Supprimer ce membre ?</h6>
                                <p className="text-muted small mb-4">
                                    <strong>{memberToDelete.name}</strong> sera définitivement supprimé et ne pourra plus se connecter.
                                </p>
                                <div className="d-flex gap-2 justify-content-center">
                                    <button
                                        className="btn btn-light"
                                        onClick={() => { setShowDeleteConfirm(false); setMemberToDelete(null); }}
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        className="btn btn-danger"
                                        onClick={handleDeleteMember}
                                        disabled={deleting}
                                    >
                                        {deleting ? (
                                            <span className="spinner-border spinner-border-sm"></span>
                                        ) : 'Supprimer'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MembersPage;
