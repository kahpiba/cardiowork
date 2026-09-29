'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Stethoscope, 
  HeartPulse, 
  HardHat, 
  ChevronDown, 
  Check, 
  Info,
  Sparkles, 
  UserCheck,
  LogOut,
  LogIn
} from 'lucide-react';
import { DEMO_PERSONAS, DemoUser, COOKIE_NAME, isPathAllowed } from '@/lib/session';

interface RolePersonaSwitcherProps {
  onUserChange?: (user: DemoUser | null) => void;
}

export const RolePersonaSwitcher: React.FC<RolePersonaSwitcherProps> = ({ onUserChange }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<DemoUser | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Baca dari cookie saat pertama kali dimuat
    const cookies = document.cookie.split('; ');
    const sessionCookie = cookies.find(row => row.startsWith(`${COOKIE_NAME}=`));
    if (sessionCookie) {
      try {
        const val = decodeURIComponent(sessionCookie.split('=')[1]);
        const parsed = JSON.parse(val);
        const match = DEMO_PERSONAS.find(p => p.id === parsed.id || p.role === parsed.role);
        if (match) {
          setCurrentUser(match);
          onUserChange?.(match);
        }
      } catch (err) {
        console.error('Failed to parse persona cookie:', err);
      }
    }
    setIsLoaded(true);
  }, [pathname, onUserChange]);

  const handleSelectPersona = (persona: DemoUser) => {
    setCurrentUser(persona);
    onUserChange?.(persona);
    setIsOpen(false);

    // Tulis ke cookie (7 hari)
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(persona))}; path=/; max-age=604800; SameSite=Lax`;
    
    // Jika path saat ini tidak diizinkan untuk peran baru, arahkan ke defaultPath peran baru
    if (!isPathAllowed(persona.role, pathname)) {
      router.push(persona.defaultPath);
    } else {
      router.refresh();
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    onUserChange?.(null);
    setIsOpen(false);

    // Hapus cookie
    document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;

    router.push('/login');
    router.refresh();
  };

  const getRoleIcon = (role: DemoUser['role']) => {
    switch (role) {
      case 'OCCUPATIONAL_DOCTOR':
        return <Stethoscope className="w-4 h-4 text-rose-700" />;
      case 'PARAMEDIC':
        return <HeartPulse className="w-4 h-4 text-emerald-700" />;
      case 'HSSE_OFFICER':
        return <ShieldCheck className="w-4 h-4 text-amber-700" />;
      case 'WORKER':
        return <HardHat className="w-4 h-4 text-stone-700" />;
      default:
        return <UserCheck className="w-4 h-4 text-stone-600" />;
    }
  };

  if (!isLoaded) {
    return <div className="w-24 h-8 bg-stone-100 rounded-xl animate-pulse" />;
  }

  // Jika belum login, tampilkan tombol Masuk / Login
  if (!currentUser) {
    return (
      <Link
        href="/login"
        className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs shadow-2xs transition"
      >
        <LogIn className="w-3.5 h-3.5" />
        <span>Masuk / Login</span>
      </Link>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 transition shadow-2xs text-left"
        title="Menu Akun & Ganti Peran"
      >
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${currentUser.avatarColor}`}>
          {currentUser.name.charAt(0)}
        </div>
        <div className="hidden lg:block">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-stone-800 leading-none">{currentUser.name}</span>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
              {currentUser.badge}
            </span>
          </div>
          <span className="text-[11px] text-stone-500 font-medium block truncate max-w-[130px]">
            {currentUser.department.split('(')[0]}
          </span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-stone-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Modal */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-stone-200 rounded-2xl shadow-xl z-50 p-3 space-y-2 animate-in fade-in-50 zoom-in-95">
            
            {/* User Profile Summary */}
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-900">{currentUser.name}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                  {currentUser.badge}
                </span>
              </div>
              <div className="text-[11px] text-stone-500">{currentUser.title}</div>
              <div className="text-[11px] text-stone-400 font-mono">{currentUser.email}</div>
            </div>

            {/* Persona Switcher Section */}
            <div className="px-2 pt-2 border-t border-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-rose-700" />
                <span className="text-xs font-bold text-stone-800">Ganti Persona Demo (RBAC)</span>
              </div>
              <span className="text-[10px] bg-rose-50 text-rose-800 font-semibold px-2 py-0.5 rounded-full border border-rose-200">
                1-Klik Switch
              </span>
            </div>

            <div className="space-y-1 max-h-56 overflow-y-auto">
              {DEMO_PERSONAS.map((persona) => {
                const isSelected = currentUser.id === persona.id;
                return (
                  <button
                    key={persona.id}
                    onClick={() => handleSelectPersona(persona)}
                    className={`w-full text-left p-2 rounded-xl border transition flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-rose-50/70 border-rose-300 shadow-2xs'
                        : 'border-transparent hover:bg-stone-50 hover:border-stone-200'
                    }`}
                  >
                    <div className="mt-0.5 p-1 rounded-lg bg-white border border-stone-200 shadow-2xs">
                      {getRoleIcon(persona.role)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-stone-900 truncate">
                          {persona.name}
                        </span>
                        {isSelected && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-rose-800 bg-rose-100/80 px-1.5 py-0.5 rounded">
                            <Check className="w-2.5 h-2.5" />
                            Aktif
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-semibold text-stone-600">{persona.badge}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Compliance Info */}
            <div className="p-2 bg-stone-50 rounded-xl border border-stone-200/80 text-[11px] text-stone-500 flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
              <span>
                Hak akses dibatasi per peran & diaudit sesuai UU PDP No. 27/2022.
              </span>
            </div>

            {/* Logout Action */}
            <div className="pt-2 border-t border-stone-100">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 p-2 rounded-xl text-xs font-bold text-rose-700 hover:text-rose-800 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar dari Akun (Logout)</span>
              </button>
            </div>

          </div>
        </>
      )}
    </div>
  );
};
