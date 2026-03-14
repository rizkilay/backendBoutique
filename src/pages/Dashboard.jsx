import React, { useEffect, useRef } from 'react';
import ApexCharts from 'apexcharts';

const Dashboard = () => {
    const salesPurchaseRef = useRef(null);
    const customerChartRef = useRef(null);
    const [summary, setSummary] = React.useState({ total_count: 0, total_amount: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/inventory-stats');
                const data = await response.json();
                setSummary(data);
            } catch (err) {
                console.error('Failed to fetch stats:', err);
            }
        };
        fetchStats();
        const interval = setInterval(fetchStats, 10000); // 10s refresh
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Sales vs Purchase Chart
        if (salesPurchaseRef.current) {
            const options = {
                series: [
                    { name: 'Sales', data: [44, 55, 57, 56, 61, 58, 63, 60, 66] },
                    { name: 'Purchase', data: [76, 85, 101, 98, 87, 105, 91, 114, 94] },
                ],
                colors: ['#f7a085', '#E66239'],
                chart: {
                    type: 'bar',
                    height: 350,
                    width: '100%',
                    toolbar: { show: false },
                },
                grid: { borderColor: "#e2e8f0" },
                legend: { show: true, fontFamily: 'Poppins, serif', fontWeight: 500 },
                plotOptions: { bar: { horizontal: false, columnWidth: '85%', borderRadius: 3 } },
                dataLabels: { enabled: false },
                xaxis: {
                    categories: ['28 Jan', '29 Jan', '30 Jan', '31 Jan', '1 Feb', '2 Feb', '3 Feb', '4 Feb', '5 Feb'],
                },
                yaxis: {
                    labels: { formatter: (e) => e + 'k' },
                    title: { text: '$ (thousands)' },
                },
                tooltip: { y: { formatter: (val) => "$ " + val + " thousands" } },
            };
            const chart = new ApexCharts(salesPurchaseRef.current, options);
            chart.render();
            return () => chart.destroy();
        }
    }, []);

    useEffect(() => {
        // Customers Overview Chart
        if (customerChartRef.current) {
            const options = {
                series: [44, 55],
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
                        gradientToColors: ['#007867', '#FFD666', '#FFAC82'],
                        stops: [0, 100],
                    },
                },
                stroke: { lineCap: 'round' },
                labels: ['First Time', 'Return'],
            };
            const chart = new ApexCharts(customerChartRef.current, options);
            chart.render();
            return () => chart.destroy();
        }
    }, []);

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-12">
                    <div className="mb-6">
                        <h1 className="fs-3 mb-1">Dashboard</h1>
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
                                <p className="text-primary mb-0 small">Actualisé</p>
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
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center bg-transparent px-4 py-3">
                            <h3 className="h5 mb-0">Sales vs Purchase</h3>
                            <div>
                                <select className="form-select form-select-sm">
                                    <option defaultValue>This Year</option>
                                    <option>This Month</option>
                                    <option>This Week</option>
                                </select>
                            </div>
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
                            <div>
                                <select className="form-select form-select-sm">
                                    <option defaultValue>Last 6 Months</option>
                                    <option>This Month</option>
                                    <option>This Week</option>
                                </select>
                            </div>
                        </div>
                        <div className="card-body p-4">
                            <h3 className="h6">Cotissation</h3>
                            <div className="row align-items-center">
                                <div className="col-sm-6">
                                    <div ref={customerChartRef}></div>
                                </div>
                                <div className="col-sm-6">
                                    <div className="row">
                                        <div className="col-6 border-end">
                                            <div className="text-center">
                                                <h2 className="mb-1">5.5K</h2>
                                                <p className="text-success mb-2">First Time</p>
                                                <span className="badge bg-success"><i className="ti ti-arrow-up-left me-1"></i>25%</span>
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="text-center">
                                                <h2 className="mb-1">3.5K</h2>
                                                <p className="text-warning mb-2">Return</p>
                                                <span className="badge bg-success badge-xs d-inline-flex align-items-center"><i className="ti ti-arrow-up-left me-1"></i>21%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Additional Stats */}
                            <div className="row text-center border-top mt-4 pt-4">
                                <div className="col-4 border-end">
                                    <h3 className="fw-bold mb-2">{(summary.estimated_profit || 0).toLocaleString()} F</h3>
                                    <small className="text-secondary">Ventes totales</small>
                                </div>
                                <div className="col-4 border-end">
                                    <h3 className="fw-bold mb-2">{summary.out_of_stock_count || 0}</h3>
                                    <small className="text-secondary">Profit Estimé</small>
                                </div>
                                <div className="col-4">
                                    <h3 className="fw-bold mb-2">{(summary.today_sales || 0).toLocaleString()} F</h3>
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

export default Dashboard;
