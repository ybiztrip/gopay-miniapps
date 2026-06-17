export default function generateRandomUUID() {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 8);
}