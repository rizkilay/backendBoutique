import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

const StoresPage = () => {
    const { authFetch } = useAuth();

    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [saving, setSaving] = useState(false);
    const [modalError, setModalError] = useState('');
    const [currentStore, setCurrentStore] = useState({
        id: null, name: '', city: '', neighborhood: '', phone: '', manager: '', status: 'Actif'
    });

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [storeToDelete, setStoreToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const showSuccess = (msg) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(''), 4000);
    };

    const fetchStores = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await authFetch('/api/stores');
            if (!res.ok) throw new Error('Erreur lors du chargement des boutiques');
            const data = await res.json();
            setStores(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [authFetch]);

    useEffect(() => {
        fetchStores();
    }, [fetchStores]);

    const filteredStores = useMemo(() => {
        const normalized = searchTerm.trim().toLowerCase();
        if (!normalized) return stores;
        return stores.filter((store) =>
            store.name.toLowerCase().includes(normalized) ||
            (store.city || '').toLowerCase().includes(normalized) ||
            (store.neighborhood || '').toLowerCase().includes(normalized) ||
            (store.manager || '').toLowerCase().includes(normalized)
        );
    }, [searchTerm, stores]);

    const openCreateModal = () => {
        setModalMode('create');
        setModalError('');
        setCurrentStore({ id: null, name: '', city: '', neighborhood: '', phone: '', manager: '', status: 'Actif' });
        setShowModal(true);
    };

    const openEditModal = (store) => {
        setModalMode('edit');
        setModalError('');
        setCurrentStore({ ...store });
        setShowModal(true);
    };

    const handleSaveStore = async (e) => {
        e.preventDefault();
        setSaving(true);
        setModalError('');

        try {
            let res;
            if (modalMode === 'edit') {
                res = await authFetch(`/api/stores/${currentStore.id}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        name: currentStore.name,
                        city: currentStore.city,
                        neighborhood: currentStore.neighborhood,
                        phone: currentStore.phone,
                        manager: currentStore.manager,
                        status: currentStore.status
                    })
                });
            } else {
                res = await authFetch('/api/stores', {
                    method: 'POST',
                    body: JSON.stringify({
                        name: currentStore.name,
                        city: currentStore.city,
                        neighborhood: currentStore.neighborhood,
                        phone: currentStore.phone,
                        manager: currentStore.manager
                    })
                });
            }

            const data = await res.json();
            if (!res.ok) {
                setModalError(data.error || 'Une erreur est survenue');
                return;
            }

            setShowModal(false);
            await fetchStores();
            showSuccess(modalMode === 'edit'
                ? `Boutique "${data.name}" modifiée avec succès`
                : `Boutique "${data.name}" créée avec succès`
            );
        } catch (err) {
            setModalError('Erreur réseau. Vérifiez votre connexion.');
        } finally {
            setSaving(false);
        }
    };

    const confirmDelete = (store) => {
        setStoreToDelete(store);
        setShowDeleteConfirm(true);
    };

    const handleDeleteStore = async () => {
        if (!storeToDelete) return;
        setDeleting(true);
        try {
            const res = await authFetch(`/api/stores/${storeToDelete.id}`, { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Erreur lors de la suppression');
            } else {
                setShowDeleteConfirm(false);
                setStoreToDelete(null);
                await fetchStores();
                showSuccess(data.message || 'Boutique supprimée avec succès');
            }
        } catch (err) {
            setError('Erreur réseau lors de la suppression');
        } finally {
            setDeleting(false);
        }
    };

    const getStatusBadge = (status) => {
        return status === 'Actif'
            ? 'bg-success-subtle text-success'
            : 'bg-secondary-subtle text-secondary';
    };

    const activeCount = stores.filter(s => s.status === 'Actif').length;
    const inactiveCount = stores.filter(s => s.status === 'Inactif').length;

    return (
        <div className="container-fluid py-4">
            {/* Header */}
            <div className="mb-3">
                <h1 className="h3 mb-0">Boutiques</h1>
                <p className="text-muted small mb-0">Gérez l'ensemble de vos points de vente</p>
            </div>

            {/* Statistiques rapides */}
            {!loading && (
                <div className="row g-3 mb-4">
                    <div className="col-auto">
                        <div className="d-flex align-items-center gap-2 px-3 py-2 bg-light rounded-3">
                            <i className="ti ti-building-store text-primary"></i>
                            <span className="small fw-medium">{stores.length} boutique{stores.length > 1 ? 's' : ''} au total</span>
                        </div>
                    </div>
                    <div className="col-auto">
                        <div className="d-flex align-items-center gap-2 px-3 py-2 bg-success-subtle rounded-3">
                            <span className="badge bg-success rounded-circle p-1"></span>
                            <span className="small fw-medium text-success">{activeCount} active{activeCount > 1 ? 's' : ''}</span>
                        </div>
                    </div>
                    {inactiveCount > 0 && (
                        <div className="col-auto">
                            <div className="d-flex align-items-center gap-2 px-3 py-2 bg-secondary-subtle rounded-3">
                                <span className="badge bg-secondary rounded-circle p-1"></span>
                                <span className="small fw-medium text-secondary">{inactiveCount} inactive{inactiveCount > 1 ? 's' : ''}</span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Barre de recherche + bouton */}
            <div className="d-flex justify-content-between align-items-center mb-4 gap-3 flex-wrap">
                <div className="input-group" style={{ maxWidth: '400px', flex: 1 }}>
                    <span className="input-group-text bg-white border-end-0">
                        <i className="ti ti-search"></i>
                    </span>
                    <input
                        type="search"
                        className="form-control border-start-0"
                        placeholder="Rechercher une boutique..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button
                    className="btn btn-primary d-flex align-items-center gap-2"
                    onClick={openCreateModal}
                >
                    <i className="ti ti-building-store fs-5"></i>
                    <span>Ajouter une boutique</span>
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
                            <p className="text-muted mt-2 small">Chargement des boutiques...</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="px-4 py-3 border-0">Informations</th>
                                        <th className="py-3 border-0">Gérant</th>
                                        <th className="py-3 border-0">Téléphone</th>
                                        <th className="py-3 border-0">Statut</th>
                                        <th className="px-4 py-3 border-0 text-end">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStores.length > 0 ? (
                                        filteredStores.map((store) => (
                                            <tr key={store.id}>
                                                <td className="px-4 py-3">
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div
                                                            className="avatar avatar-sm rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center fw-bold"
                                                            style={{ width: 40, height: 40, fontSize: 16, flexShrink: 0 }}
                                                        >
                                                            {store.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="fw-medium">{store.name}</div>
                                                            <div className="text-muted small">
                                                                {[store.city, store.neighborhood].filter(Boolean).join(', ') || '—'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3">{store.manager || <span className="text-muted">—</span>}</td>
                                                <td className="py-3 text-muted small">{store.phone || '—'}</td>
                                                <td className="py-3">
                                                    <span className={`badge ${getStatusBadge(store.status)}`}>
                                                        {store.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-end">
                                                    <button
                                                        className="btn btn-link btn-sm text-secondary p-0 me-2"
                                                        title="Modifier"
                                                        onClick={() => openEditModal(store)}
                                                    >
                                                        <i className="ti ti-pencil fs-5"></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-link btn-sm text-danger p-0"
                                                        title="Supprimer"
                                                        onClick={() => confirmDelete(store)}
                                                    >
                                                        <i className="ti ti-trash fs-5"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="text-center py-5 text-muted">
                                                <i className="ti ti-building-store fs-1 d-block mb-2 opacity-25"></i>
                                                {searchTerm
                                                    ? `Aucune boutique trouvée pour "${searchTerm}"`
                                                    : 'Aucune boutique. Commencez par en créer une.'}
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
                                    {modalMode === 'edit' ? 'Modifier la boutique' : 'Nouvelle boutique'}
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleSaveStore}>
                                <div className="modal-body p-4">
                                    {modalError && (
                                        <div className="alert alert-danger py-2 small mb-3">
                                            <i className="ti ti-alert-circle me-1"></i>
                                            {modalError}
                                        </div>
                                    )}

                                    <div className="mb-3">
                                        <label className="form-label small fw-semibold">Nom de la boutique *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Ex: Boutique Centrale"
                                            required
                                            value={currentStore.name}
                                            onChange={(e) => setCurrentStore({ ...currentStore, name: e.target.value })}
                                        />
                                    </div>

                                    <div className="row g-3">
                                        <div className="col-6">
                                            <label className="form-label small fw-semibold">Ville</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Ex: Antananarivo"
                                                value={currentStore.city}
                                                onChange={(e) => setCurrentStore({ ...currentStore, city: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-6">
                                            <label className="form-label small fw-semibold">Quartier</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Ex: Isoraka"
                                                value={currentStore.neighborhood}
                                                onChange={(e) => setCurrentStore({ ...currentStore, neighborhood: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="row g-3 mt-0">
                                        <div className="col-6">
                                            <label className="form-label small fw-semibold">Gérant</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Ex: Lina"
                                                value={currentStore.manager}
                                                onChange={(e) => setCurrentStore({ ...currentStore, manager: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-6">
                                            <label className="form-label small fw-semibold">Téléphone</label>
                                            <input
                                                type="tel"
                                                className="form-control"
                                                placeholder="Ex: +261 34 00 000 00"
                                                value={currentStore.phone}
                                                onChange={(e) => setCurrentStore({ ...currentStore, phone: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {modalMode === 'edit' && (
                                        <div className="mt-3">
                                            <label className="form-label small fw-semibold">Statut</label>
                                            <select
                                                className="form-select"
                                                value={currentStore.status}
                                                onChange={(e) => setCurrentStore({ ...currentStore, status: e.target.value })}
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
                                            modalMode === 'edit' ? 'Enregistrer les modifications' : 'Créer la boutique'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Confirmation Suppression */}
            {showDeleteConfirm && storeToDelete && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered modal-sm">
                        <div className="modal-content border-0 shadow">
                            <div className="modal-body p-4 text-center">
                                <div
                                    className="avatar rounded-circle bg-danger bg-opacity-10 text-danger d-flex align-items-center justify-content-center mx-auto mb-3"
                                    style={{ width: 60, height: 60, fontSize: 24 }}
                                >
                                    <i className="ti ti-trash"></i>
                                </div>
                                <h6 className="fw-bold mb-1">Supprimer cette boutique ?</h6>
                                <p className="text-muted small mb-4">
                                    <strong>{storeToDelete.name}</strong> sera définitivement supprimée.
                                    Cette action est irréversible.
                                </p>
                                <div className="d-flex gap-2 justify-content-center">
                                    <button
                                        className="btn btn-light"
                                        onClick={() => { setShowDeleteConfirm(false); setStoreToDelete(null); }}
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        className="btn btn-danger"
                                        onClick={handleDeleteStore}
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

export default StoresPage;
