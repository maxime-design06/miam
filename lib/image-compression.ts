/**
 * Redimensionne et compresse une image côté navigateur, avant l'envoi
 * vers Supabase Storage. Objectif : rester largement sous la taille
 * réellement affichée sur le site (jamais plus de ~900px de large à
 * l'écran), pour que 1000+ recettes avec photo tiennent confortablement
 * dans l'espace de stockage disponible.
 *
 * Renvoie le fichier d'origine si la compression échoue pour une
 * raison ou une autre (navigateur trop ancien, fichier non supporté...),
 * plutôt que de bloquer l'envoi.
 */
export async function compressImageToWebp(
  file: File,
  maxDimension = 900,
  quality = 0.82
): Promise<File> {
  if (!file.type.startsWith("image/")) return file;

  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;

  let { width, height } = bitmap;
  if (width > maxDimension || height > maxDimension) {
    const scale = maxDimension / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, width, height);

  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/webp", quality)
  );
  if (!blob) return file;

  const newName = file.name.replace(/\.[^.]+$/, "") + ".webp";
  return new File([blob], newName, { type: "image/webp" });
}
