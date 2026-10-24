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


export type SendAlertPayload = { message: string; location: string | null; lat: number | null; lng: number | null };

type GeoState = { status: "loading" } | { status: "ok"; lat: number; lng: number } | { status: "unavailable" };

function useGeolocation(enabled: boolean): GeoState {
  const [geo, setGeo] = useState<GeoState>({ status: "loading" });
  useEffect(() => {
    if (!enabled) return;
    if (!("geolocation" in navigator)) { setGeo({ status: "unavailable" }); return; }
    const watch = navigator.geolocation.watchPosition(
      pos => setGeo({ status: "ok", lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setGeo({ status: "unavailable" }),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
    );
    return () => navigator.geolocation.clearWatch(watch);
  }, [enabled]);
  return geo;
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const r = (d: number) => (d * Math.PI) / 180;
  const a = Math.sin(r(lat2 - lat1) / 2) ** 2 + Math.cos(r(lat1)) * Math.cos(r(lat2)) * Math.sin(r(lng2 - lng1) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(a));
}

function useSecondsSince(date: Date | undefined) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!date) return;
    const tick = () => setSeconds(Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [date?.getTime()]);
  return seconds;
}

export type EmergencyContacts = { hospital: string; doctor: string; motherName: string; fatherName: string; motherPhone: string; fatherPhone: string };

export function EmergencyScreen({ t, mode, alert, onSendAlert, onAck, onResolve, onBack, contacts }: {
  t: Theme; mode: Mode; onBack: () => void; contacts: EmergencyContacts;
  alert: EmergencyAlert | null;
  onSendAlert: (payload: SendAlertPayload) => Promise<boolean>;
  onAck: (etaMinutes: number) => void;
  onResolve: () => Promise<void>;
}) {
  const [sending, setSending]   = useState(false);
  const [resolving, setResolving] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [companionNotified, setCompanionNotified] = useState(true);
  const [msgIdx, setMsgIdx]     = useState(0);
  const [customMsg, setCustomMsg] = useState("");
  const secondsAgo = useSecondsSince(alert?.sentAt);
  const geo = useGeolocation(true);

  const messages = [
    "DARURAT: Saya butuh bantuan sekarang!",
    "Kontraksi sudah 5-1-1, tolong jemput!",
    "Ada tanda bahaya, tolong segera ke sini!",
    "Pesan Kustom"
  ];

  async function handleSend() {
    if (msgIdx === 3 && !customMsg.trim()) return; // Prevent empty custom messages
    setSending(true);
    setSendError(null);
    try {
      const coords = geo.status === "ok" ? { lat: geo.lat, lng: geo.lng } : { lat: null, lng: null };
      const notified = await onSendAlert({
        message: msgIdx === 3 ? customMsg.trim() : messages[msgIdx],
        location: coords.lat != null ? `GPS ${coords.lat.toFixed(5)}, ${coords.lng!.toFixed(5)}` : null,
        ...coords,
      });
      setCompanionNotified(notified);
    } catch {
      setSendError("Gagal mengirim. Periksa koneksi internet lalu coba lagi, atau langsung telepon 119.");
    } finally {
      setSending(false);
    }
  }

  async function handleResolve() {
    setResolving(true);
    try { await onResolve(); } catch { setSendError("Gagal menandai selesai. Coba lagi."); }
    finally { setResolving(false); }
  }

  // Tautan Google Maps sungguhan (bukan daftar RS contoh): RS rujukan dari profil & pencarian IGD di sekitar lokasi GPS
  const mapsSearch = (query: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  const nearbyIgdUrl = geo.status === "ok"
    ? `https://www.google.com/maps/search/rumah+sakit+IGD/@${geo.lat},${geo.lng},14z`
    : mapsSearch("rumah sakit IGD terdekat");
  const partner = mode === "mother"
    ? { label: "Telepon Suami", name: contacts.fatherName, phone: contacts.fatherPhone }
    : { label: "Telepon Bunda", name: contacts.motherName, phone: contacts.motherPhone };
  const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;

  return (
    <div className="space-y-4 w-full">
      {/* Spanduk darurat ringkas: identitas halaman jelas tanpa mendorong aksi utama ke bawah */}
      <div className="rounded-3xl px-6 py-5 flex items-center gap-4" style={{ background: "linear-gradient(135deg,#ef4444,#b91c1c)", boxShadow: "0 8px 24px rgba(220,38,38,0.25)" }}>
        <div className="relative w-12 h-12 flex-shrink-0">
          <span className="absolute inset-0 rounded-full bg-white/30 animate-ping motion-reduce:animate-none" />
          <span className="relative w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <AlertTriangle size={22} className="text-white" />
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-2xl font-extrabold text-white leading-tight">Mode Darurat</p>
          <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.8)" }}>
            {mode === "mother" ? "Beritahu suami posisi Bunda, atau langsung hubungi bantuan." : "Pantau kondisi Bunda dan hubungi bantuan bila perlu."}
          </p>
        </div>
        {/* Status siaga saat ini */}
        <div className="flex items-center gap-2 rounded-full px-4 py-2 flex-shrink-0" style={{ background: "rgba(255,255,255,0.18)" }}>
          <span className={`w-2 h-2 rounded-full ${alert ? "bg-white animate-pulse" : "bg-white/60"}`} />
          <span className="text-xs font-bold text-white">
            {!alert ? (mode === "mother" ? "Siaga · belum ada notifikasi terkirim" : "Siaga · tidak ada panggilan darurat")
              : alert.husbandAck ? `Suami sedang menuju${alert.husbandEta ? ` · ~${alert.husbandEta} mnt` : ""}`
              : mode === "mother" ? "Notifikasi terkirim · menunggu konfirmasi suami" : "Bunda memanggil · segera konfirmasi"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 items-start">
        {/* Kiri (2/3): aksi utama */}
        <div className="col-span-2">
          {mode === "mother" ? (
          <Card t={t} className="p-6" style={{ border: "1.5px solid #fecaca", borderTop: "4px solid #ef4444" }}>
            <div className="flex items-center gap-2 mb-4">
              <Send size={16} color="#ef4444" />
              <p className="text-sm font-extrabold" style={{ color: t.dark }}>Kirim Notifikasi Darurat ke Suami</p>
            </div>

            {!alert ? (
              <>
                <div className="rounded-2xl px-4 py-3 mb-4 flex items-center gap-3" style={{ background: t.soft }}>
                  <MapPin size={16} color={t.active} className="flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold" style={{ color: t.dark }}>Lokasi saat ini (GPS)</p>
                    <p className="text-[11px]" style={{ color: t.muted }}>
                      {geo.status === "ok" ? `${geo.lat.toFixed(5)}, ${geo.lng.toFixed(5)} · akan dikirim bersama pesan`
                        : geo.status === "loading" ? "Mencari lokasi…"
                        : "Lokasi tidak tersedia — izinkan akses lokasi di browser. Pesan tetap bisa dikirim."}
                    </p>
                  </div>
                </div>

                {/* Pilihan pesan: daftar satu kolom bergaya radio */}
                <p className="text-xs font-bold mb-2" style={{ color: t.dark }}>Pesan</p>
                <div className="space-y-2 mb-5" role="radiogroup" aria-label="Pilih pesan darurat">
                  {messages.map((m, i) => {
                    const on = msgIdx === i;
                    return (
                      <div key={i}>
                        <button role="radio" aria-checked={on} onClick={() => setMsgIdx(i)}
                          className="w-full flex items-center gap-3 text-left rounded-xl px-4 py-3 text-[13px]"
                          style={{ background: on ? "#fef2f2" : "#f8f8f8", border: `1.5px solid ${on ? "#ef4444" : "transparent"}`, color: on ? "#b91c1c" : t.dark, fontWeight: on ? 700 : 500 }}>
                          <span className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center" style={{ border: `2px solid ${on ? "#ef4444" : "#d1d5db"}` }}>
                            {on && <span className="w-2 h-2 rounded-full bg-red-500" />}
                          </span>
                          {i === 3 ? "Tulis pesan sendiri…" : m}
                        </button>
                        {i === 3 && on && (
                          <textarea
                            className="w-full rounded-xl px-4 py-3 text-sm outline-none border-2 resize-none mt-2"
                            style={{ borderColor: "#fca5a5", background: t.card, color: t.dark }}
                            placeholder="Tulis pesan darurat Bunda di sini…" rows={2} maxLength={500}
                            value={customMsg} onChange={e => setCustomMsg(e.target.value)} autoFocus />
                        )}
                      </div>
                    );
                  })}
                </div>

                <button onClick={handleSend} disabled={sending || (msgIdx === 3 && !customMsg.trim())}
                  className="ui-interactive w-full py-4 rounded-2xl font-extrabold text-white text-base flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ background: sending ? "#f87171" : "linear-gradient(135deg,#ef4444,#b91c1c)", boxShadow: "0 6px 18px rgba(239,68,68,0.3)" }}>
                  {sending
                    ? <><RefreshCw size={18} className="animate-spin" /> Mengirim…</>
                    : <><Send size={18} /> Kirim Notifikasi + Bagikan Lokasi</>
                  }
                </button>
                {sendError && <p className="text-xs text-red-600 mt-2 text-center">{sendError}</p>}
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
                    {!companionNotified && (
                      <p className="text-[11px] font-semibold text-amber-600">
                        Akun suami belum tersambung — bagikan kode sinkronisasi di Pengaturan agar suami menerima notifikasi.
                      </p>
                    )}
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

                <div className="grid grid-cols-2 gap-2">
                  <button onClick={handleSend} disabled={sending}
                    className="ui-interactive w-full py-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 disabled:opacity-50"
                    style={{ borderColor: "#fca5a5", color: "#ef4444", background: "#fff" }}>
                    <RefreshCw size={12} className={sending ? "animate-spin" : ""} /> Kirim Ulang
                  </button>
                  <button onClick={handleResolve} disabled={resolving}
                    className="ui-interactive w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 text-white disabled:opacity-50"
                    style={{ background: "#22c55e" }}>
                    <Check size={12} /> Kondisi Sudah Aman
                  </button>
                </div>
                {sendError && <p className="text-xs text-red-600 text-center">{sendError}</p>}
              </div>
            )}
          </Card>
          ) : (
            <CompanionEmergencyPanel t={t} alert={alert} onAck={onAck} geo={geo} />
          )}
        </div>

        {/* Kanan (1/3): panggilan cepat */}
        <Card t={t} className="p-5" style={{ border: "1.5px solid #fecaca" }}>
          <p className="text-xs font-bold uppercase tracking-wide mb-3 text-red-500">Panggilan Cepat</p>
          <div className="space-y-2">
            <a href="tel:119" className="ui-interactive flex items-center gap-3 rounded-2xl px-4 py-3" style={{ background: "#fef2f2", border: "1.5px solid #fca5a5" }}>
              <span className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0"><PhoneCall size={18} className="text-white" /></span>
              <span>
                <span className="block text-sm font-extrabold text-red-700">Ambulans</span>
                <span className="block text-[11px] font-semibold text-red-500">119 · gawat darurat</span>
              </span>
            </a>
            {partner.phone ? (
              <a href={telHref(partner.phone)} className="ui-interactive flex items-center gap-3 rounded-2xl px-4 py-3" style={{ background: t.soft }}>
                <span className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: t.active }}><Smartphone size={18} className="text-white" /></span>
                <span className="min-w-0">
                  <span className="block text-sm font-extrabold" style={{ color: t.dark }}>{partner.label}</span>
                  <span className="block text-[11px] truncate" style={{ color: t.muted }}>{partner.name ? `${partner.name} · ` : ""}{partner.phone}</span>
                </span>
              </a>
            ) : (
              <div className="flex items-center gap-3 rounded-2xl px-4 py-3" style={{ background: "#f8f8f8" }}>
                <span className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-200"><Smartphone size={18} className="text-gray-400" /></span>
                <span>
                  <span className="block text-sm font-bold text-gray-400">{partner.label}</span>
                  <span className="block text-[11px] text-gray-400">Nomor HP belum ada di profil</span>
                </span>
              </div>
            )}
          </div>
          <p className="text-[10px] mt-3 leading-relaxed" style={{ color: t.muted }}>Di komputer, tombol telepon membuka aplikasi panggilan bila tersedia.</p>
        </Card>
      </div>

      {/* Fasilitas kesehatan: data asli dari profil + pencarian di Google Maps */}
      <Card t={t} className="p-5" style={{ border: "1.5px solid #fecaca" }}>
        <p className="text-xs font-bold uppercase tracking-wide mb-3 text-red-500">Fasilitas Kesehatan</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3 rounded-2xl px-4 py-3" style={{ background: t.soft }}>
            <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0"><Heart size={18} color={t.active} /></span>
            <div className="flex-1 min-w-0">
              <p className="text-[11px]" style={{ color: t.muted }}>RS / klinik rujukan Bunda</p>
              <p className="text-sm font-extrabold truncate" style={{ color: contacts.hospital ? t.dark : t.muted }}>
                {contacts.hospital || "Belum diisi — tambahkan di Pengaturan"}
              </p>
              {contacts.doctor && <p className="text-[11px] truncate" style={{ color: t.muted }}>{contacts.doctor}</p>}
            </div>
            {contacts.hospital && (
              <a href={mapsSearch(contacts.hospital)} target="_blank" rel="noreferrer"
                className="ui-interactive flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-full text-white flex-shrink-0" style={{ background: t.active }}>
                <Navigation size={12} /> Navigasi
              </a>
            )}
          </div>
          <div className="flex items-center gap-3 rounded-2xl px-4 py-3" style={{ background: t.soft }}>
            <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0"><Search size={18} color={t.active} /></span>
            <div className="flex-1 min-w-0">
              <p className="text-[11px]" style={{ color: t.muted }}>Tidak sempat ke RS rujukan?</p>
              <p className="text-sm font-extrabold" style={{ color: t.dark }}>Cari IGD terdekat</p>
              <p className="text-[11px]" style={{ color: t.muted }}>{geo.status === "ok" ? "Dari lokasi Bunda saat ini" : "Lokasi belum tersedia — Maps akan memakai lokasi perangkat"}</p>
            </div>
            <a href={nearbyIgdUrl} target="_blank" rel="noreferrer"
              className="ui-interactive flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-full text-white flex-shrink-0" style={{ background: t.active }}>
              <MapPin size={12} /> Buka Maps
            </a>
          </div>
        </div>
      </Card>
    </div>
  );
}

export function CompanionEmergencyPanel({ t, alert, onAck, geo }: { t: Theme; alert: EmergencyAlert | null; onAck: (etaMinutes: number) => void; geo: GeoState }) {
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const secondsAgo = useSecondsSince(alert?.sentAt);

  const checklistItems = [
    { id: "car",   label: "Kendaraan siap & BBM penuh"       },
    { id: "route", label: "Rute ke RS sudah dicek"           },
    { id: "bag",   label: "Tas persalinan sudah diambil"     },
    { id: "doc",   label: "Nomor dokter tersimpan di telepon"},
    { id: "bpjs",  label: "Kartu BPJS & KTP sudah dibawa"   },
    { id: "go",    label: "Sudah berangkat menjemput Bunda"  },
  ];

  const donePct = Math.round((Object.values(checks).filter(Boolean).length / checklistItems.length) * 100);

  // Jarak garis lurus suami → Bunda dari dua titik GPS asli (null bila salah satu tidak tersedia)
  const distanceKm = alert?.lat != null && alert?.lng != null && geo.status === "ok"
    ? haversineKm(geo.lat, geo.lng, alert.lat, alert.lng) : null;

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

            {alert.husbandAck ? (
              <div className="rounded-xl p-3 flex items-center gap-2" style={{ background: "#f0fdf4", border: "1.5px solid #86efac" }}>
                <CheckCheck size={14} className="text-green-600" />
                <p className="text-xs font-bold text-green-700">
                  Sudah dikonfirmasi{alert.husbandEta != null ? ` · tiba ~${alert.husbandEta} mnt` : ""}
                </p>
              </div>
            ) : (
              <div>
                <p className="text-[11px] font-bold mb-1.5" style={{ color: t.dark }}>Konfirmasi ke Bunda — perkiraan tiba:</p>
                <div className="grid grid-cols-3 gap-2">
                  {[5, 10, 15].map(eta => (
                    <button key={eta} onClick={() => onAck(eta)}
                      className="ui-interactive py-2 rounded-xl text-xs font-bold text-white"
                      style={{ background: "linear-gradient(135deg,#ef4444,#b91c1c)" }}>
                      ~{eta} mnt
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-xl p-3 flex items-start gap-2" style={{ background: t.soft }}>
              <MapPin size={13} color={t.active} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold" style={{ color: t.dark }}>Lokasi Bunda</p>
                <p className="text-[11px]" style={{ color: t.muted }}>{alert.location}</p>
                {alert.lat != null && alert.lng != null && (
                  <a href={`https://www.google.com/maps/search/?api=1&query=${alert.lat},${alert.lng}`} target="_blank" rel="noreferrer"
                    className="text-[11px] font-bold underline" style={{ color: t.active }}>
                    Buka di Google Maps
                  </a>
                )}
              </div>
            </div>

            {alert.lat != null && alert.lng != null && (
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl p-2.5 text-center" style={{ background: t.soft }}>
                  <p className="text-[10px]" style={{ color: t.muted }}>Jarak (garis lurus)</p>
                  <p className="text-sm font-extrabold" style={{ color: t.dark }}>
                    {distanceKm != null ? `${distanceKm < 1 ? (distanceKm * 1000).toFixed(0) + " m" : distanceKm.toFixed(1) + " km"}` : "—"}
                  </p>
                  {distanceKm == null && <p className="text-[9px]" style={{ color: t.muted }}>Izinkan akses lokasi</p>}
                </div>
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${alert.lat},${alert.lng}`} target="_blank" rel="noreferrer"
                  className="ui-interactive rounded-xl p-2.5 flex flex-col items-center justify-center text-white" style={{ background: t.active }}>
                  <Navigation size={16} />
                  <span className="text-xs font-bold mt-1">Petunjuk arah</span>
                </a>
              </div>
            )}
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
                className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-left"
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

