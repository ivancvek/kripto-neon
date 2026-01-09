import React, { useState, useMemo, useEffect } from 'react';
import { MOCK_ASSETS, MOCK_CHART_DATA } from './constants';
import { PortfolioChart } from './components/PortfolioChart';
import { AssetItem } from './components/AssetItem';
import { GeminiInsight } from './components/GeminiInsight';
import { Assistant } from './components/Assistant';
import { Asset } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'wallet' | 'market' | 'profile'>('home');
  const [assets, setAssets] = useState<Asset[]>(MOCK_ASSETS);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [chartTimeframe, setChartTimeframe] = useState<'1D' | '1W' | '1M'>('1W');
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  // Simulacija nihanja cen v živo
  useEffect(() => {
    const interval = setInterval(() => {
      setAssets(prev => prev.map(asset => ({
        ...asset,
        price: asset.price * (1 + (Math.random() * 0.002 - 0.001))
      })));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const totalValue = useMemo(() => {
    return assets.reduce((acc, curr) => acc + (curr.balance * curr.price), 0);
  }, [assets]);

  const portfolioContext = useMemo(() => {
    return assets.map(a => `${a.name}: ${a.balance} ${a.symbol}`).join(', ');
  }, [assets]);

  const renderHome = () => (
    <>
      {/* Sekcija s skupno vrednostjo */}
      <section className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Skupna vrednost</p>
        <div className="flex items-baseline gap-2">
          <h2 className="text-4xl font-black text-white neon-purple">
            ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </h2>
          <span className="text-slate-400 text-xl font-bold">.82</span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <div className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1">
            <i className="fa-solid fa-arrow-trend-up text-emerald-400 text-[10px]"></i>
            <span className="text-emerald-400 text-[10px] font-bold">4.25%</span>
          </div>
          <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">v zadnjih 24h</span>
        </div>
      </section>

      {/* Grafikon trenda rasti */}
      <section className="glass rounded-3xl p-4 relative overflow-hidden group animate-in zoom-in-95 duration-500">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-slate-100 px-2">Trend rasti</h3>
          <div className="flex gap-1">
            {['1D', '1W', '1M'].map(tf => (
              <button 
                key={tf}
                onClick={() => setChartTimeframe(tf as any)}
                className={`px-2 py-1 text-[10px] font-bold transition-all rounded-lg ${
                  chartTimeframe === tf ? 'text-purple-400 bg-purple-500/10' : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
        <PortfolioChart data={MOCK_CHART_DATA} />
      </section>

      {/* Gumbi za hitra dejanja */}
      <div className="grid grid-cols-4 gap-4 mt-8">
        {[
          { label: 'Kupi', icon: 'fa-plus', color: 'bg-purple-600 shadow-purple-500/20' },
          { label: 'Prodaj', icon: 'fa-minus', color: 'bg-emerald-600 shadow-emerald-500/20' },
          { label: 'Pošlji', icon: 'fa-paper-plane', color: 'bg-slate-800' },
          { label: 'Več', icon: 'fa-ellipsis-h', color: 'bg-slate-800' },
        ].map((action, i) => (
          <button key={i} className="flex flex-col items-center gap-2 group">
            <div className={`${action.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform active:scale-95 group-hover:-translate-y-1`}>
              <i className={`fa-solid ${action.icon}`}></i>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Seznam sredstev */}
      <section className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-100">Moja sredstva</h2>
          <button onClick={() => setActiveTab('wallet')} className="text-xs font-bold text-slate-500 hover:text-purple-400 transition-colors">Poglej vse</button>
        </div>
        <div className="space-y-1">
          {assets.slice(0, 3).map(asset => (
            <AssetItem key={asset.id} asset={asset} />
          ))}
        </div>
      </section>

      {/* Gemini Vpogledi */}
      <GeminiInsight assets={assets.map(a => a.name)} />
    </>
  );

  const renderWallet = () => (
    <div className="animate-in slide-in-from-right duration-300">
      <h2 className="text-2xl font-black text-white mb-6">Moja Denarnica</h2>
      <div className="space-y-3">
        {assets.map(asset => (
          <AssetItem key={asset.id} asset={asset} />
        ))}
      </div>
      <button className="w-full mt-6 glass border-dashed border-slate-700 p-4 rounded-2xl text-slate-400 text-sm font-bold flex items-center justify-center gap-2 hover:border-purple-500/50 transition-all">
        <i className="fa-solid fa-plus-circle"></i> Dodaj novo sredstvo
      </button>
    </div>
  );

  const renderMarket = () => (
    <div className="animate-in slide-in-from-right duration-300">
      <h2 className="text-2xl font-black text-white mb-2">Trg v živo</h2>
      <p className="text-slate-500 text-xs mb-6">Globalni pregled kripto trgov</p>
      
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="glass p-4 rounded-2xl border-l-4 border-emerald-500">
          <p className="text-[10px] font-bold text-slate-500 uppercase">Največja rast (24h)</p>
          <p className="text-lg font-bold text-white mt-1">Solana +8.5%</p>
        </div>
        <div className="glass p-4 rounded-2xl border-l-4 border-rose-500">
          <p className="text-[10px] font-bold text-slate-500 uppercase">Največji padec</p>
          <p className="text-lg font-bold text-white mt-1">Polkadot -3.4%</p>
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-xs font-bold text-slate-400 mb-3 px-1">Priljubljene valute</p>
        {assets.map(asset => (
          <div key={asset.id} className="flex items-center justify-between p-4 glass rounded-2xl mb-2">
             <div className="flex items-center gap-3">
               <i className={`fa-brands ${asset.icon} text-lg text-purple-400`}></i>
               <span className="font-bold text-sm">{asset.name}</span>
             </div>
             <div className="text-right">
               <p className="text-sm font-bold">${asset.price.toLocaleString()}</p>
               <span className={`text-[10px] ${asset.change24h > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                 {asset.change24h > 0 ? '+' : ''}{asset.change24h}%
               </span>
             </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 pb-20 max-w-md mx-auto relative overflow-x-hidden">
      {/* Dekoracija ozadja */}
      <div className="fixed top-[-100px] right-[-100px] w-64 h-64 bg-purple-600/10 rounded-full blur-[80px] pointer-events-none"></div>
      <div className="fixed top-[300px] left-[-100px] w-64 h-64 bg-emerald-600/10 rounded-full blur-[80px] pointer-events-none"></div>

      {/* Glava aplikacije */}
      <header className="px-6 pt-8 pb-4 flex items-center justify-between sticky top-0 bg-slate-950/80 backdrop-blur-md z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <i className="fa-solid fa-bolt-lightning text-white text-lg"></i>
          </div>
          <h1 className="font-extrabold text-xl tracking-tight text-white">
            Kripto<span className="text-emerald-400">Utrip</span>
          </h1>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowInstallGuide(true)}
            className="w-10 h-10 rounded-xl glass flex items-center justify-center text-emerald-400"
            title="Namesti na telefon"
          >
            <i className="fa-solid fa-download"></i>
          </button>
          <button className="w-10 h-10 rounded-xl glass flex items-center justify-center relative text-slate-400">
            <i className="fa-solid fa-bell"></i>
            <span className="absolute top-2 right-2 w-2 h-2 bg-purple-500 rounded-full border-2 border-slate-950"></span>
          </button>
        </div>
      </header>

      <main className="px-6 mt-4">
        {activeTab === 'home' && renderHome()}
        {activeTab === 'wallet' && renderWallet()}
        {activeTab === 'market' && renderMarket()}
        {activeTab === 'profile' && <div className="p-8 text-center text-slate-500">Profilne nastavitve bodo na voljo kmalu.</div>}
      </main>

      {/* Gumb za AI asistenta */}
      <button 
        onClick={() => setIsAssistantOpen(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-slate-900 border border-purple-500/30 rounded-full shadow-2xl flex items-center justify-center text-purple-400 z-40 animate-bounce"
      >
        <i className="fa-solid fa-comment-dots text-xl"></i>
      </button>

      {/* Modalno okno asistenta */}
      <Assistant 
        isOpen={isAssistantOpen} 
        onClose={() => setIsAssistantOpen(false)} 
        portfolioContext={portfolioContext}
      />

      {/* Navodila za namestitev */}
      {showInstallGuide && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
          <div className="glass p-8 rounded-3xl w-full max-w-xs border border-purple-500/30 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-purple-600/20">
               <i className="fa-solid fa-mobile-screen-button text-2xl text-white"></i>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Namesti na telefon</h3>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              V brskalniku pritisni <i className="fa-solid fa-share-from-square mx-1"></i> ali <i className="fa-solid fa-ellipsis-vertical mx-1"></i> in izberi <br/> 
              <span className="text-emerald-400 font-bold">"Dodaj na domovni zaslon"</span>.
            </p>
            <button 
              onClick={() => setShowInstallGuide(false)}
              className="w-full bg-purple-600 py-3 rounded-xl font-bold text-white shadow-lg"
            >
              Razumem
            </button>
          </div>
        </div>
      )}

      {/* Navigacija */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md h-20 glass border-t border-white/5 flex items-center justify-around px-8 z-50">
        <button 
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'home' ? 'text-purple-400' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <i className="fa-solid fa-house-chimney text-lg"></i>
          <span className="text-[10px] font-bold">Domov</span>
          {activeTab === 'home' && <div className="w-1 h-1 rounded-full bg-purple-400 mt-0.5 animate-pulse"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('wallet')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'wallet' ? 'text-purple-400' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <i className="fa-solid fa-wallet text-lg"></i>
          <span className="text-[10px] font-bold">Portfelj</span>
          {activeTab === 'wallet' && <div className="w-1 h-1 rounded-full bg-purple-400 mt-0.5 animate-pulse"></div>}
        </button>
        
        {/* Sredinski gumb za menjavo */}
        <div className="relative -top-6">
          <button className="w-14 h-14 rounded-full bg-gradient-to-tr from-purple-600 to-emerald-400 shadow-xl shadow-purple-600/40 flex items-center justify-center text-white ring-4 ring-slate-950 transition-transform active:scale-90 group">
            <i className="fa-solid fa-right-left text-xl group-hover:rotate-180 duration-500"></i>
          </button>
        </div>

        <button 
          onClick={() => setActiveTab('market')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'market' ? 'text-purple-400' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <i className="fa-solid fa-chart-line text-lg"></i>
          <span className="text-[10px] font-bold">Trg</span>
          {activeTab === 'market' && <div className="w-1 h-1 rounded-full bg-purple-400 mt-0.5 animate-pulse"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'profile' ? 'text-purple-400' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <i className="fa-solid fa-user-gear text-lg"></i>
          <span className="text-[10px] font-bold">Profil</span>
          {activeTab === 'profile' && <div className="w-1 h-1 rounded-full bg-purple-400 mt-0.5 animate-pulse"></div>}
        </button>
      </nav>
    </div>
  );
};

export default App;
