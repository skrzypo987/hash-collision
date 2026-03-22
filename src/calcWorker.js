import Decimal from "decimal.js";

function calculateProbability(k, n, cutoffThreshold) {
  try {
    const bigN = BigInt(n);
    const bigK = BigInt(k);

    if (bigN > bigK) return new Decimal(1);

    if (n <= cutoffThreshold) {
      let p = new Decimal(1);
      const kDecimal = new Decimal(bigK.toString());
      for (let i = 0n; i < bigN; i++) {
        p = p.mul(new Decimal((bigK - i).toString()).div(kDecimal));
      }
      return new Decimal(1).minus(p);
    } else {
      const kNum = new Decimal(bigK.toString());
      const nDecimal = new Decimal(bigN.toString());
      const pNoCollision = Decimal.exp(
        nDecimal.neg().mul(nDecimal.minus(1)).div(new Decimal(2).mul(kNum))
      );
      return new Decimal(1).minus(pNoCollision);
    }
  } catch (error) {
    return null;
  }
}

self.onmessage = (e) => {
  const { k, n, cutoffThreshold, precision } = e.data;
  Decimal.set({ precision });
  const result = calculateProbability(k, n, cutoffThreshold);
  self.postMessage({ result: result ? result.toString() : null });
};
