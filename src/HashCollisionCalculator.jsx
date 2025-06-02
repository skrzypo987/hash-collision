import { useState, useEffect } from "react";

export default function HashCollisionCalculator() {
  const [bitLengthInput, setBitLengthInput] = useState("64");
  const [numHashesInput, setNumHashesInput] = useState("1000000");
  const [probability, setProbability] = useState(null);

  function calculateProbability(bits, n) {
    const k = Math.pow(2, bits);
    if (n > k) return 1;
    const pNoCollision = Math.exp(-n * (n - 1) / (2 * k));
    return 1 - pNoCollision;
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
    return p < 1e-6 ? p.toExponential(2) : (p * 100).toFixed(6) + "%";
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
