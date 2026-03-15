import React, { useEffect, useRef, useState } from 'react';
import ApexCharts from 'apexcharts';

const User = () => {
    const salesPurchaseRef = useRef(null);
    const customerChartRef = useRef(null);
    const [summary, setSummary] = useState({
        today_sales: 0,
        monthly_sales: 0,
        total_expenses: 0,
        available_funds: 0,
        estimated_profit: 0,
        out_of_stock_count: 0,
        total_sales: 0,
        total_purchases: 0,
        history: []
    });
    const [cotisationStats, setCotisationStats] = useState({ summary: {}, recent: [], withdrawals: [] });

    // Modal state
    const [showModal, setShowModal] = useState(null); // 'stockout', 'history', 'cotisation_in', 'cotisation_out'
    const [outOfStockList, setOutOfStockList] = useState([]);

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/inventory-stats');
            const data = await response.json();
            setSummary(data);
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        }
    };

    const fetchCotisationStats = async () => {
        try {
            const response = await fetch('/api/summary');
            const data = await response.json();
            setCotisationStats(data);
        } catch (err) {
            console.error('Failed to fetch cotisation stats:', err);
        }
    };

    const fetchOutOfStockList = async () => {
        try {
            const response = await fetch('/api/out-of-stock');
            const data = await response.json();
            setOutOfStockList(data);
        } catch (err) {
            console.error('Failed to fetch out of stock list:', err);
        }
    };

    useEffect(() => {
        fetchStats();
        fetchCotisationStats();
        const interval = setInterval(() => {
            fetchStats();
            fetchCotisationStats();
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Sales vs Purchase Chart
        if (salesPurchaseRef.current && summary.history) {
            const categories = summary.history.map(h => {
                const d = new Date(h.date);
                return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
            });
            const salesData = summary.history.map(h => h.sales);
            const purchaseData = summary.history.map(h => h.purchases);

            const options = {
                series: [
                    { name: 'Sales', data: salesData.length ? salesData : [0] },
                    { name: 'Purchase', data: purchaseData.length ? purchaseData : [0] },
                ],
                colors: ['#f7a085', '#E66239'],
                chart: {
                    type: 'bar',
                    height: 350,
                    width: '100%',
                    toolbar: { show: false },
                    events: {
                        dataPointSelection: () => setShowModal('history')
                    }
                },
                grid: { borderColor: "#e2e8f0" },
                legend: { show: true, fontFamily: 'Poppins, serif', fontWeight: 500 },
                plotOptions: { bar: { horizontal: false, columnWidth: '85%', borderRadius: 3 } },
                dataLabels: { enabled: false },
                xaxis: {
                    categories: categories.length ? categories : ['-'],
                },
                yaxis: {
                    labels: { formatter: (e) => e.toLocaleString() + ' F' },
                    title: { text: 'Montant (F)' },
                },
                tooltip: { y: { formatter: (val) => val.toLocaleString() + " F" } },
            };
            const chart = new ApexCharts(salesPurchaseRef.current, options);
            chart.render();
            return () => chart.destroy();
        }
    }, [summary.history]);

    useEffect(() => {
        // Cotisation Radial Chart
        if (customerChartRef.current && cotisationStats) {
            const inTotal = cotisationStats.recent?.reduce((sum, c) => sum + (Number(c.amount) || 0), 0) || 0;
            const outTotal = cotisationStats.withdrawals?.reduce((sum, w) => sum + (Number(w.amount) || 0), 0) || 0;
            const total = inTotal + outTotal;
            const inPercent = total > 0 ? Math.round((inTotal / total) * 100) : 0;
            const outPercent = total > 0 ? Math.round((outTotal / total) * 100) : 0;

            const options = {
                series: [inPercent, outPercent],
                chart: { height: 200, type: 'radialBar' },
                colors: ['#5BE49B', '#E66239'],
                plotOptions: {
                    radialBar: {
                        dataLabels: {
                            name: { fontSize: '22px' },
                            value: { fontSize: '16px' },
                        },
                        hollow: { size: '40%' },
                        track: { background: "#f0f0f0", strokeWidth: '45%' },
                    },
                },
                fill: {
                    type: 'gradient',
                    gradient: {
                        shade: 'dark',
                        type: 'vertical',
                        gradientToColors: ['#007867', '#E66239'],
                        stops: [0, 100],
                    },
                },
                stroke: { lineCap: 'round' },
                labels: ['Cotisations', 'Retraits'],
            };
            const chart = new ApexCharts(customerChartRef.current, options);
            chart.render();
            return () => chart.destroy();
        }
    }, [cotisationStats]);

    const renderModal = () => {
        if (!showModal) return null;

        let title = '';
        let content = null;

        if (showModal === 'stockout') {
            title = 'Produits en Rupture de Stock';
            content = (
                <table className="table">
                    <thead>
                        <tr>
                            <th>Produit</th>
                            <th>Catégorie</th>
                            <th>Prix</th>
                        </tr>
                    </thead>
                    <tbody>
                        {outOfStockList.map((p, i) => (
                            <tr key={i}>
                                <td>{p.name}</td>
                                <td>{p.category}</td>
                                <td>{p.price.toLocaleString()} F</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        } else if (showModal === 'cotisation_in') {
            title = 'Détails des Cotisations';
            content = (
                <table className="table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Montant</th>
                            <th>Source</th>
                            <th>Note</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cotisationStats.recent.map((c, i) => (
                            <tr key={i}>
                                <td>{new Date(c.date).toLocaleDateString()}</td>
                                <td>{c.amount.toLocaleString()} F</td>
                                <td>{c.source}</td>
                                <td>{c.note}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        } else if (showModal === 'cotisation_out') {
            title = 'Détails des Retraits';
            content = (
                <table className="table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Montant</th>
                            <th>Motif</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cotisationStats.withdrawals.map((w, i) => (
                            <tr key={i}>
                                <td>{new Date(w.date).toLocaleDateString()}</td>
                                <td>{w.amount.toLocaleString()} F</td>
                                <td>{w.motif}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        } else if (showModal === 'history') {
            title = 'Historique des Flux (Ventes vs Achats)';
            content = (
                <table className="table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Ventes</th>
                            <th>Achats</th>
                        </tr>
                    </thead>
                    <tbody>
                        {summary.history.map((h, i) => (
                            <tr key={i}>
                                <td>{new Date(h.date).toLocaleDateString()}</td>
                                <td className="text-success">{h.sales.toLocaleString()} F</td>
                                <td className="text-danger">{h.purchases.toLocaleString()} F</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        }

        return (
            <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">{title}</h5>
                            <button type="button" className="btn-close" onClick={() => setShowModal(null)}></button>
                        </div>
                        <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                            {content}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="container-fluid">
            {renderModal()}
            <div className="row">
                <div className="col-12">
                    <div className="mb-6">
                        <h1 className="fs-3 mb-1">Dashboard Manager</h1>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="row g-3 mb-3">
                <div className="col-lg-3 col-12">
                    <div className="card p-4 bg-primary bg-opacity-10 border border-primary border-opacity-25 rounded-2">
                        <div className="d-flex gap-3">
                            <div className="icon-shape icon-md bg-primary text-white rounded-2">
                                <i className="ti ti-report-analytics fs-4"></i>
                            </div>
                            <div>
                                <h2 className="mb-3 fs-6">Ventes (Aujourd'hui)</h2>
                                <h3 className="fw-bold mb-0">{(summary.today_sales || 0).toLocaleString()} F</h3>
                                <p className="text-primary mb-0 small">Total</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-3 col-12">
                    <div className="card p-4 bg-success bg-opacity-10 border border-success border-opacity-25 rounded-2">
                        <div className="d-flex gap-3">
                            <div className="icon-shape icon-md bg-success text-white rounded-2">
                                <i className="ti ti-repeat fs-4"></i>
                            </div>
                            <div>
                                <h2 className="mb-3 fs-6">Ventes (Mois)</h2>
                                <h3 className="fw-bold mb-0">{(summary.monthly_sales || 0).toLocaleString()} F</h3>
                                <p className="text-success mb-0 small">En temps réel</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-3 col-12">
                    <div className="card p-4 bg-info bg-opacity-10 border border-info border-opacity-25 rounded-2">
                        <div className="d-flex gap-3">
                            <div className="icon-shape icon-md bg-info text-white rounded-2">
                                <i className="ti ti-currency-dollar fs-4"></i>
                            </div>
                            <div>
                                <h2 className="mb-3 fs-6">Dépenses Totales</h2>
                                <h3 className="fw-bold mb-0">{(summary.total_expenses || 0).toLocaleString()} F</h3>
                                <p className="text-info mb-0 small">Mois en cours</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-3 col-12">
                    <div className="card p-4 bg-warning bg-opacity-10 border border-warning border-opacity-25 rounded-2">
                        <div className="d-flex gap-3">
                            <div className="icon-shape icon-md bg-warning text-white rounded-2">
                                <i className="ti ti-notes fs-4"></i>
                            </div>
                            <div>
                                <h2 className="mb-3 fs-6">Fonds Disponibles</h2>
                                <h3 className="fw-bold mb-0">{(summary.available_funds || 0).toLocaleString()} F</h3>
                                <p className="text-warning mb-0 small">Caisse disponible</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="row g-3 mb-3">
                <div className="col-12 col-lg-6">
                    <div className="card" onClick={() => setShowModal('history')} style={{ cursor: 'pointer' }}>
                        <div className="card-header d-flex justify-content-between align-items-center bg-transparent px-4 py-3">
                            <h3 className="h5 mb-0">Sales vs Purchase</h3>
                            <small className="text-muted">Cliquez pour détails</small>
                        </div>
                        <div className="card-body p-4">
                            <div ref={salesPurchaseRef}></div>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-lg-6">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center bg-transparent px-4 py-3">
                            <h3 className="h5 mb-0">Overall Information</h3>
                        </div>
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h3 className="h6 mb-0">Cotisation</h3>
                                <div className="text-end">
                                    <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Montant disponible</small>
                                    <span className="fw-bold text-primary fs-5">
                                        {((cotisationStats?.recent?.reduce((sum, c) => sum + (Number(c.amount) || 0), 0) || 0) -
                                          (cotisationStats?.withdrawals?.reduce((sum, w) => sum + (Number(w.amount) || 0), 0) || 0)).toLocaleString()} F
                                    </span>
                                </div>
                            </div>
                            <div className="row align-items-center">
                                <div className="col-sm-6">
                                    <div ref={customerChartRef}></div>
                                </div>
                                <div className="col-sm-6">
                                    <div className="row g-2">
                                        <div className="col-6">
                                            <div
                                                className="text-center p-2 rounded cursor-pointer"
                                                style={{ backgroundColor: '#5BE49B22', cursor: 'pointer' }}
                                                onClick={() => setShowModal('cotisation_in')}
                                            >
                                                <h2 className="mb-1 fs-5">
                                                    {(cotisationStats?.recent?.reduce((sum, c) => sum + (Number(c.amount) || 0), 0) || 0).toLocaleString()} F
                                                </h2>
                                                <p className="text-success mb-2 small">Cotisation</p>
                                                <span className="badge bg-success">Détails</span>
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div
                                                className="text-center p-2 rounded cursor-pointer"
                                                style={{ backgroundColor: '#E6623922', cursor: 'pointer' }}
                                                onClick={() => setShowModal('cotisation_out')}
                                            >
                                                <h2 className="mb-1 fs-5">
                                                    {(cotisationStats?.withdrawals?.reduce((sum, w) => sum + (Number(w.amount) || 0), 0) || 0).toLocaleString()} F
                                                </h2>
                                                <p className="text-warning mb-2 small">Retrait</p>
                                                <span className="badge bg-warning text-dark">Détails</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Additional Stats */}
                            <div className="row text-center border-top mt-4 pt-4">
                                <div className="col-4 border-end">
                                    <h3 className="fw-bold mb-2 fs-6">{(summary.total_sales || 0).toLocaleString()} F</h3>
                                    <small className="text-secondary">Ventes totales</small>
                                </div>
                                <div className="col-4 border-end">
                                    <h3 className="fw-bold mb-2 fs-6">{(summary.estimated_profit || 0).toLocaleString()} F</h3>
                                    <small className="text-secondary">Profit Estimé</small>
                                </div>
                                <div className="col-4 cursor-pointer" style={{ cursor: 'pointer' }} onClick={() => { fetchOutOfStockList(); setShowModal('stockout'); }}>
                                    <h3 className="fw-bold mb-2 fs-6 text-danger">{summary.out_of_stock_count || 0}</h3>
                                    <small className="text-danger">Ruptures Stock</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default User;
