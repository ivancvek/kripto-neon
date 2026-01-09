
import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// --- KONSTANTE IN PODATKI ---
const MOCK_ASSETS = [
  { id: '1', name: 'Bitcoin', symbol: 'BTC', balance: 0.245, price: 63240, change: 2.4, icon: 'fa-bitcoin' },
  { id: '2', name: 'Ethereum', symbol: 'ETH', balance: 3.5, price: 3450, change: -1.2, icon: 'fa-ethereum' },
  { id: '3', name: 'Solana', symbol: 'SOL', balance: 45, price: 145, change: 8.5, icon: 'fa-bolt' },
  { id: '4', name: 'Cardano', symbol: 'ADA', balance: 1200, price: 0.45, change: 0.2, icon: 'fa-cube' },
];

const MOCK_CHART_DATA = [
  { date: 'Pon', v: 24000 }, { date: 'Tor', v: 25500 }, { date: 'Sre', v: 24800 },
  { date: 'Čet', v: 27000 }, { date: 'Pet', v: 26500 }, { date: 'Sob', v: 28200 }, { date: 'Ned', v: 29500 }
];

// --- APLIKACIJA ---

const App = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [showAssistant, setShowAssistant] = useState(false);
  const [assets, setAssets] = useState(MOCK_ASSETS);
  const [insight, setInsight] = useState(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', text: 'Živijo! Sem PulseAI, tvoj osebni kripto analitik. Kako ti lahko danes pomagam?' }
  ]);
  const [userInput, setUserInput] = useState('');
  const chatRef = useRef(null);

  // Skupna vrednost portfelja
  const totalValue = useMemo(() => {
    return assets.reduce((acc, a) => acc + (a.balance * a.price), 0);
  }, [assets]);

  // AI Funkcije
  const fetchMarketInsight = async () => {
    setLoadingInsight(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analiziraj ta portfelj: ${assets.map(a => a.name).join(', ')}. Podaj kratek, drzen tržni vpogled v slovenščini v JSON formatu (title, summary, sentiment).`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              sentiment: { type: Type.STRING }
            },
            required: ["title", "summary", "sentiment"]
          }
        }
      });
      setInsight(JSON.parse(response.text));
    } catch (e) {
      console.error(e);
      setInsight({ title: "Trenutno ni podatkov", summary: "Gemini AI se trenutno ne odziva. Trg ostaja volatilen.", sentiment: "neutral" });
    } finally {
      setLoadingInsight(false);
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
    const msg = userInput;
    setUserInput('');
    setMessages(prev => [...prev, { role: 'user', text: msg }]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      if (!chatRef.current) {
        chatRef.current = ai.chats.create({
          model: 'gemini-3-flash-preview',
          config: { systemInstruction: "Si prijazen kripto asistent PulseAI. Govoriš izključno slovensko." }
        });
      }
      const response = await chatRef.current.sendMessage({ message: msg });
      setMessages(prev => [...prev, { role: 'model', text: response.text }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: 'Ups, prišlo je do napake pri povezavi.' }]);
    }
  };

  return (
    <div className="min-h-screen max-w-md mx-auto relative flex flex-col pb-24">
      {/* Background Glows */}
      <div className="fixed top-[-50px] right-[-50px] w-64 h-64 bg-purple-600/10 rounded-full blur-[80px] pointer-events-none"></div>
      <div className="fixed bottom-[-50px] left-[-50px] w-64 h-64 bg-emerald-600/10 rounded-full blur-[80px] pointer-events-none"></div>

      <header className="px-6 pt-8 pb-4 flex justify-between items-center sticky top-0 bg-slate-950/80 backdrop-blur-md z-40">
        <h1 className="text-xl font-black italic tracking-tighter">
          KRIPTO<span className="text-emerald-400 font-normal">UTRIP</span>
        </h1>
        <div className="flex gap-3">
          <button className="w-10 h-10 glass rounded-xl flex items-center justify-center text-slate-400">
            <i className="fa-solid fa-bell"></i>
          </button>
        </div>
      </header>

      <main className="px-6 flex-1">
        {activeTab === 'home' ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section className="mt-4 mb-8">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Skupni portfelj</p>
              <h2 className="text-5xl font-black neon-purple mb-2 tracking-tight">
                ${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                <span className="text-2xl text-slate-500">.42</span>
              </h2>
              <div className="flex gap-2">
                <span className="text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded-lg flex items-center gap-1">
                  <i className="fa-solid fa-arrow-trend-up"></i> +4.2%
                </span>
                <span className="text-[10px] text-slate-500 font-bold uppercase self-center">v 24 urah</span>
              </div>
            </section>

            <div className="h-44 w-full mb-8 glass rounded-3xl p-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_CHART_DATA}>
                  <defs>
                    <linearGradient id="colorV" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    content={({ active, payload }) => active && payload && (
                      <div className="bg-slate-900 border border-purple-500/30 p-2 rounded-lg text-[10px] font-bold">
                        ${payload[0].value.toLocaleString()}
                      </div>
                    )}
                  />
                  <Area type="monotone" dataKey="v" stroke="#a855f7" strokeWidth={3} fill="url(#colorV)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <section className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold">Moja sredstva</h3>
                <button onClick={() => setActiveTab('market')} className="text-[10px] font-bold text-slate-500">POGLEJ VSE</button>
              </div>
              <div className="space-y-3">
                {assets.slice(0, 3).map(a => (
                  <div key={a.id} className="glass p-4 rounded-2xl flex justify-between items-center active:scale-95 transition-transform">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-purple-400">
                        <i className={`fa-brands ${a.icon} text-lg`}></i>
                      </div>
                      <div>
                        <p className="text-sm font-bold leading-none mb-1">{a.name}</p>
                        <p className="text-[10px] text-slate-500 font-bold">{a.balance} {a.symbol}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold leading-none mb-1">${(a.balance * a.price).toLocaleString()}</p>
                      <p className={`text-[10px] font-bold ${a.change > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{a.change}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="mb-8">
              {!insight ? (
                <button 
                  onClick={fetchMarketInsight} 
                  disabled={loadingInsight}
                  className="w-full glass p-6 rounded-3xl border-dashed border-slate-700 flex flex-col items-center gap-2 group active:bg-slate-800/50"
                >
                  {loadingInsight ? (
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                  ) : (
                    <>
                      <i className="fa-solid fa-wand-magic-sparkles text-purple-400 text-xl group-hover:scale-110 transition-transform"></i>
                      <p className="text-xs font-bold text-slate-400">Generiraj AI analizo portfelja</p>
                    </>
                  )}
                </button>
              ) : (
                <div className="glass p-5 rounded-3xl border-l-4 border-purple-500 animate-in fade-in zoom-in-95">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-sm text-white">{insight.title}</h4>
                    <span className="text-[9px] font-black uppercase bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded tracking-tighter">AI Insight</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed mb-3">{insight.summary}</p>
                  <button onClick={() => setInsight(null)} className="text-[10px] font-bold text-slate-500"><i className="fa-solid fa-arrows-rotate mr-1"></i> Ponovi</button>
                </div>
              )}
            </section>
          </div>
        ) : (
          <div className="pt-4 animate-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-black mb-6">Trg v živo</h2>
            <div className="space-y-3">
              {assets.map(a => (
                <div key={a.id} className="glass p-4 rounded-2xl flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <i className={`fa-brands ${a.icon} text-2xl text-purple-400`}></i>
                    <p className="font-bold">{a.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${a.price.toLocaleString()}</p>
                    <p className={`text-xs ${a.change > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{a.change}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Floating Assistant Button */}
      <button 
        onClick={() => setShowAssistant(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-purple-600 rounded-full shadow-lg shadow-purple-500/40 flex items-center justify-center text-white z-50 animate-float active:scale-90 transition-transform"
      >
        <i className="fa-solid fa-robot text-xl"></i>
      </button>

      {/* Assistant Modal */}
      {showAssistant && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end animate-in fade-in duration-300">
          <div className="w-full bg-slate-900 rounded-t-[40px] border-t border-slate-800 h-[80vh] flex flex-col animate-in slide-in-from-bottom duration-300 shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                  <i className="fa-solid fa-bolt text-xs"></i>
                </div>
                <span className="font-black text-sm tracking-tight">PulseAI ASISTENT</span>
              </div>
              <button onClick={() => setShowAssistant(false)} className="w-8 h-8 glass rounded-full flex items-center justify-center">
                <i className="fa-solid fa-xmark text-sm"></i>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-4 rounded-3xl text-xs leading-relaxed max-w-[85%] ${
                    m.role === 'user' ? 'bg-purple-600 text-white rounded-tr-none' : 'glass text-slate-200 rounded-tl-none border-slate-800'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 bg-slate-900 border-t border-slate-800 safe-bottom">
              <div className="flex gap-2">
                <input 
                  value={userInput}
                  onChange={e => setUserInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Vprašaj karkoli..."
                  className="flex-1 bg-slate-800 border-none rounded-2xl px-5 py-3 text-xs outline-none focus:ring-1 ring-purple-500 transition-all"
                />
                <button 
                  onClick={handleSendMessage}
                  className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center active:scale-90 transition-transform"
                >
                  <i className="fa-solid fa-paper-plane"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 glass border-t border-white/5 flex justify-around items-center px-6 z-40 safe-bottom">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'home' ? 'text-purple-400' : 'text-slate-500'}`}>
          <i className="fa-solid fa-house-chimney text-lg"></i>
          <span className="text-[9px] font-black uppercase">Domov</span>
        </button>
        <button onClick={() => setActiveTab('market')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'market' ? 'text-purple-400' : 'text-slate-500'}`}>
          <i className="fa-solid fa-chart-line text-lg"></i>
          <span className="text-[9px] font-black uppercase">Trg</span>
        </button>
        <div className="relative -top-5">
          <button className="w-14 h-14 bg-gradient-to-tr from-purple-600 to-emerald-400 rounded-full shadow-lg shadow-purple-500/30 flex items-center justify-center text-white ring-4 ring-slate-950">
            <i className="fa-solid fa-plus text-xl"></i>
          </button>
        </div>
        <button className="flex flex-col items-center gap-1 text-slate-500">
          <i className="fa-solid fa-wallet text-lg"></i>
          <span className="text-[9px] font-black uppercase">Denarnica</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-500">
          <i className="fa-solid fa-user text-lg"></i>
          <span className="text-[9px] font-black uppercase">Profil</span>
        </button>
      </nav>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
