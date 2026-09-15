import React, { useState, useEffect } from "react";
import { Theme, VitalLog, EmergencyAlert, Risk, Mode } from "../types";
import { Card } from "../components/Card";
import { PillBtn } from "../components/PillBtn";
import { SectionTitle } from "../components/SectionTitle";
import { StatTile } from "../components/StatTile";
import { fmtDate, addDays } from "../utils/helpers";
import {
  Home, Activity, Calendar, FileText, Package, Bell,
  Plus, Minus, Check, X, AlertTriangle, Download, Baby,
  PhoneCall, ArrowRight, RefreshCw, ChevronLeft, Search, Heart,
  MapPin, Navigation, Send, CheckCheck, Clock, Zap, Printer, Mail, Lock, LogOut, Settings, History, Users, Scissors, Droplets, Brain, HeartPulse, Eye, Bone, Wind, Activity as ActivityIcon,
  User, Smartphone, Copy, Headphones, MessageCircle, HelpCircle
} from "lucide-react";


export function EmergencyScreen({ t, mode, alert, onSendAlert, onBack }: {
  t: Theme; mode: Mode; onBack: () => void;
  alert: EmergencyAlert | null;
  onSendAlert: (a: EmergencyAlert) => void;
}) {
  const [sending, setSending]   = useState(false);
  const [msgIdx, setMsgIdx]     = useState(0);
  const [customMsg, setCustomMsg] = useState("");
  const [secondsAgo, setSecondsAgo] = useState(0);

  const messages = [
    "DARURAT: Saya butuh bantuan sekarang!",
    "Kontraksi sudah 5-1-1, tolong jemput!",
    "Ada tanda bahaya, tolong segera ke sini!",
    "Pesan Kustom"
  ];

  useEffect(() => {
    if (!alert) return;
    const id = setInterval(() => setSecondsAgo(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [alert]);

  function handleSend() {
    if (msgIdx === 3 && !customMsg.trim()) return; // Prevent empty custom messages
    setSending(true);
    setTimeout(() => {
      onSendAlert({
        sentAt: new Date(),
        trigger: "manual",
        location: "Jl. Kemang Raya No. 45, Jakarta Selatan",
        lat: -6.2607,
        lng: 106.8163,
        contractions: "5 mnt · 60 dtk · 3 kali",
        message: msgIdx === 3 ? customMsg.trim() : messages[msgIdx],
        husbandAck: false,
        husbandEta: null,
      });
      setSending(false);
    }, 1800);
  }

  return (
    <div className="space-y-5 w-full">
      {/* Header */}
      <div className="rounded-3xl p-6 text-center" style={{ background: "linear-gradient(135deg,#ef4444,#b91c1c)" }}>
        <div className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center bg-white/20">
          <PhoneCall size={26} className="text-white" />
        </div>
        <p className="text-2xl font-extrabold text-white">Mode Darurat</p>
        <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.7)" }}>Hubungi bantuan & beritahu suami posisi Anda</p>
      </div>

      <div className="space-y-4">
        {/* Call & Hospital */}
        <div className="grid grid-cols-4 gap-4">
          <a href="tel:119" className="col-span-1 flex flex-col items-center justify-center gap-3 rounded-3xl p-4 text-center transition-all hover:scale-[1.02]" style={{ background: "#fef2f2", border: "1.5px solid #fca5a5" }}>
            <div className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 shadow-sm">
              <PhoneCall size={24} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-red-700 leading-tight">Panggil<br/>Ambulans</p>
              <p className="text-[10px] font-semibold text-red-500 mt-1">119 — IGD</p>
            </div>
          </a>
          <Card t={t} className="col-span-3 p-5 flex flex-col">
            <p className="text-xs font-bold mb-3 uppercase tracking-wide flex-shrink-0" style={{ color: "#ef4444" }}>RS Terdekat</p>
            <div className="flex-1 grid grid-cols-3 gap-3">
              {[
                { name: "RSIA Bunda",      dist: "2.3 km", time: "~8 mnt"  },
                { name: "RS Ibu Permata",  dist: "4.1 km", time: "~12 mnt" },
                { name: "RSUP Nasional",   dist: "5.8 km", time: "~18 mnt" },
              ].map(rs => (
                <div key={rs.name} className="flex flex-col rounded-xl p-3" style={{ background: t.soft }}>
                  <p className="text-[13px] font-bold leading-tight" style={{ color: t.dark }}>{rs.name}</p>
                  <p className="text-[11px] mb-3 mt-0.5" style={{ color: t.muted }}>{rs.dist} · {rs.time}</p>
                  <button className="mt-auto text-[11px] font-bold py-1.5 rounded-lg text-white transition-all w-full" style={{ background: "#ef4444" }}>Navigasi</button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right panels */}
        {mode === "mother" && (
          <Card t={t} className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Send size={16} color="#ef4444" />
              <p className="text-sm font-extrabold" style={{ color: t.dark }}>Kirim Notifikasi Darurat ke Suami</p>
            </div>

            {!alert ? (
              <>
                {/* Location preview */}
                <div className="rounded-2xl p-3 mb-4 flex items-center gap-3" style={{ background: t.soft }}>
                  <MapPin size={16} color={t.active} className="flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold" style={{ color: t.dark }}>Lokasi saat ini (GPS)</p>
                    <p className="text-[11px]" style={{ color: t.muted }}>Jl. Kemang Raya No. 45, Jakarta Selatan</p>
                    <p className="text-[10px]" style={{ color: t.muted }}>-6.2607, 106.8163 · Diperbarui barusan</p>
                  </div>
                </div>

                {/* Message selector */}
                <p className="text-sm font-extrabold mb-3 mt-1" style={{ color: t.dark }}>Pilih atau Ketik Pesan:</p>
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {messages.map((m, i) => (
                    <React.Fragment key={i}>
                      <button onClick={() => setMsgIdx(i)}
                        className={`w-full text-left rounded-xl px-4 py-3 text-[13px] transition-all ${i === 3 ? "col-span-2" : ""}`}
                        style={{
                          background: msgIdx === i ? t.soft : "#f8f8f8",
                          border: `1.5px solid ${msgIdx === i ? t.active : "transparent"}`,
                          color: msgIdx === i ? t.active : t.muted,
                          fontWeight: msgIdx === i ? 700 : 500,
                        }}>
                        {m}
                      </button>
                      {msgIdx === 3 && i === 3 && (
                        <div className="col-span-2">
                          <textarea
                            className="w-full rounded-xl px-4 py-3 text-sm outline-none border-2 transition-all resize-none mt-1"
                            style={{ borderColor: t.active, background: t.card, color: t.dark }}
                            placeholder="Tulis pesan darurat Anda di sini..."
                            rows={2}
                            value={customMsg}
                            onChange={e => setCustomMsg(e.target.value)}
                            autoFocus
                          />
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                <button onClick={handleSend} disabled={sending || (msgIdx === 3 && !customMsg.trim())}
                  className="w-full py-3.5 rounded-2xl font-extrabold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  style={{ background: sending ? "#f87171" : "linear-gradient(135deg,#ef4444,#b91c1c)" }}>
                  {sending
                    ? <><RefreshCw size={16} className="animate-spin" /> Mengirim…</>
                    : <><Send size={16} /> Kirim Notifikasi + Bagikan Lokasi</>
                  }
                </button>
              </>
            ) : (
              /* Sent state */
              <div className="space-y-3">
                <div className="rounded-2xl p-4 text-center" style={{ background: "#f0fdf4", border: "1.5px solid #86efac" }}>
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-2">
                    <CheckCheck size={20} className="text-white" />
                  </div>
                  <p className="text-sm font-extrabold text-green-700">Notifikasi Terkirim!</p>
                  <p className="text-xs text-green-600 mt-0.5">
                    {secondsAgo < 60 ? `${secondsAgo} detik yang lalu` : `${Math.floor(secondsAgo / 60)} menit yang lalu`}
                  </p>
                </div>

                {/* What was sent */}
                <div className="rounded-2xl p-4" style={{ background: t.soft }}>
                  <p className="text-xs font-bold mb-2" style={{ color: t.dark }}>Yang dikirim ke suami:</p>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Zap size={12} color="#ef4444" />
                      <p className="text-xs" style={{ color: t.dark }}>"{alert.message}"</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={12} color={t.active} />
                      <p className="text-xs" style={{ color: t.muted }}>{alert.location}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={12} color={t.muted} />
                      <p className="text-xs" style={{ color: t.muted }}>
                        {alert.sentAt.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Husband status */}
                <div className="rounded-2xl p-4" style={{ background: alert.husbandAck ? "#f0fdf4" : "#f0f9ff", border: `1.5px solid ${alert.husbandAck ? "#86efac" : "#7dd3fc"}` }}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-2 h-2 rounded-full ${alert.husbandAck ? "bg-green-500" : "bg-blue-400"}`} />
                    <p className="text-xs font-bold" style={{ color: alert.husbandAck ? "#166534" : "#0369a1" }}>
                      {alert.husbandAck ? "Suami sudah konfirmasi" : "Notifikasi berhasil dikirim ke suami"}
                    </p>
                  </div>
                  {alert.husbandEta && (
                    <p className="text-xs" style={{ color: "#166534" }}>ETA suami: ~{alert.husbandEta} menit</p>
                  )}
                </div>

                <button onClick={handleSend}
                  className="w-full py-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5"
                  style={{ borderColor: "#fca5a5", color: "#ef4444", background: "#fff" }}>
                  <RefreshCw size={12} /> Kirim Ulang
                </button>
              </div>
            )}
          </Card>
        )}

        {/* Companion emergency panel */}
        {mode === "companion" && <CompanionEmergencyPanel t={t} alert={alert} />}
      </div>
    </div>
  );
}

export function CompanionEmergencyPanel({ t, alert }: { t: Theme; alert: EmergencyAlert | null }) {
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [called, setCalled] = useState<Record<string, boolean>>({});
  const [secondsAgo, setSecondsAgo] = useState(0);

  useEffect(() => {
    if (!alert) return;
    const id = setInterval(() => setSecondsAgo(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [alert]);

  const checklistItems = [
    { id: "car",   label: "Kendaraan siap & BBM penuh"       },
    { id: "route", label: "Rute ke RS sudah dicek"           },
    { id: "bag",   label: "Tas persalinan sudah diambil"     },
    { id: "doc",   label: "Nomor dokter tersimpan di telepon"},
    { id: "bpjs",  label: "Kartu BPJS & KTP sudah dibawa"   },
    { id: "go",    label: "Sudah berangkat menjemput Bunda"  },
  ];

  const donePct = Math.round((Object.values(checks).filter(Boolean).length / checklistItems.length) * 100);

  const contacts = [
    { name: "Bunda Sari",     role: "Istri",           phone: "+62-812-xxxx-xxxx", color: "#ef4444" },
    { name: "dr. Ratna Sp.OG", role: "Dokter Kandungan", phone: "+62-811-xxxx-xxxx", color: t.active  },
    { name: "RSIA Bunda",     role: "RS Rujukan",       phone: "+62-21-xxxx-xxxx",  color: "#f59e0b" },
  ];

  return (
    <div className="col-span-2 grid grid-cols-2 gap-4">
      {/* Alert status */}
      <Card t={t} className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Zap size={15} color="#ef4444" />
          <p className="text-sm font-extrabold" style={{ color: t.dark }}>Status Darurat Bunda</p>
        </div>

        {alert ? (
          <div className="space-y-3">
            <div className="rounded-2xl p-4" style={{ background: "#fef2f2", border: "1.5px solid #fca5a5" }}>
              <p className="text-xs font-bold text-red-700 mb-1">Pesan dari Bunda:</p>
              <p className="text-sm font-semibold text-red-800">"{alert.message}"</p>
              <p className="text-[10px] text-red-400 mt-1.5">
                {secondsAgo < 60 ? `${secondsAgo}s yang lalu` : `${Math.floor(secondsAgo / 60)} mnt yang lalu`}
              </p>
            </div>

            <div className="rounded-xl p-3 flex items-start gap-2" style={{ background: t.soft }}>
              <MapPin size={13} color={t.active} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold" style={{ color: t.dark }}>Lokasi Bunda</p>
                <p className="text-[11px]" style={{ color: t.muted }}>{alert.location}</p>
                <p className="text-[10px]" style={{ color: t.muted }}>{alert.lat}, {alert.lng}</p>
              </div>
            </div>

            {/* Mini map */}
            <div className="rounded-xl overflow-hidden" style={{ height: 110, background: "#e8f4e8" }}>
              <svg width="100%" height="100%" viewBox="0 0 260 110">
                {[25,50,75,100,125,150,175,200,225].map(x=><line key={x} x1={x} y1={0} x2={x} y2={110} stroke="#c8e6c8" strokeWidth={1}/>)}
                {[25,50,75,100].map(y=><line key={y} x1={0} y1={y} x2={260} y2={y} stroke="#c8e6c8" strokeWidth={1}/>)}
                <path d="M 0 58 Q 130 48 260 58" stroke="#d4d4d4" strokeWidth={5} fill="none"/>
                <path d="M 110 0 L 110 110" stroke="#d4d4d4" strokeWidth={5}/>
                <circle cx={130} cy={55} r={14} fill="rgba(239,68,68,0.15)"/>
                <circle cx={130} cy={55} r={8} fill="rgba(239,68,68,0.3)"/>
                <circle cx={130} cy={55} r={5} fill="#ef4444"/>
                <circle cx={55} cy={78} r={5} fill={t.active}/>
                <path d="M 55 78 Q 90 66 130 55" stroke={t.active} strokeWidth={2} strokeDasharray="4 3" fill="none"/>
                <text x={138} y={50} fontSize={8} fill="#ef4444" fontWeight="bold">Bunda</text>
                <text x={35} y={90} fontSize={8} fill={t.active} fontWeight="bold">Ayah</text>
              </svg>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl p-2.5 text-center" style={{ background: t.soft }}>
                <p className="text-[10px]" style={{ color: t.muted }}>Jarak</p>
                <p className="text-sm font-extrabold" style={{ color: t.dark }}>2.3 km</p>
              </div>
              <div className="rounded-xl p-2.5 text-center" style={{ background: t.soft }}>
                <p className="text-[10px]" style={{ color: t.muted }}>ETA</p>
                <p className="text-sm font-extrabold" style={{ color: t.dark }}>~8 mnt</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl p-6 text-center" style={{ background: "#f0fdf4", border: "1.5px solid #86efac" }}>
            <Check size={28} className="text-green-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-green-700">Kondisi Bunda Normal</p>
            <p className="text-xs text-green-600 mt-1">Tidak ada notifikasi darurat aktif</p>
          </div>
        )}
      </Card>

      {/* Checklist & Contacts */}
      <div className="space-y-4">
        {/* Quick contacts */}
        <Card t={t} className="p-4">
          <p className="text-xs font-extrabold mb-3 uppercase tracking-wide" style={{ color: t.dark }}>Kontak Cepat</p>
          <div className="space-y-2">
            {contacts.map(c => (
              <div key={c.name} className="flex items-center gap-3 rounded-xl px-3 py-2.5" style={{ background: t.soft }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                  style={{ background: c.color }}>
                  {c.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate" style={{ color: t.dark }}>{c.name}</p>
                  <p className="text-[10px]" style={{ color: t.muted }}>{c.role}</p>
                </div>
                <button onClick={() => setCalled(p => ({ ...p, [c.name]: true }))}
                  className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full text-white flex-shrink-0"
                  style={{ background: called[c.name] ? "#22c55e" : c.color }}>
                  {called[c.name] ? <><Check size={10}/> Terhubung</> : <><PhoneCall size={10}/> Hubungi</>}
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* Action checklist */}
        <Card t={t} className="p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-extrabold uppercase tracking-wide" style={{ color: t.dark }}>Checklist Suami</p>
            <span className="text-xs font-bold" style={{ color: donePct === 100 ? "#22c55e" : t.active }}>{donePct}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden mb-3" style={{ background: t.soft }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${donePct}%`, background: donePct === 100 ? "#22c55e" : t.active }} />
          </div>
          <div className="space-y-1.5">
            {checklistItems.map(item => (
              <button key={item.id} onClick={() => setChecks(p => ({ ...p, [item.id]: !p[item.id] }))}
                className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-left transition-all"
                style={{ background: checks[item.id] ? "#f0fdf4" : t.soft }}>
                <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                  style={{ background: checks[item.id] ? "#22c55e" : t.border }}>
                  {checks[item.id] && <Check size={10} className="text-white" />}
                </div>
                <span className="text-xs" style={{ color: checks[item.id] ? "#22c55e" : t.dark, textDecoration: checks[item.id] ? "line-through" : "none" }}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

