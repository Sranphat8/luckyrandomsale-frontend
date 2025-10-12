export function imageFromName(name = "") {
  const n = name.toLowerCase();

  // ตู้เย็น
  if (n.includes("ตู้เย็น") || n.includes("fridge") || n.includes("refrigerator"))
    return "https://images.samsung.com/is/image/samsung/p6pim/th/rt38k501js8-st/gallery/th-top-mount-freezer-rt38k501js8-rt38k501js8-st-537035094?$720_576_JPG$";

  // PlayStation 5 
  if (n.includes("playstation") || n.includes("ps5") || n.includes("ps 5") || n.includes("slim"))
    return "https://image.makewebcdn.com/makeweb/m_1920x0/Spf7nJjLD/Accessories_PS5/PS5_Slim___Console_Cover_Midnight_Black.jpg";

  // iPhone 
  if (n.includes("iphone"))
    return "https://www.kingcorp.co.th/_images/_prod/kwzk6eNhmzUgLcfjhVnOaczf.webp";

  // Nintendo 
  if (n.includes("nintendo") || n.includes("switch") || n.includes("oled"))
    return "https://res.cloudinary.com/itcity-production/image/upload/f_jpg,q_80/v1691134154/product/product-master/yr0u56cbgujl7irebhr7.jpg";

  // MacBook 
  if (n.includes("macbook") || n.includes("mac book") || n.includes("air m1") || n.includes("air m2") || n.includes("m2"))
    return "https://www.istudiobyspvi.com/cdn/shop/files/MacBook_Air_13_in_Midnight_PDP_Image_Position-1_caEN.jpg?v=1718120744&width=823";

  // Apple 
  if (n.includes("apple watch") || n.includes("watch ultra") || n.includes("นาฬิกา"))
    return "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/ultra-case-unselect-gallery-1-202509_GEO_TH_LANG_TH?wid=5120&hei=3280&fmt=p-jpg&qlt=80&.v=aTVJSEliNW9jb25zalBlTm16VmMxcWpkNHRJWDMzcTg3NWRxV0pydTcvSlNIVXZESTdLVUdtR2twUjFoVkZkZk9JTG5ibjdSYmt4c3E2TDZqQng1Sm54TS9QOFlhVHZoV2xFZjU3V3B4aXVYdks1eml4Z3NFczYxSk54bTJDb2ZzblYxeVBDVFljN083TG9WT1VNaEVn";

  // default เผื่อเพิ่มสินค้าใหม่
  return "https://images.unsplash.com/photo-1515165562835-c3b8c8028f3a?q=80&w=1200&auto=format&fit=crop";
}
