import React, { useMemo, useState } from 'react';

const StoresPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [stores, setStores] = useState([
        { id: 1, name: 'Boutique Centrale', city: 'Antananarivo', neighborhood: 'Isoraka', manager: 'Lina', status: 'Actif' },
        { id: 2, name: 'Boutique Est', city: 'Toamasina', neighborhood: 'Ambodivona', manager: 'Samy', status: 'Actif' },
        { id: 3, name: 'Boutique Sud', city: 'Fianarantsoa', neighborhood: 'Ambozontany', manager: 'Natacha', status: 'Inactif' },
        { id: 4, name: 'Boutique Ouest', city: 'Mahajanga', neighborhood: 'Ankoarivo', manager: 'Hery', status: 'Actif' },
    ]);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [currentStore, setCurrentStore] = useState({ id: null, name: '', city: '', manager: '', status: 'Actif' });

    const activeStores = useMemo(
        () => stores.filter((store) => store.status === 'Actif'),
        [stores]
    );

    const filteredStores = useMemo(() => {
        const normalized = searchTerm.trim().toLowerCase();
        if (!normalized) return activeStores;
        return activeStores.filter((store) =>
            store.name.toLowerCase().includes(normalized) ||
            store.city.toLowerCase().includes(normalized) ||
            store.neighborhood.toLowerCase().includes(normalized) ||
            store.manager.toLowerCase().includes(normalized)
        );
    }, [searchTerm, activeStores]);

    const openCreateModal = () => {
        setModalMode('create');
        setCurrentStore({ id: null, name: '', city: '', manager: '', status: 'Actif' });
        setShowModal(true);
    };

    const openEditModal = (store) => {
        setModalMode('edit');
        setCurrentStore(store);
        setShowModal(true);
    };

    const handleSaveStore = (e) => {
        e.preventDefault();
        if (modalMode === 'edit') {
            setStores((prev) => prev.map((store) =>
                store.id === currentStore.id ? currentStore : store
            ));
        } else {
            const newStore = {
                ...currentStore,
                id: stores.length + 1,
                status: 'Actif',
            };
            setStores((prev) => [...prev, newStore]);
        }
        setShowModal(false);
    };

    const handleDeleteStore = (storeId) => {
        setStores((prev) => prev.map((store) =>
            store.id === storeId ? { ...store, status: 'Inactif' } : store
        ));
    };

    return (
        <div className="container-fluid py-4">
            
            <div className="mb-3">
                <h1 className="h3 mb-0">Boutiques</h1>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-4 gap-3 flex-wrap">

                <div className="input-group" style={{ maxWidth: "400px", flex: 1 }}>
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

            <div className="card border-0 shadow-sm">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th className="px-4 py-3 border-0">Information complète</th>
                                    <th className="py-3 border-0">Gérant</th>
                                    <th className="py-3 border-0 text-center">Nbr de vendeurs</th>
                                    <th className="py-3 border-0">Statut</th>
                                    <th className="px-4 py-3 border-0 text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStores.length > 0 ? (
                                    filteredStores.map((store) => (
                                        <tr key={store.id}>
                                            <td className="px-4">
                                                <div className="d-flex  gap-3">
                                                    <div className="avatar avatar-sm rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center fw-bold">
                                                        {store.name.charAt(0)}
                                                    </div>
                                                    <div className="d-flex flex-column justify-content-between" style={{ minHeight: '48px' }}>
                                                        <div className="fw-medium">{store.name}</div>
                                                        <div className="text-muted small">
                                                            <div>Ville: {store.city}</div>
                                                            <div>Quartier: {store.neighborhood}</div>
                                                            <div>Téléphone: {store.phone}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3">{store.manager}</td>
                                            <td className="py-3 text-center">3</td>
                                            <td className="py-3">
                                                <span className={`badge ${store.status === 'Actif' ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}`}>
                                                    {store.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-end">
                                                <button
                                                    className="btn btn-link btn-sm text-secondary p-0 me-2"
                                                    onClick={() => openEditModal(store)}
                                                >
                                                    <i className="ti ti-pencil fs-5"></i>
                                                </button>
                                                <button
                                                    className="btn btn-link btn-sm text-danger p-0"
                                                    onClick={() => handleDeleteStore(store.id)}
                                                >
                                                    <i className="ti ti-trash fs-5"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-5 text-muted">
                                            Aucune boutique active trouvée pour cette recherche.
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
                                <h5 className="modal-title fw-bold">{modalMode === 'edit' ? 'Modifier la boutique' : 'Nouvelle boutique'}</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleSaveStore}>
                                <div className="modal-body p-4">
                                    <div className="mb-3">
                                        <label className="form-label small fw-semibold">Nom de la boutique</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Ex: Boutique Centrale"
                                            required
                                            value={currentStore.name}
                                            onChange={(e) => setCurrentStore({ ...currentStore, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-semibold">Ville</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Ex: Antananarivo"
                                            required
                                            value={currentStore.city}
                                            onChange={(e) => setCurrentStore({ ...currentStore, city: e.target.value })}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-semibold">Quartier</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Ex: Isoraka"
                                            required
                                            value={currentStore.neighborhood}
                                            onChange={(e) => setCurrentStore({ ...currentStore, neighborhood: e.target.value })}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-semibold">Gérant</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Ex: Lina"
                                            required
                                            value={currentStore.manager}
                                            onChange={(e) => setCurrentStore({ ...currentStore, manager: e.target.value })}
                                        />
                                    </div>
                                    {modalMode === 'edit' && (
                                        <div className="mb-0">
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
                                    <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Annuler</button>
                                    <button type="submit" className="btn btn-primary px-4">
                                        {modalMode === 'edit' ? 'Enregistrer les modifications' : 'Créer la boutique'}
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

export default StoresPage;
