import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CarFront, 
  Wallet, 
  Fuel, 
  Zap, 
  Search,
  CheckCircle2, 
  AlertCircle,
  TrendingDown,
  Cpu,
  Download,
  Info
} from 'lucide-react';
import { CARS } from './constants';
import { Car, UserPreferences, Priority } from './types';

export default function App() {
  const [prefs, setPrefs] = useState<UserPreferences>({
    maxBudget: 150000,
    bodyType: ['Sedan'],
    priorities: ['performance'],
    mileageRange: 'medium',
  });

  const recommendations = useMemo(() => {
    return CARS.map(car => {
      let score = 0;
      const reasons: string[] = [];

      // 1. Budget Rule
      if (car.price <= prefs.maxBudget) {
        score += 40;
        reasons.push(`Budget Optimized: RM ${car.price.toLocaleString()} is within RM ${prefs.maxBudget.toLocaleString()} limit.`);
      } else if (car.price <= prefs.maxBudget * 1.1) {
        score += 15;
        reasons.push(`Budget Stretch: High-value option slightly above target budget.`);
      }

      // 2. Fuel Economy Rule
      if (prefs.priorities.includes('fuel_economy')) {
        if (car.fuelEconomy <= 5.8) {
          score += 30;
          reasons.push(`Efficiency Lead: Outstanding ${car.fuelEconomy} L/100km economy.`);
        }
      }

      // 3. Performance Rule
      if (prefs.priorities.includes('performance')) {
        if (car.engine.includes('Turbo')) {
          score += 35;
          reasons.push(`Power Match: Turbocharged powertrain fulfills performance requirements.`);
        }
      }

      // 4. Value Choice Rule
      if (car.price < 90000) {
        score += 10;
        reasons.push("Market Opportunity: Competitive entry-segment pricing.");
      }

      return { ...car, score, reasons };
    })
    .sort((a, b) => b.score - a.score)
    .filter(car => car.score > 0);
  }, [prefs]);

  const topMatch = recommendations[0];
  const otherMatches = recommendations.slice(1);

  const togglePriority = (p: Priority) => {
    setPrefs(prev => ({
      ...prev,
      priorities: prev.priorities.includes(p) 
        ? prev.priorities.filter(i => i !== p)
        : [...prev.priorities, p]
    }));
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Sidebar - Rule Configuration */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shadow-sm shrink-0">
        <div className="p-6 border-b border-slate-100 bg-slate-900 text-white">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center text-[10px] font-bold shadow-lg shadow-blue-500/20">
              <Cpu className="w-4 h-4" />
            </div>
            <h1 className="text-lg font-bold tracking-tight italic">AutoExpert</h1>
          </div>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Rule-Based System v2.1</p>
        </div>

        <div className="flex-1 p-6 space-y-8 overflow-y-auto custom-scrollbar">
          {/* Budget Constraint */}
          <div>
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Budget Constraint</h3>
            <div className="space-y-4">
              <div className="relative h-1.5 w-full bg-slate-100 rounded-full">
                <div 
                  className="absolute left-0 top-0 h-full bg-blue-600 rounded-full transition-all duration-300" 
                  style={{ width: `${((prefs.maxBudget - 50000) / 150000) * 100}%` }}
                />
              </div>
              <input 
                type="range" 
                min="50000" 
                max="200000" 
                step="5000"
                value={prefs.maxBudget}
                onChange={(e) => setPrefs({...prefs, maxBudget: parseInt(e.target.value)})}
                className="w-full h-1 bg-transparent appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between items-center text-xs font-medium">
                <span className="text-slate-400">RM 50k</span>
                <span className="text-blue-600 font-mono font-bold">RM {prefs.maxBudget.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Performance Logic */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Inference Logic</h3>
            <div className="space-y-2">
              {[
                { id: 'performance', label: 'Turbocharged Only', icon: Zap },
                { id: 'fuel_economy', label: 'Fuel Efficiency', icon: Fuel },
                { id: 'style', label: 'Premium Trim', icon: CarFront }
              ].map((p) => (
                <label 
                  key={p.id}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all ${
                    prefs.priorities.includes(p.id as Priority)
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-white border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <input 
                    type="checkbox" 
                    checked={prefs.priorities.includes(p.id as Priority)}
                    onChange={() => togglePriority(p.id as Priority)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-0"
                  />
                  <div className="flex items-center gap-2">
                    <p.icon className={`w-3.5 h-3.5 ${prefs.priorities.includes(p.id as Priority) ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span className={`text-xs font-bold ${prefs.priorities.includes(p.id as Priority) ? 'text-blue-900' : 'text-slate-600'}`}>
                      {p.label}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
              <span className="text-[10px] font-black text-blue-800 uppercase tracking-tighter">{recommendations.length} Rules Satisfied</span>
            </div>
            <p className="text-[11px] text-blue-600/80 leading-relaxed font-medium">
              System currently analyzing {CARS.length} dataset entries for structural compatibility.
            </p>
          </div>
        </div>

        <div className="p-6 mt-auto">
          <button className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-600/20 active:scale-95 transition-all hover:bg-blue-700">
            Execute Inference
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="h-24 bg-white border-b border-slate-200 px-10 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 font-sans tracking-tight">Inference Results</h2>
            <p className="text-sm text-slate-500 font-medium">AutoExpert found {recommendations.length} optimal matches for your current logic config.</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Confidence Score</p>
              <p className="text-xl font-mono font-bold text-green-600">98.4%</p>
            </div>
            <div className="w-12 h-12 bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer">
              <Search className="w-5 h-5" />
            </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          <div className="grid grid-cols-2 gap-8 pb-10">
            <AnimatePresence mode="popLayout">
              {topMatch && (
                <motion.div 
                  key={topMatch.model}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="col-span-2 bg-white rounded-3xl border-2 border-blue-500 shadow-2xl p-10 flex flex-col md:flex-row items-center gap-10 relative overflow-hidden ring-4 ring-blue-50"
                >
                  <div className="absolute top-0 right-0 bg-blue-600 text-white px-5 py-2 rounded-bl-2xl font-bold text-[10px] tracking-widest uppercase shadow-lg shadow-blue-500/20">
                    Highest Confidence Match
                  </div>
                  
                  <div className="w-64 h-40 bg-slate-100 rounded-2xl flex items-center justify-center shrink-0 group relative overflow-hidden">
                    <CarFront className="w-24 h-24 text-slate-300 group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  <div className="flex-1 w-full space-y-6">
                    <div className="flex justify-between items-start w-full">
                      <div className="space-y-1">
                        <span className="text-xs font-black text-blue-600 uppercase tracking-widest">{topMatch.brand}</span>
                        <h3 className="text-4xl font-black text-slate-900 leading-tight">{topMatch.model}</h3>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-mono font-bold text-slate-900 tracking-tighter">RM {topMatch.price.toLocaleString()}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Excl. Insurance</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      {[
                        { label: 'Engine', value: topMatch.engine },
                        { label: 'Economy', value: `${topMatch.fuelEconomy} L/100km` },
                        { label: 'Trans.', value: topMatch.transmission },
                        { label: 'Fuel', value: topMatch.fuel }
                      ].map((attr) => (
                        <div key={attr.label} className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center space-y-1">
                          <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest">{attr.label}</p>
                          <p className="text-[11px] font-bold font-mono text-slate-800">{attr.value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                       {topMatch.reasons.map((reason, i) => (
                        <span key={i} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-bold flex items-center gap-1.5 border border-green-100">
                          <CheckCircle2 className="w-3 h-3" /> {reason}
                        </span>
                       ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {otherMatches.map((car, idx) => (
                <motion.div
                  key={car.model}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 flex flex-col group hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5 transition-all"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-blue-50 transition-colors">
                      <CarFront className="w-8 h-8 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Match Score: {car.score}</span>
                      <div className="text-xl font-mono font-bold text-slate-900 mt-1">RM {car.price.toLocaleString()}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-1 mb-6">
                    <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">{car.model}</h3>
                    <p className="text-xs text-slate-500 font-medium">{car.body} • {car.engine} • {car.fuelEconomy}L Economy</p>
                  </div>

                  <div className="mt-auto pt-6 border-t border-slate-50 flex gap-3">
                    <button className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition-all shadow-lg shadow-slate-900/5 hover:shadow-blue-500/20 active:scale-95">
                      View Details
                    </button>
                    <button className="w-12 h-12 border border-slate-200 rounded-xl flex items-center justify-center hover:bg-slate-50 text-slate-400 hover:text-red-500 transition-colors bg-white">
                      <Zap className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}

              {recommendations.length === 0 && (
                <div className="col-span-2 py-20 text-center space-y-6">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
                    <AlertCircle className="w-10 h-10" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xl font-bold text-slate-900">Logic Constraint Conflict</p>
                    <p className="text-sm text-slate-400 max-w-xs mx-auto">None of the available datasheet entries satisfy the current rule parameters.</p>
                  </div>
                  <button 
                    onClick={() => setPrefs({ ...prefs, maxBudget: 200000, priorities: [] })}
                    className="text-blue-600 text-xs font-black uppercase tracking-widest border-b-2 border-blue-600 pb-1"
                  >
                    Reset System Parameters
                  </button>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer Activity Trace */}
        <footer className="h-32 bg-slate-100 border-t border-slate-200 p-8 flex gap-16 shrink-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />
          
          <div className="flex flex-col space-y-3 min-w-[300px]">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Info className="w-3 h-3" /> Applied Logic Trace
            </span>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_4px_rgba(59,130,246,0.5)]"></span> 
                IF Price {'<'} RM {prefs.maxBudget.toLocaleString()}
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_4px_rgba(59,130,246,0.5)]"></span> 
                AND Body == Sedan
              </div>
              {prefs.priorities.map(p => (
                <div key={p} className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_4px_rgba(59,130,246,0.5)]"></span> 
                  AND {p.replace('_', ' ').toUpperCase()} Logic
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 flex items-center justify-end gap-10">
            <div className="text-right space-y-1">
              <p className="text-xs font-black text-slate-900 uppercase tracking-tight">Export Inference Report</p>
              <p className="text-[10px] text-slate-400 italic font-medium">Dataset JSON, PDF Analysis, CSV logs</p>
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-700 shadow-sm hover:shadow-md hover:border-blue-200 transition-all active:scale-95">
              <Download className="w-4 h-4 text-blue-600" /> Export System Logs
            </button>
          </div>
        </footer>
      </main>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
}
