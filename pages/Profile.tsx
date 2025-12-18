import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { mockDB } from '../services/mockBackend';
import { SavedDesign } from '../types';
import { IconLoader, IconShoppingBag, IconWand } from '../components/Icons';
import { useNavigate, Link } from 'react-router-dom';

const Profile: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [designs, setDesigns] = useState<SavedDesign[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            try {
                const fetchedDesigns = await mockDB.getUserDesigns(user.id);
                setDesigns(fetchedDesigns);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
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
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12 animate-fade-in-up">
                    <div className="flex items-center gap-6">
                        <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-full bg-stone-200 border-4 border-white shadow-lg" />
                        <div>
                            <h1 className="text-3xl font-serif font-bold text-custemo-dark">{user.name}</h1>
                            <p className="text-stone-500">{user.email}</p>
                            <p className="text-xs font-bold uppercase text-custemo-green mt-2 bg-custemo-sage/20 px-2 py-1 rounded w-fit">
                                Sustainable Member
                            </p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleLogout}
                        className="px-6 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium text-sm flex items-center gap-2"
                    >
                        Sign Out
                    </button>
                </div>

                <div className="border-t border-stone-200 pt-8 animate-fade-in stagger-delay-1">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-custemo-dark">Digital Wardrobe</h2>
                        <Link to="/studio" className="text-sm font-medium text-custemo-green hover:underline flex items-center gap-1">
                            <IconWand className="w-3 h-3" /> Create New
                        </Link>
                    </div>

                    {designs.length === 0 ? (
                        <div className="bg-stone-50 rounded-xl p-12 text-center border border-dashed border-stone-200">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                <IconShoppingBag className="w-8 h-8 text-stone-300" />
                            </div>
                            <h3 className="text-stone-600 font-medium mb-2">Your wardrobe is empty</h3>
                            <p className="text-stone-400 text-sm mb-6">Start designing your custom sustainable garments today.</p>
                            <Link to="/studio" className="bg-custemo-dark text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-black transition-all">
                                Go to Studio
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {designs.map((design, idx) => (
                                <div key={design.id} className="group bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-500 cursor-pointer animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
                                    <div className="aspect-[3/4] bg-stone-100 relative overflow-hidden">
                                        {design.previewImage ? (
                                            <img src={design.previewImage} alt={design.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        ) : (
                                            // Fallback visualization based on state
                                            <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                                                <div className="w-full h-full rounded-xl" style={{ backgroundColor: design.state.color, opacity: 0.5 }}></div>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="bg-white/80 px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur">
                                                        {design.state.type}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <div className="p-5">
                                        <h3 className="font-bold text-lg text-stone-800">{design.name}</h3>
                                        <div className="flex gap-2 mt-3 mb-4">
                                            <span className="text-xs bg-stone-100 px-2 py-1 rounded text-stone-600">{design.state.fabric}</span>
                                            <span className="text-xs bg-stone-100 px-2 py-1 rounded text-stone-600">{design.state.fit}</span>
                                        </div>
                                        <button className="w-full py-2 border border-stone-200 rounded-lg text-sm font-medium hover:bg-black hover:text-white transition-colors">
                                            Edit Design
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default Profile;