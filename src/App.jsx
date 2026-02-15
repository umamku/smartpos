
import React, { useState, useEffect } from "react";
import { db, productsCol, transactionsCol, getDocs, addDoc, query, orderBy } from "./db";
import { fetchGeminiAnalysis } from "./gemini";

// --- DATA PRODUK ---
const FALLBACK_PRODUCTS = [
  { id: 1, name: "Kopi Susu Gula Aren", price: 18000, category: "Minuman", icon: "coffee" },
  { id: 2, name: "Americano", price: 15000, category: "Minuman", icon: "coffee" },
  { id: 3, name: "Croissant Butter", price: 22000, category: "Makanan", icon: "croissant" },
  { id: 4, name: "Donat Kampung", price: 8000, category: "Makanan", icon: "cookie" },
  { id: 5, name: "Es Teh Manis", price: 6000, category: "Minuman", icon: "glass-water" },
  { id: 6, name: "Nasi Goreng Spesial", price: 25000, category: "Makanan", icon: "utensils" },
];

// --- ICON LIBRARY (EMBEDDED) ---
const ICONS = {
  'layout-grid': <><rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" /></>,
  'history': <><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l4 2" /></>,
  'sparkles': <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z" />,
  'shopping-bag': <><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></>,
  'plus': <path d="M5 12h14M12 5v14" />,
  'minus': <path d="M5 12h14" />,
  'x': <path d="M18 6 6 18M6 6l12 12" />,
  'coffee': <><path d="M10 2v2" /><path d="M14 2v2" /><path d="M6 2v2" /><path d="M18 8a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" /></>,
  'croissant': <path d="m14 13.5 2.3 1c.7.3 1.2.7 1.2 1.5V19.5c0 1.7-.8 2.5-2.5 2.5h-3.5c-.8 0-1.2-.4-1.5-1.2l-1-2.3m-4.4-5.4 5.8-3.2c1.9-1.1 4.8 1.8 3.7 3.7l-3.2 5.8C8.3 23.3 3.1 18.1 4.6 13.1Z" />,
  'cookie': <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5Zm-3.8 1.4a2 2 0 1 1 3.32 1.19 2 2 0 0 1-3.32-1.19Zm-2.5 8.7a2 2 0 1 1 2.37 2.37 2 2 0 0 1-2.37-2.37Zm9.9-2.1a2 2 0 1 1 2.37-2.37 2 2 0 0 1-2.37 2.37Z" />,
  'glass-water': <><path d="M15.2 22H8.8a2 2 0 0 1-2-1.79L5 3h14l-1.81 17.21A2 2 0 0 1 15.2 22Z" /><path d="M6 12a5 5 0 0 1 6 0 5 5 0 0 0 6 0" /></>,
  'utensils': <><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" /></>,
  'clipboard-list': <><rect width="8" height="4" x="8" y="2" rx="1" ry="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="M12 11h4" /><path d="M12 16h4" /><path d="M8 11h.01" /><path d="M8 16h.01" /></>,
  'brain-circuit': <><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" /><path d="M9 13a4.5 4.5 0 0 0 3-4" /><path d="M6.003 5.125A3 3 0 0 1 19.5 13" /><path d="M12 18a4 4 0 0 0 1.134-5.855" /><path d="M12 18h6a2 2 0 0 1 2 2v2" /><path d="M12 22v-4" /><path d="M6 12h2" /><path d="M17 17H6" /><path d="11 2a2 2 0 1 0 4 0" /></>,
  'play': <polygon points="6 3 20 12 6 21 6 3" />,
  'bot': <><rect width="18" height="10" x="3" y="11" rx="2" /><circle cx="12" cy="5" r="2" /><path d="M12 7v4" /><line x1="8" x2="8" y1="16" y2="16" /><line x1="16" x2="16" y1="16" y2="16" /></>,
  'lightbulb': <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-1 1.5-2.4 1.5-3.8 0-3.2-2.5-5.7-5.7-5.7C9 2 6.6 4.4 6.7 7.7c.1 1.3.6 2.6 1.5 3.6.9.9 1.4 1.5 1.5 2.5m-4 4h9m-9 3h9" />
};

const Icon = ({ name, size = 24, className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    {ICONS[name] || <circle cx="12" cy="12" r="10" />}
  </svg>
);

// --- COMPONENTS ---

const ProductCard = ({ product, onAdd }) => (
  <div onClick={() => onAdd(product)} className="bg-white p-4 rounded-xl border border-gray-100 card-shadow active:scale-95 transition-transform cursor-pointer flex flex-col justify-between h-32 relative overflow-hidden group">
    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
      <Icon name="shopping-bag" size={48} />
    </div>
    <div>
      <h3 className="font-semibold text-gray-800 text-sm leading-tight mb-1">{product.name}</h3>
      <p className="text-xs text-gray-500">{product.category}</p>
    </div>
    <div className="flex justify-between items-end mt-2">
      <span className="font-bold text-indigo-600 text-sm">Rp {product.price.toLocaleString('id-ID')}</span>
      <div className="bg-indigo-50 p-1.5 rounded-lg text-indigo-600">
        <Icon name="plus" size={14} />
      </div>
    </div>
  </div>
);

const CartItem = ({ item, onUpdate, onRemove }) => (
  <div className="flex items-center justify-between p-3 bg-white mb-2 rounded-xl border border-gray-100">
    <div className="flex-1">
      <h4 className="font-medium text-gray-800 text-sm">{item.name}</h4>
      <p className="text-xs text-indigo-600 font-semibold">Rp {(item.price * item.qty).toLocaleString('id-ID')}</p>
    </div>
    <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
      <button onClick={() => item.qty > 1 ? onUpdate(item.id, -1) : onRemove(item.id)} className="w-7 h-7 flex items-center justify-center bg-white rounded shadow-sm text-gray-600 active:bg-gray-100">
        <Icon name="minus" size={14} />
      </button>
      <span className="text-sm font-semibold w-4 text-center">{item.qty}</span>
      <button onClick={() => onUpdate(item.id, 1)} className="w-7 h-7 flex items-center justify-center bg-indigo-600 rounded shadow-sm text-white active:bg-indigo-700">
        <Icon name="plus" size={14} />
      </button>
    </div>
  </div>
);

const Navbar = ({ activeTab, setTab, cartCount }) => (
  <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-6 flex justify-between items-center z-50 glass-effect mobile-wrapper-child" style={{ maxWidth: '480px', margin: '0 auto', left: 0, right: 0 }}>
    <button onClick={() => setTab('pos')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'pos' ? 'text-indigo-600' : 'text-gray-400'}`}>
      <Icon name="layout-grid" size={24} />
      <span className="text-[10px] font-medium">Kasir</span>
    </button>
    
    <button onClick={() => setTab('history')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'history' ? 'text-indigo-600' : 'text-gray-400'}`}>
      <Icon name="history" size={24} />
      <span className="text-[10px] font-medium">Riwayat</span>
    </button>

    <button onClick={() => setTab('ai')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'ai' ? 'text-purple-600' : 'text-gray-400'}`}>
      <div className={`p-1 rounded-full ${activeTab === 'ai' ? 'bg-purple-100' : ''}`}>
        <Icon name="sparkles" size={24} />
      </div>
      <span className="text-[10px] font-medium">AI Recap</span>
    </button>
  </div>
);

// --- VIEWS ---

const POSView = ({ products, cart, addToCart, updateCartQty, removeFromCart, checkout }) => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const totalQty = cart.reduce((acc, item) => acc + item.qty, 0);

  // Group products by category
  const categories = [...new Set(products.map(p => p.category))];
  const [activeCategory, setActiveCategory] = useState('Semua');

  const filteredProducts = activeCategory === 'Semua' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  return (
    <div className="flex flex-col h-full pb-20">
      {/* Header */}
      <div className="p-5 bg-white sticky top-0 z-10 border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-800">Kasir Toko</h1>
        <p className="text-xs text-gray-500">Halo, Selamat bekerja!</p>
      </div>

      {/* Categories */}
      <div className="px-5 pt-4 pb-2 overflow-x-auto no-scrollbar flex gap-2">
        <button 
          onClick={() => setActiveCategory('Semua')}
          className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${activeCategory === 'Semua' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
        >
          Semua
        </button>
        {categories.map(cat => (
          <button 
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${activeCategory === cat ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="p-5 grid grid-cols-2 gap-3 overflow-y-auto pb-32">
        {filteredProducts.map(p => (
          <ProductCard key={p.id} product={p} onAdd={addToCart} />
        ))}
      </div>

      {/* Floating Cart Summary */}
      {cart.length > 0 && (
        <div className="fixed bottom-20 left-0 right-0 px-5 z-20" style={{ maxWidth: '480px', margin: '0 auto' }}>
          <button 
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-indigo-900 text-white p-4 rounded-xl shadow-lg flex justify-between items-center transform transition-all active:scale-95"
          >
            <div className="flex items-center gap-3">
              <div className="bg-indigo-700 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold">
                {totalQty}
              </div>
              <span className="text-sm font-medium">Total Pesanan</span>
            </div>
            <span className="font-bold">Rp {total.toLocaleString('id-ID')}</span>
          </button>
        </div>
      )}

      {/* Full Cart Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-[480px] rounded-t-3xl h-[85vh] flex flex-col animate-slide-up shadow-2xl pb-24">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold">Keranjang</h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 bg-gray-100 rounded-full text-gray-600">
                <Icon name="x" size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {cart.length === 0 ? (
                <div className="text-center text-gray-400 mt-10">Keranjang kosong</div>
              ) : (
                cart.map(item => (
                  <CartItem key={item.id} item={item} onUpdate={updateCartQty} onRemove={removeFromCart} />
                ))
              )}
            </div>
            <div className="p-5 border-t border-gray-100 bg-gray-50">
              <div className="flex justify-between mb-4 text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-bold text-gray-900">Rp {total.toLocaleString('id-ID')}</span>
              </div>
              <button 
                onClick={() => { checkout(); setIsCartOpen(false); }}
                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-200 active:bg-indigo-700 transition-colors"
              >
                Bayar Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const HistoryView = ({ transactions }) => {
  return (
    <div className="flex flex-col h-full pb-20">
      <div className="p-5 bg-white sticky top-0 z-10 border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-800">Riwayat</h1>
        <p className="text-xs text-gray-500">Daftar transaksi tersimpan</p>
      </div>
      <div className="p-5 overflow-y-auto">
        {transactions.length === 0 ? (
          <div className="text-center mt-20 text-gray-400 flex flex-col items-center">
            <Icon name="clipboard-list" size={48} className="mb-4 opacity-50" />
            <p>Belum ada transaksi hari ini.</p>
          </div>
        ) : (
          [...transactions].reverse().map(trx => (
            <div key={trx.id} className="bg-white p-4 rounded-xl mb-3 border border-gray-100 card-shadow">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">#{trx.id.slice(-4)}</span>
                  <p className="text-[10px] text-gray-400 mt-1">{new Date(trx.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                </div>
                <span className="font-bold text-gray-800">Rp {trx.total.toLocaleString('id-ID')}</span>
              </div>
              <div className="border-t border-gray-50 pt-2 mt-2">
                <p className="text-xs text-gray-500 truncate">
                  {trx.items.map(i => `${i.qty}x ${i.name}`).join(', ')}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const AIView = ({ transactions }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateAnalysis = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await fetchGeminiAnalysis(transactions);
      setAnalysis(result);
    } catch (e) {
      setError("Gagal mengambil analisis dari Gemini API.");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full pb-20 bg-gradient-to-b from-purple-50 to-white">
      <div className="p-5 sticky top-0 z-10">
        <div className="flex items-center gap-2 mb-1">
          <Icon name="sparkles" className="text-purple-600" size={20} />
          <h1 className="text-xl font-bold text-gray-800">AI Assistant</h1>
        </div>
        <p className="text-xs text-gray-500">Analisis otomatis aktivitas toko Anda.</p>
      </div>

      <div className="px-5 flex-1 overflow-y-auto">
        {!analysis && !loading && (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="bg-white p-4 rounded-full mb-4 shadow-sm">
              <Icon name="brain-circuit" size={48} className="text-purple-300" />
            </div>
            <h3 className="font-semibold text-gray-700 mb-2">Belum ada analisis</h3>
            <p className="text-xs text-gray-500 max-w-[200px] mb-6">Klik tombol di bawah agar AI membaca data penjualan hari ini.</p>
            {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
            <button 
              onClick={generateAnalysis}
              className="bg-purple-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-purple-200 active:scale-95 transition-colors flex items-center gap-2"
            >
              <Icon name="play" size={16} fill="currentColor" />
              Mulai Analisis
            </button>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            <p className="text-xs font-medium text-purple-600 animate-pulse">AI sedang berpikir...</p>
          </div>
        )}

        {analysis && !loading && (
          <div className="space-y-4 animate-slide-up">
            {/* Summary Card */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-purple-100">
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">{analysis.summary}</p>
              <div className="grid grid-cols-3 gap-2">
                {analysis.metrics.map((m, idx) => (
                  <div key={idx} className="bg-purple-50 p-2 rounded-lg text-center">
                    <p className="text-[10px] text-purple-600 uppercase font-bold tracking-wider mb-1">{m.label}</p>
                    <p className="text-xs font-bold text-gray-800 break-words leading-tight">{m.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Insight Bubble */}
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex-shrink-0 flex items-center justify-center text-white mt-1">
                <Icon name="bot" size={16} />
              </div>
              <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm flex-1">
                <h4 className="font-bold text-gray-800 text-sm mb-1">Insight Penjualan</h4>
                <p className="text-sm text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: analysis.insight.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') }}></p>
              </div>
            </div>

            {/* Action Item */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 rounded-xl text-white shadow-lg">
              <div className="flex items-start gap-3">
                <Icon name="lightbulb" size={20} className="text-yellow-300 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm mb-1">Saran Aksi</h4>
                  <p className="text-xs opacity-90">{analysis.action}</p>
                </div>
              </div>
            </div>

            <button onClick={generateAnalysis} className="w-full py-3 text-xs text-gray-400 font-medium hover:text-purple-600 transition-colors">
              Analisis Ulang
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- MAIN APP ---


const App = () => {
  const [activeTab, setActiveTab] = useState('pos');
  const [cart, setCart] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState(FALLBACK_PRODUCTS);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingTrx, setLoadingTrx] = useState(true);

  // Ambil produk dari Firestore
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(productsCol, orderBy('name'));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }
      } catch (e) {
        // fallback ke produk lokal
      }
      setLoadingProducts(false);
    };
    fetchProducts();
  }, []);

  // Ambil transaksi dari Firestore
  useEffect(() => {
    const fetchTrx = async () => {
      try {
        const q = query(transactionsCol, orderBy('date', 'desc'));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setTransactions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }
      } catch (e) {}
      setLoadingTrx(false);
    };
    fetchTrx();
  }, []);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateCartQty = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, qty: Math.max(1, item.qty + delta) };
      }
      return item;
    }));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // Simpan transaksi ke Firestore
  const handleCheckout = async () => {
    const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const newTrx = {
      date: new Date().toISOString(),
      items: [...cart],
      total: total
    };
    try {
      await addDoc(transactionsCol, newTrx);
      // Refresh transaksi
      const q = query(transactionsCol, orderBy('date', 'desc'));
      const snap = await getDocs(q);
      setTransactions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setCart([]);
      alert("Transaksi Berhasil!");
    } catch (e) {
      alert("Gagal menyimpan transaksi ke database.");
    }
  };

  return (
    <div className="mobile-wrapper">
      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'pos' && (
          <POSView 
            products={products} 
            cart={cart} 
            addToCart={addToCart}
            updateCartQty={updateCartQty}
            removeFromCart={removeFromCart}
            checkout={handleCheckout}
          />
        )}
        {activeTab === 'history' && <HistoryView transactions={transactions} />}
        {activeTab === 'ai' && <AIView transactions={transactions} />}
      </div>
      <Navbar activeTab={activeTab} setTab={setActiveTab} cartCount={cart.length} />
    </div>
  );
};

export default App;
