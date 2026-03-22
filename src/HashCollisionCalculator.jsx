import { useState, useEffect, useRef } from "react";
import { Copy, Check, Settings, Info, X } from "lucide-react";
import Decimal from "decimal.js";

function parseInput(value, mode) {
  if (mode === "bits") {
    const bits = parseInt(value);
    if (!isFinite(bits) || bits <= 0) return null;
    return BigInt(2) ** BigInt(bits);
  } else {
    const n = parseInt(value);
    if (!isFinite(n) || isNaN(n) || n <= 0) return null;
    return n;
  }
}

function formatProbability(p) {
  if (!p) return "0%";
  if (p.eq(1)) return "100%";
  if (p.eq(0)) return "0%";
  return p.lt("1e-6") ? p.toExponential(6) : p.mul(100).toFixed(10) + "%";
}

function ModeTabs({ mode, setMode, labels = { number: "Number" } }) {
  return (
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
        {labels.number}
      </button>
    </div>
  );
}

function CopyButton({ value, field, copiedField, onCopy }) {
  return (
    <div className="relative">
      <button
        onClick={() => onCopy(value, field)}
        className="mb-4"
        aria-label={`Copy ${field}`}
      >
        {copiedField === field ? <Check size={18} /> : <Copy size={18} />}
      </button>
    </div>
  );
}

function LoadingModal({ onStop }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 flex flex-col items-center gap-5">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
        <p className="text-sm font-medium text-gray-700">Calculating…</p>
        <button
          onClick={onStop}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded"
        >
          Stop
        </button>
      </div>
    </div>
  );
}

function InfoModal({ onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div ref={ref} className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
          <X size={18} />
        </button>
        <h2 className="text-lg font-bold mb-3">Hash Collision &amp; Birthday Paradox</h2>
        <p className="text-sm text-gray-700 mb-3">
          A <strong>hash collision</strong> occurs when two distinct inputs produce the same hash output.
          Even with a large hash space, collisions become surprisingly likely as the number of hashes grows —
          a phenomenon explained by the <strong>Birthday Paradox</strong>.
        </p>
        <p className="text-sm text-gray-700 mb-3">
          The Birthday Paradox states that in a group of just 23 people, there is a ~50% chance two share a birthday
          (out of 365 possibilities). The same math applies to hashes: with <em>n</em> hashes and <em>k</em> possible
          values, the collision probability is approximately:
        </p>
        <div className="bg-gray-50 border rounded p-3 text-sm font-mono mb-3 text-center">
          P ≈ 1 − e<sup>−n(n−1) / 2k</sup>
        </div>
        <p className="text-sm text-gray-700 mb-4">
          This calculator uses the exact formula for small hash counts and the approximation above for larger ones
          (configurable via the cutoff setting), with arbitrary decimal precision.
        </p>
        <h3 className="text-sm font-semibold mb-2">Further Reading</h3>
        <ul className="text-sm space-y-1">
          <li>
            <a href="https://en.wikipedia.org/wiki/Birthday_problem" target="_blank" rel="noopener noreferrer"
               className="text-blue-600 hover:underline">
              Wikipedia — Birthday Problem
            </a>
            <span className="text-gray-500"> — mathematical foundation with proofs and tables</span>
          </li>
          <li>
            <a href="https://en.wikipedia.org/wiki/Hash_collision" target="_blank" rel="noopener noreferrer"
               className="text-blue-600 hover:underline">
              Wikipedia — Hash Collision
            </a>
            <span className="text-gray-500"> — collisions in hash functions and their practical impact</span>
          </li>
          <li>
            <a href="https://en.wikipedia.org/wiki/Birthday_attack" target="_blank" rel="noopener noreferrer"
               className="text-blue-600 hover:underline">
              Wikipedia — Birthday Attack
            </a>
            <span className="text-gray-500"> — cryptographic exploitation of birthday-paradox collisions</span>
          </li>
          <li>
            <a href="https://csrc.nist.gov/publications/detail/sp/800-107/rev-1/final" target="_blank" rel="noopener noreferrer"
               className="text-blue-600 hover:underline">
              NIST SP 800-107 — Recommendation for Hash Functions
            </a>
            <span className="text-gray-500"> — security guidelines and collision resistance requirements</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

function SettingsModal({ onClose, precision, setPrecision, precisionValid, cutoffThreshold, setCutoffThreshold }) {
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div ref={ref} className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
          <X size={18} />
        </button>
        <h2 className="text-lg font-bold mb-4">Settings</h2>
        <label className="block text-sm mb-1">Decimal Precision</label>
        <input
          type="text"
          inputMode="numeric"
          maxLength={4}
          className={`border px-2 py-1 w-full ${!precisionValid ? "border-red-500 bg-red-100" : ""}`}
          value={precision}
          onChange={(e) => setPrecision(Number(e.target.value.replace(/\D/g, "")))}
        />
        {!precisionValid && (
          <p className="text-red-500 text-sm mt-1">Precision must be between 1 and 9999</p>
        )}
        <label className="block text-sm mt-4 mb-1">Exact Calculation Cutoff (hash count)</label>
        <input
          type="text"
          inputMode="numeric"
          maxLength={7}
          className="border px-2 py-1 w-full"
          value={cutoffThreshold}
          onChange={(e) => setCutoffThreshold(Number(e.target.value.replace(/\D/g, "")))}
        />
      </div>
    </div>
  );
}

export default function HashCollisionCalculator() {
  const [bucketInput, setBucketInput] = useState("64");
  const [bucketMode, setBucketMode] = useState("bits");
  const [numHashesInput, setNumHashesInput] = useState("1000000");
  const [numHashesMode, setNumHashesMode] = useState("number");
  const [cutoffThreshold, setCutoffThreshold] = useState(10000);
  const [showSettings, setShowSettings] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showCalculating, setShowCalculating] = useState(false);
  const [probability, setProbability] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const [precision, setPrecision] = useState(100);

  const workerRef = useRef(null);
  const timerRef = useRef(null);

  const precisionValid = precision > 0 && precision <= 9999;

  const stopWorker = () => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setShowCalculating(false);
  };

  useEffect(() => {
    stopWorker();

    if (!precisionValid) {
      setProbability(null);
      return;
    }

    Decimal.set({ precision });

    const k = parseInput(bucketInput, bucketMode);
    const n = parseInput(numHashesInput, numHashesMode);

    if (k == null || n == null) {
      setProbability(null);
      return;
    }

    const worker = new Worker(new URL("./calcWorker.js", import.meta.url), { type: "module" });
    workerRef.current = worker;

    timerRef.current = setTimeout(() => setShowCalculating(true), 200);

    worker.onmessage = (e) => {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      setShowCalculating(false);
      workerRef.current = null;
      const { result } = e.data;
      setProbability(result ? new Decimal(result) : null);
      worker.terminate();
    };

    worker.onerror = () => {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      setShowCalculating(false);
      workerRef.current = null;
      setProbability(null);
      worker.terminate();
    };

    worker.postMessage({ k, n, cutoffThreshold, precision });

    return () => {
      worker.terminate();
      clearTimeout(timerRef.current);
    };
  }, [bucketInput, bucketMode, numHashesInput, numHashesMode, precision, cutoffThreshold]);

  const handleNumericInput = (value, setter) => {
    setter(value.replace(/\D/g, "").replace(/^0+(?!$)/, ""));
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const probabilityText = probability !== null ? formatProbability(probability) : "0%";

  return (
    <div className="p-4 max-w-xl mx-auto relative">
      {showCalculating && <LoadingModal onStop={() => { stopWorker(); setProbability(null); }} />}
      {showInfo && <InfoModal onClose={() => setShowInfo(false)} />}
      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          precision={precision}
          setPrecision={setPrecision}
          precisionValid={precisionValid}
          cutoffThreshold={cutoffThreshold}
          setCutoffThreshold={setCutoffThreshold}
        />
      )}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">High precision hash collision calculator</h1>
        <div className="flex gap-2 items-center">
          <button onClick={() => setShowInfo(true)} aria-label="About hash collision probability">
            <Info size={20} />
          </button>
          <button onClick={() => setShowSettings(true)} aria-label="Settings">
            <Settings size={20} />
          </button>
        </div>
      </div>

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
          <ModeTabs mode={bucketMode} setMode={setBucketMode} labels={{ number: "Buckets" }} />
          <CopyButton value={bucketInput} field="buckets" copiedField={copiedField} onCopy={copyToClipboard} />
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
          <ModeTabs mode={numHashesMode} setMode={setNumHashesMode} labels={{ number: "Hashes" }} />
          <CopyButton value={numHashesInput} field="numHashes" copiedField={copiedField} onCopy={copyToClipboard} />
        </div>
      </div>

      <div>
        <label>Collision Probability</label>
        <div className="flex gap-2 items-center">
          <input
            className="block w-full border px-2 py-1 mb-4 bg-gray-100"
            type="text"
            value={probabilityText}
            disabled
          />
          <CopyButton value={probabilityText} field="probability" copiedField={copiedField} onCopy={copyToClipboard} />
        </div>
      </div>
    </div>
  );
}
