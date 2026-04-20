import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  MapPin, 
  Phone, 
  Shield, 
  Search, 
  Loader2, 
  ChevronDown, 
  Building2,
  UserCheck,
  Radio,
  GanttChart,
  BadgeCheck,
  AlertCircle,
  Map,
  RotateCw,
  RefreshCcw,
  RefreshCw
} from 'lucide-react';
import { getConstituencies, getDataByConstituency } from './dataService.ts';
import { ConstituencyData, OfficerInfo, ZonalTeam, PoliceInspector, SupervisorGroup } from './types.ts';

const WhatsAppIcon = ({ size = 18 }: { size?: number }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 448 512" 
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.6-2.8-23.6-8.7-45-27.7-16.6-14.9-27.7-33.2-31-38.8-3.2-5.6-.3-8.6 2.5-11.4 2.5-2.5 5.5-6.5 8.3-9.7 2.8-3.2 3.7-5.6 5.6-9.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.8 23.5 9.2 31.6 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
  </svg>
);

const SectionHeader = ({ icon: Icon, title, className = "" }: { icon: any, title: string, className?: string }) => (
  <div className={`flex items-center gap-3 mb-4 pb-2 border-b border-slate-200 ${className}`}>
    <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
      <Icon size={18} />
    </div>
    <h3 className="text-xs font-black uppercase tracking-widest text-slate-700">{title}</h3>
  </div>
);

const Card = ({ children, className = "", ...props }: { children: React.ReactNode, className?: string, [key: string]: any }) => (
  <motion.div 
    {...props}
    whileHover={{ y: -2 }}
    className={`bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-200 ${className}`}
  >
    {children}
  </motion.div>
);

const InfoRow = ({ label = "", value, isPhone = false, colorScheme = 'indigo' }: { label?: string, value: string, isPhone?: boolean, colorScheme?: 'indigo' | 'orange' | 'amber' }) => {
  if (!value) return null;
  
  const colors = {
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', hoverBg: 'group-hover/btn:bg-indigo-100', hoverText: 'group-hover/btn:text-indigo-600' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-500', hoverBg: 'group-hover/btn:bg-orange-100', hoverText: 'group-hover/btn:text-amber-600' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-500', hoverBg: 'group-hover/btn:bg-amber-100', hoverText: 'group-hover/btn:text-amber-600' }
  };
  
  const theme = colors[colorScheme];

  return (
    <div className="group">
      {label && <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>}
      {isPhone ? (
        <div className="flex items-center gap-3">
          <a href={`tel:${value}`} className="inline-flex items-center gap-4 group/btn flex-1">
            <div className={`p-2.5 ${theme.bg} ${theme.text} ${theme.hoverBg} rounded-xl transition-colors shrink-0`}>
              <Phone size={16} />
            </div>
            <span className={`text-lg font-black text-slate-600 ${theme.hoverText} transition-colors tracking-tight truncate`}>{value}</span>
          </a>
          <a 
            href={`https://wa.me/${value.replace(/\D/g, '').length === 10 ? '91' : ''}${value.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl transition-all duration-200 flex items-center justify-center border border-emerald-100 shrink-0 shadow-sm shadow-emerald-100/50"
            title="Chat on WhatsApp"
          >
            <WhatsAppIcon size={18} />
          </a>
        </div>
      ) : (
        <p className="text-lg font-black text-slate-900 mb-1">{value}</p>
      )}
    </div>
  );
};

const categories = [
  { id: 'ro', name: 'RO Details', icon: Building2 },
  { id: 'aro', name: 'ARO Details', icon: Users },
  { id: 'fst', name: 'FST Details', icon: Shield },
  { id: 'sst', name: 'SST Details', icon: Shield },
  { id: 'zonal', name: 'Zonal officer Details', icon: GanttChart },
  { id: 'dsp', name: 'DSP Details', icon: BadgeCheck },
  { id: 'assembly-insp', name: 'Assembly Inspector Details', icon: Shield },
  { id: 'psi', name: 'Inspector Details', icon: Shield },
  { id: 'coordinator', name: 'Assembly Coordinator Details', icon: Radio },
  { id: 'supervisor', name: 'Supervisor Details', icon: Users },
];

export default function App() {
  const [constituencies, setConstituencies] = useState<string[]>([]);
  const [selectedAC, setSelectedAC] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ConstituencyData | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      try {
        setError(null);
        const acs = await getConstituencies();
        if (acs.length === 0) {
          setError("No constituency data could be loaded. Please ensure the Google Sheets are shared as 'Anyone with the link can view' and published to the web.");
        }
        setConstituencies(acs);
      } catch (err) {
        setError("Failed to initialize database connection. Please check your network and sheet access permissions.");
        console.error(err);
      } finally {
        setInitialLoading(false);
      }
    };
    init();
  }, []);

  const handleSearch = async () => {
    if (!selectedAC) return;
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const result = await getDataByConstituency(selectedAC);
      if (!result) {
        setError(`No detailed data found for "${selectedAC}".`);
      }
      setData(result);
      if (result) {
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
        }, 100);
      }
    } catch (err) {
      setError("An error occurred while fetching details.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedAC("");
    setSelectedCategory("all");
    setData(null);
    setError(null);
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen grid place-items-center bg-white">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <Loader2 className="animate-spin text-indigo-600" size={64} strokeWidth={1.5} />
            <div className="absolute inset-0 bg-indigo-600/10 blur-xl rounded-full animate-pulse" />
          </div>
          <div className="text-center">
            <p className="text-slate-900 font-black text-xl mb-1">Tenkasi District Plan</p>
            <p className="text-slate-400 text-sm font-black uppercase tracking-widest">Synchronizing Secure Database...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] relative overflow-hidden text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Mesh Background Accents */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-200/10 blur-[120px] rounded-full" />
        <div className="absolute top-[30%] right-[-10%] w-[40%] h-[40%] bg-orange-200/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[10%] w-[60%] h-[50%] bg-blue-100/15 blur-[150px] rounded-full" />
      </div>
      {/* Dynamic Header / Hero */}
      <div className="bg-white pt-10 pb-16 border-b border-slate-200">
        <div className="max-w-[1400px] mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-2"
          >
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter flex flex-col sm:flex-row flex-wrap justify-center gap-x-4 items-center leading-none">
              <span className="bg-clip-text text-transparent bg-gradient-to-br from-indigo-700 via-blue-800 to-indigo-900 filter drop-shadow-sm">
                Tenkasi District
              </span>
              <span className="bg-clip-text text-transparent bg-gradient-to-br from-orange-500 via-amber-600 to-red-600 filter drop-shadow-sm italic">
                Communication Plan
              </span>
            </h1>
          </motion.div>
          
          <div className="flex items-center justify-center gap-4 mb-12">
            <div className="h-[2px] w-8 md:w-16 bg-gradient-to-r from-transparent to-indigo-200 hidden sm:block"></div>
            <p className="text-[10px] md:text-xs font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-400 via-indigo-600 to-slate-400 tracking-[0.6em] uppercase">
              Constituency Wise - Directory
            </p>
            <div className="h-[2px] w-8 md:w-16 bg-gradient-to-l from-transparent to-indigo-200 hidden sm:block"></div>
          </div>

          {/* Search Box Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto bg-white rounded-[3rem] shadow-2xl shadow-indigo-100/50 border border-slate-100 p-8 md:p-10"
          >
            <div className="space-y-8">
              {/* AC Selection Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#22C55E]">
                  <Map size={18} />
                  <span className="text-[10px] font-black uppercase tracking-wider">Select Assembly Constituency</span>
                </div>
                <button 
                  onClick={() => window.location.reload()}
                  className="flex items-center gap-2 text-[#2563EB] hover:opacity-70 transition-opacity"
                >
                  <RefreshCw size={14} />
                  <span className="text-[10px] font-black uppercase tracking-wider">Refresh Database</span>
                </button>
              </div>

              {/* AC Dropdown */}
              <div className="relative group">
                <select
                  value={selectedAC}
                  onChange={(e) => setSelectedAC(e.target.value)}
                  className="w-full h-16 bg-[#F8FAFC] border-2 border-slate-100 rounded-2xl px-6 pr-12 text-base font-black appearance-none transition-all outline-none focus:border-indigo-500 focus:bg-white group-hover:border-slate-200"
                >
                  <option value="">Choose Constituency...</option>
                  {constituencies.map((ac) => (
                    <option key={ac} value={ac}>{ac}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-indigo-600 transition-colors pointer-events-none" size={20} />
              </div>

              {/* Category Selection Header */}
              <div className="flex items-center gap-2 text-[#2563EB]">
                <Users size={18} />
                <span className="text-[10px] font-black uppercase tracking-wider">Select Personnel Category</span>
              </div>

              {/* Category Dropdown */}
              <div className="relative group">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full h-16 bg-[#F8FAFC] border-2 border-slate-100 rounded-2xl px-6 pr-12 text-base font-black appearance-none transition-all outline-none focus:border-indigo-500 focus:bg-white group-hover:border-slate-200"
                >
                  <option value="all">All</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-indigo-600 transition-colors pointer-events-none" size={20} />
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSearch}
                  disabled={!selectedAC || loading}
                  className="flex-1 h-16 bg-[#818CF8] hover:bg-[#6366F1] disabled:bg-slate-200 text-white font-black rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-indigo-100/50 transition-all text-sm uppercase tracking-widest"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={22} />}
                  Search
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleReset}
                  className="w-16 h-16 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-500 transition-all shadow-xl shadow-slate-100/20"
                >
                  <RefreshCcw size={20} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <main className="max-w-[1400px] mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          {error ? (
            <motion.div
              key="error-hero"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="mb-8 bg-rose-50 border border-rose-100 p-6 rounded-2xl text-rose-700 flex items-center gap-4"
            >
              <AlertCircle size={24} />
              <p className="font-black text-xs uppercase tracking-widest">{error}</p>
            </motion.div>
          ) : !data && !loading ? (
            <motion.div
              key="empty-hero"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="py-32 text-center"
            >
              <div className="mb-6 inline-flex p-6 bg-white rounded-3xl shadow-sm border border-slate-100">
                <Search size={48} className="text-slate-200" />
              </div>
              <h2 className="text-2xl font-black text-slate-400 mb-2">Search Directory</h2>
              <p className="text-slate-400 font-black text-xs uppercase tracking-widest">Select a constituency from the top menu to view the officer database.</p>
            </motion.div>
          ) : data && !loading ? (
            <motion.div
              key="results-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-4xl mx-auto w-full"
            >
              {/* Main Content Area */}
              <div ref={resultsRef} className="space-y-12">
                
                {/* RO SECTION */}
                {(selectedCategory === 'all' || selectedCategory === 'ro') && (
                  <section id="ro" className="scroll-mt-32">
                    <SectionHeader icon={Building2} title="RO Details" />
                    <Card className="border-t-4 border-t-indigo-600 p-8 bg-indigo-50/30">
                      <InfoRow value={data.ro.name} />
                      <div className="mt-6">
                        <InfoRow label="Mobile Number" value={data.ro.number} isPhone />
                      </div>
                    </Card>
                  </section>
                )}

                {/* ARO SECTION */}
                {(selectedCategory === 'all' || selectedCategory === 'aro') && (
                  <section id="aro" className="scroll-mt-32">
                    <SectionHeader icon={Users} title="ARO Details" />
                    <Card className="border-t-4 border-t-sky-400 bg-sky-50/30">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12 p-4">
                        {data.aros.map((aro, i) => (
                          <div key={i} className="flex flex-col gap-6">
                            <InfoRow label={aro.role} value={aro.name} />
                            <InfoRow label="Mobile Number" value={aro.number} isPhone />
                          </div>
                        ))}
                      </div>
                    </Card>
                  </section>
                )}

                {/* FST SECTION */}
                {(selectedCategory === 'all' || selectedCategory === 'fst') && (
                  <section id="fst" className="scroll-mt-32">
                    <SectionHeader icon={Shield} title="FST Details" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {data.fstTeams.map((team, i) => (
                        <Card key={i} className="border-t-4 border-t-slate-400 p-8 space-y-8 bg-slate-50/50">
                          <InfoRow value={team.name} />
                          <InfoRow label="Mobile Number" value={team.number} isPhone />
                        </Card>
                      ))}
                    </div>
                  </section>
                )}

                {/* SST SECTION */}
                {(selectedCategory === 'all' || selectedCategory === 'sst') && (
                  <section id="sst" className="scroll-mt-32">
                    <SectionHeader icon={Shield} title="SST Details" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {data.sstTeams.map((team, i) => (
                        <Card key={i} className="border-t-4 border-t-slate-400 p-8 space-y-8 bg-slate-50/50">
                          <InfoRow value={team.name} />
                          <InfoRow label="Mobile Number" value={team.number} isPhone />
                        </Card>
                      ))}
                    </div>
                  </section>
                )}

                {/* ZONAL SECTION */}
                {(selectedCategory === 'all' || selectedCategory === 'zonal') && (
                  <section id="zonal" className="scroll-mt-32">
                    <SectionHeader icon={GanttChart} title="Zonal officer Details" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {data.zonalTeams.map((team, i) => (
                        <Card key={i} className="border-t-4 border-t-orange-500 flex flex-col h-full bg-orange-50/20">
                          <div className="p-6 bg-orange-100/30 border-b border-orange-100/50">
                            <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Coverage</p>
                            <p className="text-xl font-black text-orange-950 uppercase">{team.pollingStations}</p>
                          </div>
                          
                          <div className="p-6 space-y-6 flex-1">
                            <div className="space-y-4">
                              <InfoRow label="Zonal Officer" value={team.officerName} />
                              <InfoRow label="Mobile Number" value={team.officerNumber} isPhone colorScheme="orange" />
                            </div>
                            
                            <div className="h-[1px] bg-slate-100 w-full" />

                            <div className="space-y-4">
                              <InfoRow label="Assistant Officer" value={team.assistantName} />
                              <InfoRow label="Mobile Number" value={team.assistantNumber} isPhone />
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </section>
                )}

                {/* DSP SECTION */}
                {(selectedCategory === 'all' || selectedCategory === 'dsp') && (
                  <section id="dsp" className="scroll-mt-32">
                    <SectionHeader icon={BadgeCheck} title="DSP Details" />
                    <Card className="border-t-4 border-t-amber-500 p-8 space-y-6 bg-amber-50/30">
                      <InfoRow label="Subdivision" value={data.dsp.subdivision} />
                      <InfoRow label="DSP Officer" value={data.dsp.name} />
                      <InfoRow label="Mobile Number" value={data.dsp.number} isPhone colorScheme="amber" />
                    </Card>
                  </section>
                )}

                {/* ASSEMBLY INSPECTOR SECTION */}
                {(selectedCategory === 'all' || selectedCategory === 'assembly-insp') && (
                  <section id="assembly-insp" className="scroll-mt-32">
                    <SectionHeader icon={Shield} title="Assembly Inspector Details" />
                    <Card className="border-t-4 border-t-amber-500 p-8 space-y-6 bg-amber-50/30">
                      <InfoRow label="Assembly Inspector" value={data.assemblyInspector.name} />
                      <InfoRow label="Mobile Number" value={data.assemblyInspector.number} isPhone colorScheme="amber" />
                    </Card>
                  </section>
                )}

                {/* PSI SECTION */}
                {(selectedCategory === 'all' || selectedCategory === 'psi') && (
                  <section id="psi" className="scroll-mt-32">
                    <SectionHeader icon={Shield} title="Inspector Details" />
                    <Card className="border-t-4 border-t-amber-500 bg-amber-50/20">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12 p-8">
                        {data.policeStationInspectors.map((psi, i) => (
                          <div key={i} className="space-y-6">
                            <InfoRow label={psi.policeStation} value={psi.inspectorName} />
                            <InfoRow label="Mobile Number" value={psi.inspectorNumber} isPhone colorScheme="amber" />
                          </div>
                        ))}
                      </div>
                    </Card>
                  </section>
                )}

                {/* COORDINATOR SECTION */}
                {(selectedCategory === 'all' || selectedCategory === 'coordinator') && (
                  <section id="coordinator" className="scroll-mt-32">
                    <SectionHeader icon={Radio} title="Assembly Coordinator Details" />
                    <Card className="border-t-4 border-t-indigo-500 p-8 space-y-6 bg-indigo-50/30">
                      <InfoRow label="Coordinator" value={data.assemblyCoordinator.name} />
                      <InfoRow label="Mobile Number" value={data.assemblyCoordinator.number} isPhone />
                    </Card>
                  </section>
                )}

                {/* SUPERVISOR SECTION */}
                {(selectedCategory === 'all' || selectedCategory === 'supervisor') && (
                  <section id="supervisor" className="scroll-mt-32">
                    <SectionHeader icon={Users} title="Supervisor Details" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {data.supervisors.map((sv, i) => (
                        <Card key={i} className="border-t-4 border-t-emerald-500 flex flex-col h-full bg-emerald-50/20">
                          <div className="p-6 bg-emerald-100/30 border-b border-emerald-100/50">
                            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Coverage</p>
                            <p className="text-xl font-black text-emerald-950 uppercase">{sv.pollingStations}</p>
                          </div>
                          
                          <div className="p-6 flex-1">
                            <InfoRow label="Supervisor" value={sv.name} />
                            <div className="mt-4">
                              <InfoRow label="Mobile Number" value={sv.number} isPhone />
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </section>
                )}

              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-slate-200 py-16 bg-indigo-50/20 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8 opacity-40">
          <div className="text-center md:text-left">
             <p className="text-lg font-black tracking-tight leading-none">Tenkasi District</p>
             <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-1">Strategic Communication Plan</p>
          </div>
          <div className="flex gap-4">
             <div className="w-8 h-8 rounded-full border border-slate-200 grid place-items-center"><Shield size={14} /></div>
             <div className="w-8 h-8 rounded-full border border-slate-200 grid place-items-center"><MapPin size={14} /></div>
          </div>
        </div>
      </footer>
    </div>
  );
}
