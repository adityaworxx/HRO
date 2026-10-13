export async function simulateLatency(minMs = 300, maxMs = 700): Promise<void> {
  const ms = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let forceFailure = false;

export function setForceFailure(value: boolean): void {
  forceFailure = value;
}

export function getForceFailure(): boolean {
  return forceFailure;
}
