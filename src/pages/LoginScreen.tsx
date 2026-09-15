import React, { useState } from "react";
import { Mail, Lock } from "lucide-react";
import { THEMES } from "../constants/theme";
import { Mode } from "../types";
import { Card } from "../components/Card";

export function LoginScreen({ onLogin }: { onLogin: (mode: Mode) => void }) {
  const [loginMode, setLoginMode] = useState<Mode>("mother");
  const [authView, setAuthView] = useState<"login" | "register" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const t = THEMES[loginMode];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 transition-colors duration-500 relative overflow-hidden" style={{ background: t.bg }}>
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full blur-3xl opacity-40 transition-colors duration-500" style={{ background: t.primary }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 rounded-full blur-3xl opacity-40 transition-colors duration-500" style={{ background: t.active }} />

      <div className={`w-full relative z-10 transition-all duration-500 ${authView === "register" ? "max-w-xl" : "max-w-sm"}`}>
        <Card t={t} className="p-8 pb-10">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center font-extrabold text-white text-3xl mb-4 shadow-lg transition-colors duration-500"
              style={{ background: t.grad }}>
              M
            </div>
            <p className="text-2xl font-extrabold" style={{ color: t.dark }}>
              {authView === "login" 
                ? (loginMode === "mother" ? "Halo, Bunda!" : "Halo, Ayah!")
                : authView === "register" 
                ? (loginMode === "mother" ? "Selamat datang, Bunda!" : "Selamat datang, Ayah!")
                : "Atur Ulang Sandi"
              }
            </p>
            <p className="text-sm mt-1 px-2 leading-relaxed" style={{ color: t.muted }}>
              {authView === "login" 
                ? (loginMode === "mother" ? "Senang melihat Anda kembali. Mari pantau si kecil hari ini." : "Siap mendampingi Bunda dan si kecil hari ini?")
                : authView === "register" 
                ? (loginMode === "mother" ? "Mari mulai perjalanan indah keibuan Anda bersama Mela." : "Mari bersiap jadi pendamping siaga yang hebat untuk Bunda.")
                : "Masukkan email untuk tautan pemulihan sandi akun Anda."
              }
            </p>
          </div>

          {/* Mode Toggle (only in login/register) */}
          {authView !== "forgot" && (
            <div className="flex rounded-full p-1.5 gap-1 mb-8" style={{ background: "#f2f2f2" }}>
              {(["mother", "companion"] as Mode[]).map(m => (
              <button key={m} onClick={() => setLoginMode(m)}
                className="flex-1 py-2.5 rounded-full text-sm font-bold transition-all flex items-center justify-center gap-2"
                style={{
                  background: loginMode === m ? THEMES[m].grad : "transparent",
                  color: loginMode === m ? "#fff" : "#999",
                  boxShadow: loginMode === m ? "0 4px 12px rgba(0,0,0,0.15)" : "none",
                }}
              >
                {m === "mother" ? "Ibu" : "Suami"}
              </button>
              ))}
            </div>
          )}

          {/* Form */}
          <div className={authView === "register" ? "grid grid-cols-2 gap-x-4 gap-y-4" : "space-y-4"}>
            {authView === "register" ? (
              <>
                <div className="col-span-1">
                  <p className="text-xs font-bold mb-1.5 ml-1" style={{ color: t.dark }}>Nama Lengkap</p>
                  <input
                    type="text"
                    className="w-full rounded-2xl px-4 py-3.5 text-sm outline-none border-2 transition-all focus:bg-white"
                    style={{ borderColor: "transparent", background: "#f2f2f2", color: t.dark }}
                    placeholder="Nama Anda"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onFocus={e => e.target.style.borderColor = t.active}
                    onBlur={e => e.target.style.borderColor = "transparent"}
                  />
                </div>
                <div className="col-span-1">
                  <p className="text-xs font-bold mb-1.5 ml-1" style={{ color: t.dark }}>Email atau Nomor HP</p>
                  <div className="relative">
                    <Mail size={16} color={t.muted} className="absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      className="w-full rounded-2xl pl-11 pr-4 py-3.5 text-sm outline-none border-2 transition-all focus:bg-white"
                      style={{ borderColor: "transparent", background: "#f2f2f2", color: t.dark }}
                      placeholder="bunda@email.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onFocus={e => e.target.style.borderColor = t.active}
                      onBlur={e => e.target.style.borderColor = "transparent"}
                    />
                  </div>
                </div>
                <div className="col-span-1">
                  <p className="text-xs font-bold mb-1.5 ml-1 leading-none" style={{ color: t.dark }}>Kata Sandi</p>
                  <div className="relative">
                    <Lock size={16} color={t.muted} className="absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      className="w-full rounded-2xl pl-11 pr-4 py-3.5 text-sm outline-none border-2 transition-all focus:bg-white"
                      style={{ borderColor: "transparent", background: "#f2f2f2", color: t.dark }}
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      onFocus={e => e.target.style.borderColor = t.active}
                      onBlur={e => e.target.style.borderColor = "transparent"}
                    />
                  </div>
                </div>
                <div className="col-span-1">
                  <p className="text-xs font-bold mb-1.5 ml-1" style={{ color: t.dark }}>Konfirmasi Kata Sandi</p>
                  <div className="relative">
                    <Lock size={16} color={t.muted} className="absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      className="w-full rounded-2xl pl-11 pr-4 py-3.5 text-sm outline-none border-2 transition-all focus:bg-white"
                      style={{ borderColor: "transparent", background: "#f2f2f2", color: t.dark }}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      onFocus={e => e.target.style.borderColor = t.active}
                      onBlur={e => e.target.style.borderColor = "transparent"}
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <p className="text-xs font-bold mb-1.5 ml-1" style={{ color: t.dark }}>Email atau Nomor HP</p>
                  <div className="relative">
                    <Mail size={16} color={t.muted} className="absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      className="w-full rounded-2xl pl-11 pr-4 py-3.5 text-sm outline-none border-2 transition-all focus:bg-white"
                      style={{ borderColor: "transparent", background: "#f2f2f2", color: t.dark }}
                      placeholder="bunda@email.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onFocus={e => e.target.style.borderColor = t.active}
                      onBlur={e => e.target.style.borderColor = "transparent"}
                    />
                  </div>
                </div>
                {authView !== "forgot" && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5 px-1">
                      <p className="text-xs font-bold leading-none" style={{ color: t.dark }}>Kata Sandi</p>
                      <button 
                        onClick={() => setAuthView("forgot")} 
                        className="text-[11px] font-bold leading-none p-0 bg-transparent outline-none hover:underline" 
                        style={{ color: t.active }}
                      >
                        Lupa sandi?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock size={16} color={t.muted} className="absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        className="w-full rounded-2xl pl-11 pr-4 py-3.5 text-sm outline-none border-2 transition-all focus:bg-white"
                        style={{ borderColor: "transparent", background: "#f2f2f2", color: t.dark }}
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        onFocus={e => e.target.style.borderColor = t.active}
                        onBlur={e => e.target.style.borderColor = "transparent"}
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            <button 
              onClick={() => {
                if (authView === "login" || authView === "register") {
                  onLogin(loginMode);
                } else {
                  setAuthView("login"); // Simulation of reset sent
                  alert("Tautan pemulihan sandi telah dikirim!");
                }
              }}
              className={`w-full py-4 rounded-2xl font-extrabold text-white text-base shadow-lg transition-all hover:scale-[1.02] active:scale-95 ${authView === "register" ? "col-span-2 mt-4" : "mt-2"}`}
              style={{ background: t.grad, boxShadow: `0 8px 24px ${t.shadow}` }}>
              {authView === "login" ? "Masuk" : authView === "register" ? "Daftar Sekarang" : "Kirim Tautan"}
            </button>
          </div>
          
          <div className="mt-6 text-center">
            {authView === "login" ? (
              <p className="text-xs" style={{ color: t.muted }}>
                Belum punya akun? <button onClick={() => setAuthView("register")} className="text-xs font-bold ml-1" style={{ color: t.active }}>Daftar sekarang</button>
              </p>
            ) : authView === "register" ? (
              <p className="text-xs" style={{ color: t.muted }}>
                Sudah punya akun? <button onClick={() => setAuthView("login")} className="text-xs font-bold ml-1" style={{ color: t.active }}>Masuk di sini</button>
              </p>
            ) : (
              <button onClick={() => setAuthView("login")} className="text-xs font-bold" style={{ color: t.active }}>Kembali ke Halaman Masuk</button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
