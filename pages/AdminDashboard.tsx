import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { mockDB } from '../services/mockBackend';
import { Order, SavedDesign } from '../types';
import { IconLoader, IconCheck, IconTruck, IconUser, IconShoppingBag } from '../components/Icons';
import { useNavigate } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [designs, setDesigns] = useState<SavedDesign[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'orders' | 'designs'>('orders');

    useEffect(() => {
        if (user && user.role !== 'admin') {
            navigate('/');
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            try {
                const [fetchedOrders, fetchedDesigns] = await Promise.all([
                    mockDB.getOrders(true),
                    mockDB.getAllDesigns()
                ]);
                setOrders(fetchedOrders);
                setDesigns(fetchedDesigns);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchData();
    }, [user, navigate]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (!user || loading) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center">
                    <IconLoader className="w-8 h-8 animate-spin text-custemo-green" />
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-stone-200 pb-6">
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-custemo-dark">Admin Dashboard</h1>
                        <p className="text-stone-500 mt-2">Manage production queue and view global design uploads.</p>
                    </div>
                    <div className="flex flex-col md:flex-row gap-4 mt-4 md:mt-0 items-end md:items-center">
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setActiveTab('orders')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'orders' ? 'bg-custemo-dark text-white' : 'bg-white border border-stone-200 text-stone-600'}`}
                            >
                                Orders ({orders.length})
                            </button>
                            <button 
                                onClick={() => setActiveTab('designs')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'designs' ? 'bg-custemo-dark text-white' : 'bg-white border border-stone-200 text-stone-600'}`}
                            >
                                All Designs ({designs.length})
                            </button>
                        </div>
                        <button 
                            onClick={handleLogout}
                            className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium text-sm"
                        >
                            Log Out
                        </button>
                    </div>
                </div>

                {activeTab === 'orders' ? (
                    <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden animate-fade-in-up">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-stone-50 border-b border-stone-200">
                                    <tr>
                                        <th className="p-4 font-bold text-stone-600">Order ID</th>
                                        <th className="p-4 font-bold text-stone-600">Date</th>
                                        <th className="p-4 font-bold text-stone-600">Customer ID</th>
                                        <th className="p-4 font-bold text-stone-600">Items</th>
                                        <th className="p-4 font-bold text-stone-600">Status</th>
                                        <th className="p-4 font-bold text-stone-600 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100">
                                    {orders.map(order => (
                                        <tr key={order.id} className="hover:bg-stone-50/50 transition-colors">
                                            <td className="p-4 font-medium text-stone-900">{order.id}</td>
                                            <td className="p-4 text-stone-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                                            <td className="p-4 text-stone-500 flex items-center gap-2">
                                                <div className="w-6 h-6 bg-stone-200 rounded-full flex items-center justify-center text-xs">U</div>
                                                {order.userId}
                                            </td>
                                            <td className="p-4 text-stone-600">
                                                {order.items.map(i => i.name).join(', ')}
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                                                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-green-100 text-green-800'
                                                }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right font-medium">${order.totalAmount.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                    {orders.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="p-12 text-center text-stone-400">No orders found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in-up">
                        {designs.map(design => (
                            <div key={design.id} className="bg-white rounded-xl border border-stone-200 overflow-hidden hover:shadow-lg transition-all group">
                                <div className="aspect-square bg-stone-100 relative overflow-hidden">
                                     {design.previewImage ? (
                                        <img src={design.previewImage} alt={design.name} className="w-full h-full object-cover" />
                                     ) : (
                                        <div className="w-full h-full flex items-center justify-center text-stone-300">
                                            <IconShoppingBag className="w-12 h-12" />
                                        </div>
                                     )}
                                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                         <span className="text-xs font-bold uppercase tracking-wider">View Config</span>
                                     </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-stone-800 text-sm truncate">{design.name}</h3>
                                    <p className="text-xs text-stone-500 mt-1">User: {design.userId}</p>
                                    <p className="text-xs text-stone-400 mt-2">
                                        {new Date(design.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default AdminDashboard;