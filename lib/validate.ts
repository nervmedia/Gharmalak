export function cleanPhone(input: unknown): string | null {
  const digits = String(input ?? '').replace(/\D/g, '');
  const ten = digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits.length === 11 && digits.startsWith('0') ? digits.slice(1) : digits;
  return /^[6-9]\d{9}$/.test(ten) ? ten : null;
}

export function cleanText(input: unknown, max: number): string {
  return String(input ?? '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, max);
}
