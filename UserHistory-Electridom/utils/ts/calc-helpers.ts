// Utilidades comunes para cálculo
export const toVA = (w: number, fp = 1) => Math.round((w / (fp || 1)) * 100) / 100;
export const sum = (arr: number[]) => arr.reduce((a,b)=>a+b,0);
export const pct = (part: number, total: number) => total ? (part/total)*100 : 0;
