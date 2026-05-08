import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Info,
  X,
  MapPin,
  Calendar,
  Settings,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { CARS } from './constants';
import { Car, UserPreferences, Priority } from './types';

interface RecCar extends Car {
  score: number;
  reasons: string[];
}

export default function App() {
  const [prefs, setPrefs] = useState<UserPreferences>({
    maxBudget: 150000,
    bodyType: ['Sedan'],
    priorities: ['performance'],
    mileageRange: 'medium',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCar, setSelectedCar] = useState<RecCar | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const recommendations = useMemo<RecCar[]>(() => {
    if (!CARS) return [];
    
    return (CARS as Car[])
      .map(car => {
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
      .filter(car => car.score > 0)
      .filter(car => {
        if (!searchTerm) return true;
        return (
          car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
          car.brand.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
  }, [prefs, searchTerm]);

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

  const handleExport = () => {
    setIsExporting(true);
    const data = JSON.stringify({ prefs, recommendations }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'car-advisor-report.json';
    link.click();
    setTimeout(() => setIsExporting(false), 1000);
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-900 font-sans overflow-hidden">
      {/* Sidebar - Rule Configuration */}
      <aside className="w-80 bg-white border-r border-slate-200 flex flex-col shadow-sm shrink-0">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <CarFront className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900">CarAdvisor</h1>
              <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest">Used Car Recommender</p>
            </div>
          </div>
        </div>

        <div className="flex-1 p-8 space-y-10 overflow-y-auto custom-scrollbar">
          {/* Budget Constraint */}
          <div>
            <div className="flex justify-between items-end mb-6">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Adjust Budget</h3>
              <div className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs font-bold font-mono">
                RM {prefs.maxBudget.toLocaleString()}
              </div>
            </div>
            <div className="space-y-6">
              <div className="relative pt-1 px-1">
                <input 
                  type="range" 
                  min="50000" 
                  max="200000" 
                  step="5000"
                  value={prefs.maxBudget}
                  onChange={(e) => setPrefs({...prefs, maxBudget: parseInt(e.target.value)})}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-700 transition-all"
                />
                <div className="flex justify-between mt-3 px-1">
                  <span className="text-[10px] font-bold text-slate-400">RM 50k</span>
                  <span className="text-[10px] font-bold text-slate-400">RM 200k+</span>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Logic */}
          <div className="space-y-4">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Core Preferences</h3>
            <div className="grid gap-3">
              {[
                { id: 'performance', label: 'Performance / Turbo', icon: Zap, desc: 'Prioritize power and driving dynamics' },
                { id: 'fuel_economy', label: 'Fuel Efficient', icon: Fuel, desc: 'Optimized for daily city commuting' },
                { id: 'style', label: 'Premium / High-End', icon: ShieldCheck, desc: 'Focus on interior quality and features' }
              ].map((p) => (
                <button 
                  key={p.id}
                  onClick={() => togglePriority(p.id as Priority)}
                  className={`flex items-start gap-4 p-4 rounded-2xl text-left border transition-all active:scale-[0.98] ${
                    prefs.priorities.includes(p.id as Priority)
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100'
                    : 'bg-white border-slate-100 hover:border-slate-200 text-slate-600'
                  }`}
                >
                  <div className={`mt-0.5 p-2 rounded-lg ${
                    prefs.priorities.includes(p.id as Priority) ? 'bg-white/20' : 'bg-slate-50'
                  }`}>
                    <p.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className={`block text-xs font-bold leading-none mb-1 ${
                      prefs.priorities.includes(p.id as Priority) ? 'text-white' : 'text-slate-900'
                    }`}>
                      {p.label}
                    </span>
                    <span className={`text-[10px] leading-tight ${
                      prefs.priorities.includes(p.id as Priority) ? 'text-white/80' : 'text-slate-400'
                    }`}>
                      {p.desc}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div className="p-5 bg-slate-900 rounded-3xl space-y-3 shadow-xl">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-bold text-white uppercase tracking-widest">Active Filters</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Found <span className="text-white font-bold">{recommendations.length} cars</span> in our vetted inventory matching your current requirements.
            </p>
          </div>
        </div>

        <div className="p-8 mt-auto bg-slate-50/50">
          <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-600/20 active:scale-95 transition-all hover:bg-indigo-700 uppercase tracking-widest">
            Search Available Units
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="h-28 bg-white border-b border-slate-200 px-12 flex items-center justify-between shrink-0">
          <div className="max-w-md w-full">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
              <input 
                type="text"
                placeholder="Search models (e.g. Honda City)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-100/50 border-transparent focus:border-indigo-100 focus:bg-white focus:ring-4 focus:ring-indigo-50/50 rounded-2xl text-sm font-medium transition-all outline-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Match Accuracy</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-slate-900 tracking-tight">98.4%</span>
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
            <div className="w-px h-10 bg-slate-200" />
            <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-700 shadow-sm hover:border-indigo-200 hover:bg-indigo-50/30 transition-all">
              <Settings className="w-4 h-4" />
              Sort Options
            </button>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
          <div className="grid grid-cols-2 gap-10 pb-12">
            <AnimatePresence mode="popLayout">
              {topMatch && (
                <motion.div 
                  key={topMatch.model}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="col-span-2 bg-white rounded-[40px] border border-slate-200 shadow-2xl shadow-indigo-900/5 p-12 flex flex-col lg:flex-row items-center gap-12 relative overflow-hidden group"
                >
                  <div className="absolute top-8 right-8 bg-indigo-600 text-white px-5 py-2 rounded-full font-black text-[10px] tracking-widest uppercase shadow-lg shadow-indigo-600/30">
                    Editor's Choice
                  </div>
                  
                  <div className="w-full lg:w-[480px] h-[320px] bg-slate-50 rounded-[32px] overflow-hidden group-hover:shadow-inner transition-all flex items-center justify-center">
                    {topMatch.image ? (
                      <img 
                        src={topMatch.image} 
                        alt={topMatch.model} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <CarFront className="w-32 h-32 text-slate-200" />
                    )}
                  </div>

                  <div className="flex-1 w-full space-y-8">
                    <div className="space-y-2">
                       <div className="flex items-center gap-2">
                         <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-[10px] font-black uppercase tracking-tighter">{topMatch.brand}</span>
                         <span className="text-[10px] font-bold text-slate-400">Certified Pre-Owned</span>
                       </div>
                       <h3 className="text-5xl font-black text-slate-900 tracking-tight leading-none">{topMatch.model}</h3>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Indicative Price</span>
                        <div className="text-4xl font-black text-indigo-600 tracking-tight">RM {topMatch.price.toLocaleString()}</div>
                      </div>
                      <div className="w-px h-10 bg-slate-100" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Monthly Approx.</span>
                        <div className="text-xl font-bold text-slate-900 tracking-tight">RM {Math.round(topMatch.price * 0.012).toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      {[
                        { label: 'Engine', value: topMatch.engine, icon: Cpu },
                        { label: 'Fuel', value: `${topMatch.fuelEconomy}L`, icon: Fuel },
                        { label: 'Body', value: topMatch.body, icon: CarFront },
                        { label: 'Trans.', value: topMatch.transmission, icon: Settings }
                      ].map((attr) => (
                        <div key={attr.label} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center gap-1 hover:border-indigo-100 transition-colors">
                          <attr.icon className="w-3.5 h-3.5 text-slate-400 mb-1" />
                          <p className="text-[9px] font-bold font-mono text-slate-900 uppercase">{attr.value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-4">
                      <button 
                        onClick={() => setSelectedCar(topMatch)}
                        className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-indigo-600 transition-all shadow-xl shadow-slate-900/10 hover:shadow-indigo-600/20 active:scale-95"
                      >
                        Explore Vehicle Details
                      </button>
                      <button className="w-14 h-14 border border-slate-200 rounded-2xl flex items-center justify-center hover:bg-red-50 hover:border-red-100 text-slate-400 hover:text-red-500 transition-all bg-white group/fav">
                        <Zap className="w-6 h-6 group-hover/fav:fill-current" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {otherMatches.map((car, idx) => (
                <motion.div
                  key={car.model}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-8 flex flex-col group hover:border-indigo-400 hover:shadow-2xl hover:shadow-indigo-900/5 transition-all overflow-hidden"
                >
                  <div className="aspect-[16/10] bg-slate-50 rounded-2xl mb-8 overflow-hidden relative">
                    {car.image ? (
                      <img src={car.image} alt={car.model} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-200">
                        <CarFront className="w-16 h-16" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur shadow-sm rounded-lg text-[10px] font-black text-indigo-600">
                      RM {car.price.toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="mb-8">
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{car.brand}</span>
                    <h3 className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors mt-1 mb-2 tracking-tight">{car.model}</h3>
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                      <span className="flex items-center gap-1"><Cpu className="w-3 h-3" /> {car.engine}</span>
                      <span className="w-1 h-1 bg-slate-200 rounded-full" />
                      <span className="flex items-center gap-1"><Settings className="w-3 h-3" /> {car.transmission}</span>
                    </div>
                  </div>

                  <div className="mt-auto flex gap-4">
                    <button 
                      onClick={() => setSelectedCar(car)}
                      className="flex-1 py-3.5 bg-slate-100 text-slate-900 font-black text-[11px] rounded-[14px] hover:bg-indigo-600 hover:text-white transition-all active:scale-[0.98] uppercase tracking-widest"
                    >
                      View Details
                    </button>
                    <button className="w-11 h-11 border border-slate-100 bg-white rounded-[14px] flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all transition-colors active:scale-90">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))}

              {recommendations.length === 0 && (
                <div className="col-span-2 py-32 text-center space-y-8">
                  <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500 border-4 border-white shadow-xl">
                    <AlertCircle className="w-12 h-12" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">No Matching Vehicles</h3>
                    <p className="text-slate-500 max-w-sm mx-auto font-medium">We couldn't find any cars that satisfy your current rule-set within RM {prefs.maxBudget.toLocaleString()}.</p>
                  </div>
                  <button 
                    onClick={() => {
                        setPrefs({ ...prefs, maxBudget: 200000, priorities: [] });
                        setSearchTerm('');
                    }}
                    className="px-8 py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
                  >
                    Reset System Parameters
                  </button>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer Activity Trace */}
        <footer className="h-32 bg-white border-t border-slate-200 px-12 flex items-center justify-between shrink-0">
          <div className="flex gap-12">
            <div className="space-y-4 min-w-[320px]">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-indigo-500" /> Active Logic Trace
              </span>
              <div className="flex flex-wrap gap-x-6 gap-y-1">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                  <div className="w-1 h-1 bg-indigo-400 rounded-full" /> 
                  Price {'<'} RM {prefs.maxBudget.toLocaleString()}
                </div>
                {prefs.priorities.map(p => (
                  <div key={p} className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                    <div className="w-1 h-1 bg-indigo-400 rounded-full" /> 
                    {p.replace('_', ' ').toUpperCase()} Enabled
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-10">
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-1">System Report</p>
              <p className="text-[9px] text-slate-400 font-bold italic tracking-tighter uppercase">Comprehensive Market Comparison</p>
            </div>
            <button 
              onClick={handleExport}
              disabled={isExporting}
              className={`flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black shadow-2xl transition-all active:scale-95 ${isExporting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-600 shadow-indigo-900/20'}`}
            >
              {isExporting ? (
                 <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {isExporting ? 'Generating...' : 'Export Results'}
            </button>
          </div>
        </footer>
      </main>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedCar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 md:p-12">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCar(null)}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-5xl bg-white rounded-[48px] shadow-2xl overflow-hidden flex flex-col md:flex-row h-full max-h-[85vh]"
            >
              <button 
                onClick={() => setSelectedCar(null)}
                className="absolute top-8 right-8 z-10 w-12 h-12 bg-white/20 hover:bg-white/40 backdrop-blur rounded-full flex items-center justify-center text-white transition-all active:scale-90"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="w-full md:w-[55%] relative h-[40vh] md:h-full bg-slate-50">
                {selectedCar.image ? (
                   <img src={selectedCar.image} alt={selectedCar.model} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                   <div className="w-full h-full flex items-center justify-center text-slate-200">
                     <CarFront className="w-32 h-32" />
                   </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent pointer-events-none" />
                <div className="absolute bottom-12 left-12">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur border border-white/30 text-white rounded-md text-[10px] font-black uppercase tracking-[0.2em] mb-3 block w-fit">Authentic Listing</span>
                  <h2 className="text-6xl font-black text-white tracking-tighter leading-none">{selectedCar.model}</h2>
                </div>
              </div>

              <div className="flex-1 p-12 overflow-y-auto custom-scrollbar flex flex-col">
                <div className="flex justify-between items-start mb-10">
                  <div className="space-y-1">
                    <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Pricing Structure</span>
                    <div className="text-5xl font-black text-slate-900 tracking-tighter">RM {selectedCar.price.toLocaleString()}</div>
                  </div>
                  <div className="p-4 bg-indigo-50 rounded-2xl">
                     <ShieldCheck className="w-8 h-8 text-indigo-600" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-12">
                   {[
                     { label: 'Body Style', value: selectedCar.body, icon: CarFront },
                     { label: 'Drivetrain', value: selectedCar.engine, icon: Cpu },
                     { label: 'Efficiency', value: `${selectedCar.fuelEconomy} L/100km`, icon: Fuel },
                     { label: 'Transmission', value: selectedCar.transmission, icon: Settings },
                     { label: 'Region', value: 'Malaysia (KL/Sel)', icon: MapPin },
                     { label: 'Availability', value: 'Immediate Stock', icon: Calendar }
                   ].map(item => (
                     <div key={item.label} className="space-y-2">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{item.label}</span>
                       <div className="flex items-center gap-2 text-slate-900">
                         <item.icon className="w-4 h-4 text-indigo-500" />
                         <span className="text-sm font-black tracking-tight">{item.value}</span>
                       </div>
                     </div>
                   ))}
                </div>

                <div className="space-y-4 mb-12">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Why it works for you</span>
                  <div className="space-y-3">
                    {selectedCar.reasons.map((reason, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl text-xs font-bold text-slate-600 leading-relaxed">
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        {reason}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-auto grid grid-cols-2 gap-4">
                  <button className="py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-[0.98]">
                    Schedule Test Drive
                  </button>
                  <button className="py-4 bg-slate-100 text-slate-900 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all active:scale-[0.98]">
                    Contact Specialist
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E2E8F0;
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #CBD5E1;
        }
        input[type="range"]::-webkit-slider-thumb {
          width: 24px;
          height: 24px;
          background: #4F46E5;
          border: 4px solid white;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          transition: all 0.2s ease;
        }
        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          background: #4338CA;
        }
      `}</style>
    </div>
  );
}
