export default function buildImageList(propertyImages = []) {
  if (!propertyImages?.length) return [];

  // 1️⃣ Dari group isMain === true, ambil entry type LARGE
  const mainGroup = propertyImages.find((img) => img?.isMain);
  const mainImage = mainGroup?.entries?.find((e) => e?.imageType === 'LARGE');

  // 2️⃣ Dari group isMain === false, ambil masing-masing 1 entry type LARGE
  const nonMainImages = propertyImages
    .filter((img) => !img?.isMain)
    .map((img) => img?.entries?.find((e) => e?.imageType === 'LARGE'))
    .filter(Boolean)
    .slice(0, 2); // ambil 2 saja

  // 3️⃣ Gabungkan: mainImage di depan, total 3
  return [mainImage, ...nonMainImages].filter(Boolean);
}