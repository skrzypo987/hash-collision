import { useState, useEffect } from "react";
import { Copy, Check } from "lucide-react";
import Decimal from "decimal.js";

Decimal.set({ precision: 100 });

export default function HashCollisionCalculator() {
  const [bucketInput, setBucketInput] = useState("2");
  const [bucketMode, setBucketMode] = useState("bits");
  const [numHashesInput, setNumHashesInput] = useState("1000000");
  const [numHashesMode, setNumHashesMode] = useState("number");
  const [probability, setProbability] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  function calculateProbability(k, n) {
    try {
      const bigN = BigInt(n);
      const bigK = BigInt(k);

      if (bigN > bigK) return new Decimal(1);

      if (n <= 1e4) {
        let p = new Decimal(1);
        const kDecimal = new Decimal(bigK.toString());
        for (let i = 0n; i < bigN; i++) {
          const term = new Decimal((bigK - i).toString()).div(kDecimal);
          p = p.mul(term);
        }
        return new Decimal(1).minus(p);
      } else {
        const kNum = new Decimal(bigK.toString());
        const pNoCollision = Decimal.exp(
          new Decimal(-n).mul(n - 1).div(new Decimal(2).mul(kNum))
        );
        return new Decimal(1).minus(pNoCollision);
      }
    } catch (error) {
      console.error("Hash calculation error:", error);
      return null;
    }
  }

  useEffect(() => {
    let k;
    if (bucketMode === "bits") {
      const bits = parseInt(bucketInput);
      if (isFinite(bits) && bits > 0) {
        k = Math.pow(2, bits);
      } else {
        setProbability(null);
        return;
      }
    } else {
      k = parseInt(bucketInput);
    }

    let n;
    if (numHashesMode === "bits") {
      const bits = parseInt(numHashesInput);
      if (isFinite(bits) && bits > 0) {
        n = Math.pow(2, bits);
      } else {
        setProbability(null);
        return;
      }
    } else {
      n = parseInt(numHashesInput);
    }

    if (!isNaN(k) && k > 0 && !isNaN(n) && n > 0 && isFinite(k) && isFinite(n)) {
      const prob = calculateProbability(k, n);
      setProbability(prob);
    } else {
      setProbability(null);
    }
  }, [bucketInput, bucketMode, numHashesInput, numHashesMode]);

  const handleNumericInput = (value, setter) => {
    const numeric = value.replace(/\D/g, "").replace(/^0+(?!$)/, "");
    setter(numeric);
  };

  const formatProbability = (p) => {
    if (!p) return "0%";
    if (p.eq(1)) return "100%";
    if (p.eq(0)) return "0%";
    return p.lt("1e-6") ? p.toExponential(6) : p.mul(100).toFixed(10) + "%";
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const CopyButton = ({ value, field }) => (
    <div className="relative">
      <button
        onClick={() => copyToClipboard(value, field)}
        className="mb-4"
        aria-label={`Copy ${field}`}
      >
        {copiedField === field ? <Check size={18} /> : <Copy size={18} />}
      </button>
    </div>
  );

  const ModeTabs = ({ mode, setMode }) => (
    <div className="flex gap-1 ml-2">
      <button
        className={`px-2 py-1 border rounded ${mode === "bits" ? "bg-gray-200" : ""}`}
        onClick={() => setMode("bits")}
      >
        Bits
      </button>
      <button
        className={`px-2 py-1 border rounded ${mode === "number" ? "bg-gray-200" : ""}`}
        onClick={() => setMode("number")}
      >
        Number
      </button>
    </div>
  );

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Hash Collision Probability</h1>

      <div>
        <label>Number of Buckets</label>
        <div className="flex gap-2 items-center">
          <input
            className="block w-full border px-2 py-1 mb-4"
            type="text"
            inputMode="numeric"
            value={bucketInput}
            onChange={(e) => handleNumericInput(e.target.value, setBucketInput)}
          />
          <ModeTabs mode={bucketMode} setMode={setBucketMode} />
          <CopyButton value={bucketInput} field="buckets" />
        </div>
      </div>

      <div>
        <label>Number of Hashes</label>
        <div className="flex gap-2 items-center">
          <input
            className="block w-full border px-2 py-1 mb-4"
            type="text"
            inputMode="numeric"
            value={numHashesInput}
            onChange={(e) => handleNumericInput(e.target.value, setNumHashesInput)}
          />
          <ModeTabs mode={numHashesMode} setMode={setNumHashesMode} />
          <CopyButton value={numHashesInput} field="numHashes" />
        </div>
      </div>

      <div>
        <label>Collision Probability</label>
        <div className="flex gap-2 items-center">
          <input
            className="block w-full border px-2 py-1 mb-4 bg-gray-100"
            type="text"
            value={probability !== null ? formatProbability(probability) : "0%"}
            disabled
          />
          <CopyButton
            value={probability !== null ? formatProbability(probability) : "0%"}
            field="probability"
          />
        </div>
      </div>
    </div>
  );
}
