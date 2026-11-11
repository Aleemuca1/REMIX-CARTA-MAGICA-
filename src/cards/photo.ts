/** Abre a foto escolhida só no aparelho (nada é enviado). Mantém o arquivo original intacto e cria uma cópia de trabalho. */
export const MAX_PHOTO = 3200; // px no lado maior: suficiente para A4 a 300 DPI na área da foto

export async function photoFromBlob(blob: Blob, quarterTurns = 0): Promise<HTMLCanvasElement> {
  const url = URL.createObjectURL(blob);
  try {
    const img = await new Promise<HTMLImageElement>((ok, err) => {
      const i = new Image();
      i.onload = () => ok(i);
      i.onerror = () => err(new Error("Não consegui abrir essa imagem. Tente uma foto JPG ou PNG."));
      i.src = url;
    });
    const k = Math.min(1, MAX_PHOTO / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.round(img.naturalWidth * k),
      h = Math.round(img.naturalHeight * k);
    const q = ((quarterTurns % 4) + 4) % 4;
    const c = document.createElement("canvas");
    c.width = q % 2 ? h : w;
    c.height = q % 2 ? w : h;
    const ctx = c.getContext("2d")!;
    ctx.imageSmoothingQuality = "high";
    ctx.translate(c.width / 2, c.height / 2);
    ctx.rotate((q * Math.PI) / 2);
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    return c;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export const isImage = (f: File) => /^image\//.test(f.type) || /\.(jpe?g|png|webp|heic|heif|gif)$/i.test(f.name);
