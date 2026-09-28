'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  Stethoscope, 
  HeartPulse, 
  HardHat, 
  ChevronDown, 
  Check, 
  Info,
  Sparkles,
  UserCheck
} from 'lucide-react';
import { DEMO_PERSONAS, DemoUser, COOKIE_NAME, getDefaultPersona } from '@/lib/session';

export const RolePersonaSwitcher: React.FC = () => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<DemoUser>(getDefaultPersona());
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Baca dari cookie saat pertama kali dimuat
    const cookies = document.cookie.split('; ');
    const sessionCookie = cookies.find(row => row.startsWith(`${COOKIE_NAME}=`));
    if (sessionCookie) {
      try {
        const val = decodeURIComponent(sessionCookie.split('=')[1]);
        const parsed = JSON.parse(val);
        const match = DEMO_PERSONAS.find(p => p.id === parsed.id || p.role === parsed.role);
        if (match) setCurrentUser(match);
      } catch (err) {
        console.error('Failed to parse persona cookie:', err);
      }
    }
  }, []);

  const handleSelectPersona = (persona: DemoUser) => {
    setCurrentUser(persona);
    setIsOpen(false);
    // Tulis ke cookie
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(persona))}; path=/; max-age=604800; SameSite=Lax`;
    
    // Refresh router agar middleware dan server context mengadopsi role baru seketika
    router.refresh();
  };

  const getRoleIcon = (role: DemoUser['role']) => {
    switch (role) {
      case 'OCCUPATIONAL_DOCTOR':
        return <Stethoscope className="w-4 h-4 text-emerald-600" />;
      case 'PARAMEDIC':
        return <HeartPulse className="w-4 h-4 text-sky-600" />;
      case 'HSSE_OFFICER':
        return <ShieldCheck className="w-4 h-4 text-amber-600" />;
      case 'WORKER':
        return <HardHat className="w-4 h-4 text-rose-600" />;
      default:
        return <UserCheck className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition shadow-2xs text-left"
        title="Ganti Persona Pengguna Demo"
      >
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${currentUser.avatarColor}`}>
          {currentUser.name.charAt(0)}
        </div>
        <div className="hidden lg:block">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-800 leading-none">{currentUser.name}</span>
            <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              {currentUser.badge}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-medium block truncate max-w-[140px]">
            {currentUser.title}
          </span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Modal */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-3 space-y-2 animate-in fade-in-50 zoom-in-95">
            
            <div className="px-2 py-1.5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                <span className="text-xs font-bold text-slate-800">Pilih Persona Uji Coba (Demo RBAC)</span>
              </div>
              <span className="text-[10px] bg-rose-50 text-rose-600 font-semibold px-2 py-0.5 rounded-full">
                1-Klik Switch
              </span>
            </div>

            <div className="space-y-1.5">
              {DEMO_PERSONAS.map((persona) => {
                const isSelected = currentUser.id === persona.id;
                return (
                  <button
                    key={persona.id}
                    onClick={() => handleSelectPersona(persona)}
                    className={`w-full text-left p-2.5 rounded-xl border transition flex items-start gap-3 ${
                      isSelected
                        ? 'bg-rose-50/60 border-rose-200 shadow-2xs'
                        : 'border-transparent hover:bg-slate-50 hover:border-slate-200'
                    }`}
                  >
                    <div className="mt-0.5 p-1.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                      {getRoleIcon(persona.role)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {persona.name}
                        </span>
                        {isSelected && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-100/60 px-1.5 py-0.5 rounded-md">
                            <Check className="w-3 h-3" />
                            Aktif
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-semibold text-slate-600">{persona.badge}</div>
                      <p className="text-[10px] text-slate-500 mt-1 leading-snug">
                        {persona.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="p-2 bg-slate-50 rounded-xl border border-slate-200/80 text-[10px] text-slate-500 flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>
                Setiap peran memiliki izin akses rute berbeda dan tercatat secara otomatis pada tabel audit trail UU PDP No. 27/2022.
              </span>
            </div>

          </div>
        </>
      )}
    </div>
  );
};
