
import React, { useState, useEffect } from 'react';
import { MemoryItem, RevisionStep, AppSettings } from './types';

const STEP_CONFIG = [
  { step: 1, label: 'Jour J', color: '#f97316', offset: 0 },
  { step: 2, label: 'J+1', color: '#facc15', offset: 1 },
  { step: 3, label: 'J+6', color: '#22c55e', offset: 6 },
  { step: 4, label: 'J+15', color: '#38bdf8', offset: 15 },
  { step: 5, label: 'J+45', color: '#1e40af', offset: 45 },
  { step: 6, label: 'J+135', color: '#4338ca', offset: 135 },
];

const LogoM = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const dimensions = size === "sm" ? "w-8 h-8 text-lg" : size === "lg" ? "w-20 h-20 text-4xl" : "w-12 h-12 text-2xl";
  return (
    <div className={`${dimensions} bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200`}>
      <span className="serif font-black text-white transform -translate-y-0.5">M</span>
    </div>
  );
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'today' | 'library' | 'add' | 'settings'>('today');
  const [historyView, setHistoryView] = useState<0 | -1 | -2>(0);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>("default");
  
  const [memories, setMemories] = useState<MemoryItem[]>(() => {
    const saved = localStorage.getItem('memorise_v3_data');
    return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('memorise_settings');
    return saved ? JSON.parse(saved) : { notificationsEnabled: false, reminderTime: "09:00" };
  });
  
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  useEffect(() => {
    localStorage.setItem('memorise_v3_data', JSON.stringify(memories));
  }, [memories]);

  useEffect(() => {
    localStorage.setItem('memorise_settings', JSON.stringify(settings));
    if ("Notification" in window) {
      setNotifPermission(Notification.permission);
    }
  }, [settings]);

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      setNotifPermission(permission);
      if (permission === "granted") {
        setSettings(s => ({ ...s, notificationsEnabled: true }));
      }
    } else {
      alert("Votre navigateur ne supporte pas les notifications.");
    }
  };

  const addMemory = () => {
    if (!newTitle.trim()) return;
    const now = new Date();
    const revisions: RevisionStep[] = STEP_CONFIG.map(config => {
      const date = new Date(now);
      date.setDate(date.getDate() + config.offset);
      return {
        step: config.step,
        label: config.label,
        dueDate: date.toISOString().split('T')[0],
        status: 'pending',
        color: config.color
      };
    });

    const newItem: MemoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      title: newTitle,
      content: newContent,
      createdAt: Date.now(),
      revisions
    };

    setMemories([newItem, ...memories]);
    setNewTitle('');
    setNewContent('');
    setActiveTab('today');
  };

  const getTargetDateStr = (offset: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toISOString().split('T')[0];
  };

  const viewDateStr = getTargetDateStr(historyView);
  const todayStr = getTargetDateStr(0);

  const currentRevisions = memories.flatMap(m => 
    m.revisions
      .filter(r => {
        if (historyView === 0) {
          return r.status === 'pending' && r.dueDate <= todayStr;
        } else {
          return r.dueDate === viewDateStr;
        }
      })
      .map(r => {
        const due = new Date(r.dueDate);
        const ref = new Date(todayStr);
        const diffDays = Math.floor((ref.getTime() - due.getTime()) / (1000 * 3600 * 24));
        return { ...r, parentTitle: m.title, parentId: m.id, content: m.content, delay: diffDays };
      })
  ).sort((a, b) => b.delay - a.delay);

  const completeRevision = (memoryId: string, step: number) => {
    const completionDate = todayStr;
    setMemories(prev => prev.map(m => {
      if (m.id === memoryId) {
        const newRevisions = [...m.revisions];
        const stepIdx = newRevisions.findIndex(r => r.step === step);
        if (stepIdx !== -1) {
          newRevisions[stepIdx] = { ...newRevisions[stepIdx], status: 'completed', completedDate: completionDate };
          for (let i = stepIdx + 1; i < newRevisions.length; i++) {
            const config = STEP_CONFIG[i];
            const prevConfig = STEP_CONFIG[i-1];
            const interval = config.offset - prevConfig.offset;
            const nextDate = new Date(completionDate);
            nextDate.setDate(nextDate.getDate() + interval);
            newRevisions[i] = { ...newRevisions[i], dueDate: nextDate.toISOString().split('T')[0] };
          }
        }
        return { ...m, revisions: newRevisions };
      }
      return m;
    }));
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-slate-50 overflow-hidden shadow-2xl relative">
      {/* Header avec Logo */}
      <header className="px-6 pt-12 pb-6 bg-white border-b border-slate-100 safe-top">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <LogoM size="md" />
            <div>
              <h1 className="text-2xl font-black text-slate-900 serif tracking-tight">Memorise</h1>
              <p className="text-[9px] text-indigo-600 font-black uppercase tracking-widest">Ancrage Durable</p>
            </div>
          </div>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`p-3 rounded-2xl transition-colors ${activeTab === 'settings' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-6 py-6 pb-28">
        
        {activeTab === 'today' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex bg-slate-100 p-1.5 rounded-2xl">
              {[{ label: 'A-Hier', val: -2 }, { label: 'Hier', val: -1 }, { label: 'Aujourd\'hui', val: 0 }].map(opt => (
                <button
                  key={opt.val} onClick={() => setHistoryView(opt.val as 0 | -1 | -2)}
                  className={`flex-1 py-2.5 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${historyView === opt.val ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="flex justify-between items-end">
              <h2 className="text-xl font-bold text-slate-800">{historyView === 0 ? 'Révisions dues' : `Journée du ${formatDate(viewDateStr)}`}</h2>
              <span className="bg-indigo-100 text-indigo-600 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">{currentRevisions.length}</span>
            </div>
            
            <div className="space-y-4">
              {currentRevisions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center text-slate-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-50"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
                  <p className="text-sm font-medium">Esprit libre pour le moment.</p>
                </div>
              ) : (
                currentRevisions.map((rev, idx) => (
                  <div key={idx} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm transition-all active:scale-[0.98]">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-xs" style={{ backgroundColor: rev.color }}>{rev.step}</div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{rev.label}</span>
                      </div>
                      {rev.delay > 0 && <span className="bg-red-50 text-red-600 text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-tighter">-{rev.delay}j</span>}
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 mb-1">{rev.parentTitle}</h4>
                    <p className="text-sm text-slate-500 mb-5 font-medium leading-relaxed">{rev.content}</p>
                    <button 
                      onClick={() => completeRevision(rev.parentId, rev.step)}
                      disabled={rev.status === 'completed'}
                      className={`w-full py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${rev.status === 'completed' ? 'bg-slate-50 text-slate-400' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'}`}
                    >
                      {rev.status === 'completed' ? 'Validé ✓' : 'Marquer comme Appris'}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'library' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h2 className="text-xl font-bold text-slate-800">Ma Mémoire</h2>
            <div className="grid grid-cols-1 gap-5">
              {memories.length === 0 ? (
                <p className="text-center text-slate-300 py-20 text-sm">Votre bibliothèque est vide.</p>
              ) : (
                memories.map(memory => (
                  <div key={memory.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-12 h-12 bg-indigo-50/50 rounded-bl-3xl flex items-center justify-center">
                      <span className="text-[9px] font-black text-indigo-400 uppercase tracking-tighter">ID {memory.id.slice(0,3)}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg mb-1">{memory.title}</h3>
                    <p className="text-[10px] text-slate-300 font-bold uppercase mb-4">Créé le {formatDate(new Date(memory.createdAt).toISOString())}</p>
                    
                    <div className="grid grid-cols-6 gap-2">
                      {memory.revisions.map(rev => (
                        <div key={rev.step} className="flex flex-col items-center gap-1.5">
                          <div 
                            className={`w-full h-2 rounded-full transition-all duration-700 ${rev.status === 'completed' ? '' : 'bg-slate-100'}`}
                            style={{ backgroundColor: rev.status === 'completed' ? rev.color : undefined }}
                          />
                          <span className={`text-[8px] font-black ${rev.status === 'completed' ? 'text-indigo-600' : 'text-slate-300'}`}>
                            {formatDate(rev.dueDate)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex flex-col items-center py-4">
               <LogoM size="lg" />
               <h2 className="mt-4 text-2xl font-black text-slate-900 serif">Réglages</h2>
               <p className="text-xs text-slate-400 font-medium">Personnalisez votre ancrage</p>
            </div>
            
            <div className="bg-white p-7 rounded-3xl border border-slate-100 shadow-sm space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm uppercase tracking-tight">Autorisations Système</h4>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">Nécessaire pour les rappels automatiques</p>
                  </div>
                  <div className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${notifPermission === 'granted' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {notifPermission === 'granted' ? 'Autorisé' : notifPermission === 'denied' ? 'Bloqué' : 'À définir'}
                  </div>
                </div>

                {notifPermission !== 'granted' && (
                  <button 
                    onClick={requestNotificationPermission}
                    className="w-full bg-indigo-50 text-indigo-600 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all"
                  >
                    Activer les alertes système
                  </button>
                )}
              </div>

              <div className={`space-y-4 ${notifPermission === 'granted' ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                 <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">Heure de notification quotidienne</label>
                    <input 
                      type="time" value={settings.reminderTime}
                      onChange={(e) => setSettings(s => ({ ...s, reminderTime: e.target.value }))}
                      className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                 </div>
              </div>

              <div className="p-5 bg-indigo-600 rounded-3xl text-white">
                <h4 className="text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  Mode Mobile App
                </h4>
                <p className="text-[10px] text-indigo-100 leading-relaxed font-medium">
                  Pour une expérience optimale, utilisez le bouton <strong>Partager</strong> de votre navigateur et choisissez <strong>"Sur l'écran d'accueil"</strong>.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'add' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h2 className="text-xl font-bold text-slate-800">Nouveau Savoir</h2>
            <div className="bg-white p-7 rounded-3xl border border-slate-100 shadow-sm space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">Titre du concept</label>
                <input 
                  type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Les 7 merveilles"
                  className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">Détails à retenir</label>
                <textarea 
                  rows={5} value={newContent} onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Contenu structuré..."
                  className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-medium text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                />
              </div>
              <button 
                onClick={addMemory} disabled={!newTitle.trim()}
                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl active:scale-95 transition-all disabled:opacity-30"
              >
                Lancer le Cycle d'Ancrage
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Barre de navigation mobile-first */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-xl border-t border-slate-100 h-24 flex items-center justify-around px-4 pb-6 safe-bottom">
        <button 
          onClick={() => { setActiveTab('today'); setHistoryView(0); }}
          className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'today' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
          <span className="text-[9px] font-black uppercase tracking-widest">Rappel</span>
        </button>
        
        <button 
          onClick={() => setActiveTab('add')}
          className={`-mt-12 w-16 h-16 rounded-full flex items-center justify-center shadow-2xl shadow-indigo-200 transition-all active:scale-90 ${activeTab === 'add' ? 'bg-slate-900 text-white rotate-45' : 'bg-indigo-600 text-white'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>

        <button 
          onClick={() => setActiveTab('library')}
          className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'library' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
          <span className="text-[9px] font-black uppercase tracking-widest">Savoir</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
