// Cetak satu elemen saja (bukan seluruh halaman) lewat iframe tersembunyi.
// Dialog cetak browser juga menyediakan "Simpan sebagai PDF"; judul dokumen dipakai sebagai nama file usulan.
export function printElement(el: HTMLElement, title: string, orientation: "portrait" | "landscape" = "landscape"): Promise<void> {
  return new Promise(resolve => {
    const iframe = document.createElement("iframe");
    iframe.setAttribute("aria-hidden", "true");
    iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden";
    document.body.appendChild(iframe);

    // Salin semua stylesheet halaman (Tailwind, font) agar tampilan cetak sama dengan pratinjau
    const styles = [...document.querySelectorAll('style, link[rel="stylesheet"]')].map(node => node.outerHTML).join("\n");
    const doc = iframe.contentDocument!;
    doc.open();
    doc.write(`<!doctype html><html lang="id"><head><meta charset="utf-8"><title>${title}</title>${styles}
<style>
  @page { size: A4 ${orientation}; margin: 12mm; }
  html, body { background: #fff !important; margin: 0; }
  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; font-family: 'Manrope', sans-serif; }
  .no-print { display: none !important; }
  table, tr, img, svg { break-inside: avoid; }
</style></head><body>${el.outerHTML}</body></html>`);
    doc.close();

    const cleanup = () => { if (document.body.contains(iframe)) iframe.remove(); };
    const win = iframe.contentWindow!;
    const run = async () => {
      try { await doc.fonts?.ready; } catch { /* font tidak wajib */ }
      win.addEventListener("afterprint", cleanup, { once: true });
      win.focus();
      win.print();
      // print() menunggu dialog ditutup di sebagian besar browser; tombol boleh kembali normal setelahnya.
      // Iframe dibersihkan saat afterprint, atau paling lambat 60 detik bila browser tidak memicunya.
      resolve();
      setTimeout(cleanup, 60_000);
    };
    if (doc.readyState === "complete") void run();
    else iframe.addEventListener("load", () => void run(), { once: true });
  });
}
