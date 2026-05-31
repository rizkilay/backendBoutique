import React, { useMemo, useState } from 'react';

const VendorsPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const vendors = [
        { id: 1, name: 'Rija Rakoto', email: 'rija@vendeur.com', phone: '+261 34 12 345 67', status: 'Actif' },
        { id: 2, name: 'Miora Raman', email: 'miora@vendeur.com', phone: '+261 33 98 765 43', status: 'Actif' },
        { id: 3, name: 'Haja Andry', email: 'haja@vendeur.com', phone: '+261 32 45 678 90', status: 'Inactif' },
    ];

    const filteredVendors = useMemo(() => {
        const normalized = searchTerm.trim().toLowerCase();
        if (!normalized) return vendors;
        return vendors.filter((vendor) =>
            vendor.name.toLowerCase().includes(normalized) ||
            vendor.email.toLowerCase().includes(normalized) ||
            vendor.phone.toLowerCase().includes(normalized)
        );
    }, [searchTerm]);

    return (
        <div className="container-fluid py-4">
            <div className="mb-3">
                <h1 className="h3 mb-0">Vendeurs</h1>
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

            </div>

            <div className="card border-0 shadow-sm">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th className="px-4 py-3 border-0">Nom</th>
                                    <th className="py-3 border-0">Email</th>
                                    <th className="py-3 border-0">Téléphone</th>
                                    <th className="py-3 border-0">Statut</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredVendors.length > 0 ? (
                                    filteredVendors.map((vendor) => (
                                        <tr key={vendor.id}>
                                            <td className="px-4 py-3">
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="avatar avatar-sm rounded-circle bg-info bg-opacity-10 text-info d-flex align-items-center justify-content-center fw-bold">
                                                        {vendor.name.charAt(0)}
                                                    </div>
                                                    <span className="fw-medium">{vendor.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 text-secondary">{vendor.email}</td>
                                            <td className="py-3">{vendor.phone}</td>
                                            <td className="py-3">
                                                <span className={`badge ${vendor.status === 'Actif' ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}`}>
                                                    {vendor.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center py-5 text-muted">
                                            Aucun vendeur trouvé pour cette recherche.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorsPage;
