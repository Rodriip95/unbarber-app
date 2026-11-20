/**
 * Normaliza un celular argentino a E.164 móvil (+549 + área sin 0 + número sin 15).
 * Acepta "11 15 2345-6789", "011 2345 6789", "+54 9 11 2345-6789", "5491123456789".
 * Devuelve null si no parece un celular argentino válido (10 dígitos nacionales).
 */
export function normalizeArMobile(input: string): string | null {
  let d = input.replace(/\D/g, "");
  if (d.startsWith("54")) d = d.slice(2);
  if (d.startsWith("9")) d = d.slice(1);
  if (d.startsWith("0")) d = d.slice(1);
  // Quitar el "15" que sigue al código de área (área de 2, 3 o 4 dígitos).
  if (d.length === 12) {
    for (const areaLen of [2, 3, 4]) {
      if (d.slice(areaLen, areaLen + 2) === "15") {
        d = d.slice(0, areaLen) + d.slice(areaLen + 2);
        break;
      }
    }
  }
  if (d.length !== 10) return null;
  return `+549${d}`;
}
