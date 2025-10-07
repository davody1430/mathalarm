export function generateMathProblem() {
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  const op = Math.random() < 0.5 ? '+' : '-';
  const question = `${a} ${op} ${b}`;
  const answer = op === '+' ? a + b : a - b;
  return { question, answer };
}