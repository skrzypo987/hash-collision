import { useState, useEffect } from "react";

export default function HashCollisionCalculator() {
  const [bitLengthInput, setBitLengthInput] = useState("64");
  const [numHashesInput, setNumHashesInput] = useState("1000000");
  const [probability, setProbability] = useState(null);

  function calculateProbability(bits, n) {
    const bigN = BigInt(n);
    const k = BigInt(2) ** BigInt(bits);

    if (bigN > k) return 1;

    if (n <= 1e6) {
      let p = 1;
      for (let i = 0n; i < bigN; i++) {
        const numerator = Number(k - i);
        const denominator = Number(k);
        p *= numerator / denominator;
      }
      return 1 - p;
    } else {
      const kNum = Math.pow(2, bits);
      const pNoCollision = Math.exp(-n * (n - 1) / (2 * kNum));
      return 1 - pNoCollision;
    }
  }

  useEffect(() => {
    const bits = parseInt(bitLengthInput);
    const n = parseInt(numHashesInput);
    if (!isNaN(bits) && bits > 0 && !isNaN(n) && n > 0) {
      const prob = calculateProbability(bits, n);
      setProbability(prob);
    } else {
      setProbability(null);
    }
  }, [bitLengthInput, numHashesInput]);

  const handleNumericInput = (value, setter) => {
    const numeric = value.replace(/\D/g, "").replace(/^0+(?!$)/, "");
    setter(numeric);
  };

  const formatProbability = (p) => {
    if (p === 1) return "100%";
    if (p === 0) return "0%";
    if (p < 1e-6) return p.toExponential(2);
    return parseFloat((p * 100).toFixed(6)) + "%";
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Hash Collision Probability</h1>

      <div>
        <label>Hash Output Bit Length</label>
        <input
          className="block w-full border px-2 py-1 mb-4"
          type="text"
          inputMode="numeric"
          value={bitLengthInput}
          onChange={(e) => handleNumericInput(e.target.value, setBitLengthInput)}
        />
      </div>

      <div>
        <label>Number of Hashes</label>
        <input
          className="block w-full border px-2 py-1 mb-4"
          type="text"
          inputMode="numeric"
          value={numHashesInput}
          onChange={(e) => handleNumericInput(e.target.value, setNumHashesInput)}
        />
      </div>

      {probability !== null && (
        <div className="mt-4 text-lg">
          <strong>Collision Probability:</strong> {formatProbability(probability)}
        </div>
      )}
    </div>
  );
}
