// Reduz a foto no próprio celular antes de subir: a câmera tira 4 MB ou mais,
// e o feed só precisa de 1080 px. JPEG porque todo navegador sabe gerar.

const LADO_MAIOR = 1080;
const QUALIDADE = 0.82;

export async function reduzirFoto(arquivo: File, ladoMaior = LADO_MAIOR): Promise<Blob> {
  const bitmap = await createImageBitmap(arquivo, { imageOrientation: "from-image" });
  const escala = Math.min(1, ladoMaior / Math.max(bitmap.width, bitmap.height));
  const largura = Math.round(bitmap.width * escala);
  const altura = Math.round(bitmap.height * escala);
  const canvas = document.createElement("canvas");
  canvas.width = largura;
  canvas.height = altura;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("não deu para preparar a foto");
  ctx.drawImage(bitmap, 0, 0, largura, altura);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("não deu para preparar a foto"))), "image/jpeg", QUALIDADE)
  );
}
