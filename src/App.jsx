import React, { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import confetti from "canvas-confetti";

import {
  connectWallet,
  getReadContract,
  getWriteContract,
  weiToEth,
  toShippingHash,
} from "./lib/wallet";
import { imageFromName } from "./lib/images";
import Toast from "./ui/Toast";
import Navbar from "./ui/Navbar";

const MySwal = withReactContent(Swal);

export default function App() {
  const [account, setAccount] = useState("");
  const [items, setItems] = useState([]);
  const [wonId, setWonId] = useState(null);
  const [wonItem, setWonItem] = useState(null);
  const [addressText, setAddressText] = useState("");

  const [loadingItems, setLoadingItems] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [paying, setPaying] = useState(false);
  const [toast, setToast] = useState({ show: false, type: "success", message: "" });

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", () => location.reload());
      window.ethereum.on("chainChanged", () => location.reload());
    }
  }, []);

  async function onConnect() {
    const acc = await connectWallet();
    setAccount(acc);
    await refreshItems();
  }

  async function refreshItems() {
    setLoadingItems(true);
    try {
      const c = await getReadContract();
      const list = await c.listItems();
      const normalized = list.map((x) => ({
        id: Number(x.id),
        name: x.name,
        normalPriceWei: x.normalPriceWei.toString(),
        luckyPriceWei: x.luckyPriceWei.toString(),
        stock: Number(x.stock),
        active: x.active,
        image: imageFromName(x.name),
      }));
      setItems(normalized);
      if (wonId) setWonItem(normalized.find((i) => i.id === wonId) || null);
    } catch (e) {
      console.error("refreshItems error:", e);
      setToast({ show: true, type: "error", message: "โหลดรายการสินค้าไม่สำเร็จ" });
    } finally {
      setLoadingItems(false);
    }
  }

  const reelPool = useMemo(() => items.filter((i) => i.active && i.stock > 0), [items]);

  function showError(e, fallback = "เกิดข้อผิดพลาด") {
    const msg = e?.shortMessage || e?.reason || e?.message || fallback;
    console.error("ERROR:", e);
    return MySwal.fire({
      icon: "error",
      title: "ไม่สำเร็จ",
      text: msg,
      confirmButtonText: "ปิด",
    });
  }

  function burstConfetti() {
    confetti({ particleCount: 120, spread: 60, origin: { y: 0.4 } });
    setTimeout(() => confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } }), 220);
  }

  //Actions

  async function onSpin() {
    if (!account) {
      return MySwal.fire({
        icon: "info",
        title: "ยังไม่เชื่อมต่อกระเป๋า",
        text: "กรุณาเชื่อมต่อกระเป๋าก่อนทำการสุ่ม",
        confirmButtonText: "ตกลง",
      });
    }
    if (reelPool.length === 0) {
      return MySwal.fire({
        icon: "warning",
        title: "ยังไม่มีสินค้าให้สุ่ม",
        confirmButtonText: "ปิด",
      });
    }

    setSpinning(true);
    setWonItem(null);

    // Modal กำลังสุ่ม
    MySwal.fire({
      title: "กำลังสุ่ม...",
      html: `
        <div style="width:64px;height:64px;margin:14px auto;border-radius:50%;
                    border:6px solid #e5e5ea;border-top-color:#1d1d1f;animation:spin .9s linear infinite"></div>
        <style>
          .swal2-loader{ display:none !important; }
          @keyframes spin { to { transform: rotate(360deg) } }
        </style>
      `,
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => MySwal.showLoading(),
    });

    try {
      const wc = await getWriteContract();
      const tx = await wc.spin();

      // พรีวิวภาพสลับเร็ว ๆ ระหว่างรอ tx mined
      const interval = setInterval(() => {
        const i = Math.floor(Math.random() * reelPool.length);
        setWonItem(reelPool[i]);
      }, 100);

      await tx.wait();
      clearInterval(interval);

      // อ่าน id ล่าสุดจากเชน (กัน state เก่า)
      const rc = await getReadContract();
      const won = await rc.lastWonItemId(account);
      const id = Number(won);
      setWonId(id);

      // โหลดรายการล่าสุดเพื่อให้ stock/active ตรง
      const list = await rc.listItems();
      const normalized = list.map((x) => ({
        id: Number(x.id),
        name: x.name,
        normalPriceWei: x.normalPriceWei.toString(),
        luckyPriceWei: x.luckyPriceWei.toString(),
        stock: Number(x.stock),
        active: x.active,
        image: imageFromName(x.name),
      }));
      setItems(normalized);

      const finalItem = normalized.find((i) => i.id === id) || null;
      setWonItem(finalItem);

      await MySwal.fire({
        title: "สุ่มสำเร็จ",
        html: `
          <div style="display:flex;flex-direction:column;align-items:center;gap:14px">
            <div style="
              width:100%;max-width:460px;aspect-ratio:4/3;
              border-radius:20px;overflow:hidden;
              background:#f6f6f6;border:1px solid #eee;
              display:flex;align-items:center;justify-content:center;padding:16px;
            ">
              <img src="${finalItem?.image || ""}" alt="${finalItem?.name || ""}"
                   style="width:100%;height:100%;object-fit:contain;background:#fff"/>
            </div>
            <div style="font-size:18px;color:#1d1d1f;font-weight:700">
              ${finalItem?.name || "-"}
            </div>
            <div style="font-size:14px;color:#3a3a3c">
              ราคาพิเศษ ${weiToEth(finalItem?.luckyPriceWei || "0")} ETH
            </div>
          </div>
        `,
        confirmButtonText: "ปิด",
        width: 600,
        customClass: { popup: "rounded-3xl" },
      });

      burstConfetti();
    } catch (e) {
      await showError(e, "สุ่มไม่สำเร็จ");
    } finally {
      setSpinning(false);
      MySwal.close();
    }
  }

  async function onPay() {
    // ดึงสถานะล่าสุดจากเชนทุกครั้งก่อนจ่าย เพื่อลดโอกาส Mismatch/Unavailable/Wrong amount
    try {
      const rc = await getReadContract();

      const wonOnChain = Number(await rc.lastWonItemId(account));
      console.log("account:", account, "lastWonItemId:", wonOnChain);

      if (!wonOnChain) {
        return MySwal.fire({
          icon: "info",
          title: "ยังไม่ได้สุ่มหรือข้อมูลหมดอายุ",
          confirmButtonText: "ตกลง",
        });
      }

      const onChainItem = await rc.items(wonOnChain);
      console.log("on-chain item:", {
        id: onChainItem.id.toString(),
        name: onChainItem.name,
        active: onChainItem.active,
        stock: onChainItem.stock.toString(),
        lucky: onChainItem.luckyPriceWei.toString(),
      });

      if (!onChainItem.active || Number(onChainItem.stock) === 0) {
        return MySwal.fire({ icon: "warning", title: "สินค้าไม่พร้อมขายแล้ว" });
      }

      if (!addressText) {
        return MySwal.fire({ icon: "warning", title: "กรุณากรอกที่อยู่จัดส่ง" });
      }

      const luckyWei = onChainItem.luckyPriceWei.toString();

      const confirm = await MySwal.fire({
        icon: "question",
        title: "ยืนยันชำระเงิน?",
        html: `<div class="text-sm">
          สินค้า: <strong>${onChainItem.name}</strong><br/>
          ราคาพิเศษ: <strong>${weiToEth(luckyWei)} ETH</strong><br/>
          จะตัดยอดจากกระเป๋าของคุณและบันทึกที่อยู่จัดส่ง
        </div>`,
        showCancelButton: true,
        confirmButtonText: "ยืนยัน",
        cancelButtonText: "ยกเลิก",
        reverseButtons: true,
      });
      if (!confirm.isConfirmed) return;

      setPaying(true);
      MySwal.fire({
        title: "กำลังชำระเงิน...",
        allowOutsideClick: false,
        didOpen: () => MySwal.showLoading(),
        showConfirmButton: false,
      });

      const shippingHash = toShippingHash(addressText);
      const wc = await getWriteContract();
      const tx = await wc.payAndClaim(wonOnChain, shippingHash, { value: luckyWei });
      await tx.wait();

      setToast({
        show: true,
        type: "success",
        message: "ชำระสำเร็จ! สินค้าจะถูกจัดส่งตามที่อยู่ของคุณ",
      });
      burstConfetti();

      // รีเซ็ตสถานะหน้า
      setWonId(null);
      setWonItem(null);
      setAddressText("");
      await refreshItems();

      await MySwal.fire({ icon: "success", title: "ชำระเงินสำเร็จ", confirmButtonText: "ปิด" });
    } catch (e) {
      await showError(e, "การชำระเงินล้มเหลว");
    } finally {
      setPaying(false);
      MySwal.close();
    }
  }

  //Render 

  return (
    <div className="relative min-h-screen text-[#1d1d1f] overflow-hidden">
      {/* พื้นหลัง Apple Style */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#f5f5f7] via-[#fafafa] to-[#f2f2f2]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0
                   [background:radial-gradient(1200px_600px_at_50%_-10%,rgba(255,255,255,.9),rgba(255,255,255,0))]"
        aria-hidden="true"
      />

      {/* Navbar */}
      <Navbar account={account} onConnect={onConnect} />

      {/* เนื้อหา */}
      <main id="home" className="relative z-10 max-w-6xl mx-auto p-6 space-y-10">
        {/* About / Hero */}
        <section id="about" className="bg-white/90 backdrop-blur-md rounded-3xl shadow p-8">
          <h1 className="text-2xl font-extrabold tracking-tight">Lucky Random Sale</h1>
          <p className="text-sm text-[#3a3a3c] mt-2 leading-relaxed">
            ระบบร้านค้าที่ถูกออกแบบเพื่อมอบประสบการณ์ใหม่ให้กับลูกค้า
            ทุกการสุ่มคือโอกาสในการได้สินค้าราคาพิเศษในช่วงโปรโมชั่น
            โปร่งใส ยุติธรรม และปลอดภัยด้วยเทคโนโลยีบล็อกเชน
            เพื่อให้การช้อปปิ้งเป็นมากกว่าการซื้อ แต่คือความสนุกที่ตรวจสอบได้
          </p>
        </section>

        {/* Toast */}
        <Toast
          show={toast.show}
          type={toast.type}
          message={toast.message}
          onClose={() => setToast((s) => ({ ...s, show: false }))}
        />

        {/* รายการสินค้า */}
        <section id="items" className="bg-white/90 backdrop-blur-md rounded-3xl shadow p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[22px] font-semibold tracking-tight">สินค้าที่พร้อมสุ่ม</h2>
            <button
              onClick={onSpin}
              disabled={!account || spinning || reelPool.length === 0}
              className="px-5 py-2 rounded-2xl bg-[#1d1d1f] text-white hover:bg-black transition disabled:opacity-50"
            >
              {spinning ? "กำลังสุ่ม..." : "สุ่มสินค้า"}
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingItems &&
              [...Array(3)].map((_, i) => (
                <div key={i} className="rounded-3xl h-48 bg-[#f2f2f2] animate-pulse" />
              ))}

            {!loadingItems &&
              items
                .filter((i) => i.active && i.stock > 0)
                .map((it) => (
                  <div
                    key={it.id}
                    className="rounded-3xl overflow-hidden bg-white
                               shadow-[0_2px_8px_rgba(0,0,0,0.06)]
                               hover:shadow-[0_6px_18px_rgba(0,0,0,0.12)]
                               transition-all duration-300"
                  >
                    <div className="aspect-[4/3] bg-[#f9f9f9] flex items-center justify-center p-5">
                      <img
                        src={it.image}
                        alt={it.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div className="p-5 space-y-1">
                      <div className="text-[17px] font-semibold">{it.name}</div>
                      <div className="text-[13px] text-[#6e6e73]">
                        ปกติ: {weiToEth(it.normalPriceWei)} ETH
                      </div>
                      <div className="text-[14px] font-semibold">
                        พิเศษ: {weiToEth(it.luckyPriceWei)} ETH
                      </div>
                      <div className="text-[12px] text-[#8e8e93]">คงเหลือ {it.stock}</div>
                    </div>
                  </div>
                ))}
          </div>

          {!loadingItems && items.length === 0 && (
            <p className="text-center text-[#6e6e73] py-10">ยังไม่มีสินค้า</p>
          )}
        </section>

        {/* ผลการสุ่ม + ชำระเงิน */}
        {(spinning || wonItem) && (
          <section className="bg-white/90 backdrop-blur-md rounded-3xl shadow p-8 space-y-4">
            <h3 className="text-lg font-semibold tracking-tight">ผลการสุ่ม</h3>
            {spinning && (
              <div className="aspect-[4/3] rounded-2xl bg-[#f2f2f2] flex items-center justify-center text-[#6e6e73]">
                กำลังสุ่ม...
              </div>
            )}
            {!spinning && wonItem && (
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <div className="rounded-2xl aspect-[4/3] bg-[#f9f9f9] p-4 border flex items-center justify-center">
                    <img
                      src={wonItem.image}
                      alt={wonItem.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                </div>
                <div className="space-y-3 md:col-span-2">
                  <div className="text-xl font-semibold">{wonItem.name}</div>
                  <div className="text-[#3a3a3c] font-medium">
                    ราคาพิเศษ: {weiToEth(wonItem.luckyPriceWei)} ETH
                  </div>
                  <textarea
                    className="w-full border rounded-2xl p-3 min-h-[100px] bg-white"
                    value={addressText}
                    onChange={(e) => setAddressText(e.target.value)}
                    placeholder="ชื่อ-ที่อยู่จัดส่ง-เบอร์โทร"
                  />
                  <button
                    onClick={onPay}
                    disabled={paying}
                    className="px-5 py-2 rounded-2xl bg-[#1d1d1f] text-white hover:bg-black transition disabled:opacity-50"
                  >
                    {paying ? "กำลังชำระ..." : "ชำระเงินและรับสินค้า"}
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ความโปร่งใส */}
        <section id="fairness" className="bg-white/90 backdrop-blur-md rounded-3xl shadow p-8">
          <h3 className="text-lg font-semibold tracking-tight">ความโปร่งใส</h3>
          <ul className="list-disc pl-5 text-sm text-[#3a3a3c] mt-2 space-y-1">
            <li>ธุรกรรมบันทึกบนบล็อกเชน ตรวจสอบย้อนหลังได้</li>
            <li>สัญญาอัจฉริยะกำหนดกติกาชัดเจน ลดการแทรกแซง</li>
            <li>ราคา สต็อก และผลลัพธ์ ดึงตรงจากสัญญา</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
