import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { expensesAPI } from "../api";
import { EXPENSE_CATEGORIES } from "../utils/constants";
import { getMonthlyRemaining } from "../utils/budget";
import { formatCurrency } from "../utils/format";
import type { Expense } from "../types";

interface AddExpenseModalProps { isOpen: boolean; onClose: () => void; }

// ── Smart categorisation keyword map ────────────────────────────────────
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "🍔 Food":      ["swiggy","zomato","dominos","pizza","burger","food","restaurant","cafe","kfc","mcdonalds","subway","biryani","lunch","dinner","breakfast","snack","eat"],
  "☕ Coffee":    ["coffee","starbucks","cafe coffee","barista","espresso","latte","tea","chai"],
  "🚗 Transport": ["uber","ola","rapido","auto","taxi","petrol","fuel","metro","bus","train","flight","irctc","toll","parking"],
  "🛍️ Shopping": ["amazon","flipkart","myntra","ajio","shopping","clothes","shoes","dress","mall","market","grocery","bigbasket","blinkit","zepto","instamart"],
  "⚡ Utilities": ["electricity","water","gas","internet","wifi","broadband","jio","airtel","vi","bsnl","bill","rent","maintenance","recharge"],
  "🎮 Gaming":    ["steam","epic","playstation","xbox","nintendo","game","gaming","battlepass","pubg","fortnite","valorant","spotify","netflix","prime","hotstar","zee5"],
};

function suggestCategory(note: string): string | null {
  const lower = note.toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) return cat;
  }
  return null;
}

// ── AI categorisation via Claude API ────────────────────────────────────
async function aiSuggestCategory(note: string): Promise<string | null> {
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 50,
        system: `You are a category classifier for an expense tracker. Given a note, reply with ONLY one of these exact values and nothing else:
🍔 Food | ☕ Coffee | 🚗 Transport | 🛍️ Shopping | ⚡ Utilities | 🎮 Gaming`,
        messages: [{ role: "user", content: `Note: "${note}"` }],
      }),
    });
    const data = await res.json();
    const text = data?.content?.[0]?.text?.trim() ?? "";
    const valid = EXPENSE_CATEGORIES.map((c) => c.value);
    return valid.includes(text) ? text : null;
  } catch { return null; }
}

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ isOpen, onClose }) => {
  const { user, showXPToast, refreshProfile } = useAuth();
  const [amount, setAmount]     = useState("");
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0].value);
  const [note, setNote]         = useState("");
  const [date, setDate]         = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [suggestion, setSuggestion]   = useState<string | null>(null);
  const [aiLoading, setAiLoading]     = useState(false);
  const [receiptScanning, setReceiptScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const noteDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const monthlyBudget = user?.monthlyBudget ?? 10000;

  useEffect(() => {
    if (!isOpen) return;
    setError(""); setSuggestion(null);
    expensesAPI.getExpenses().then((r) => setExpenses(r.data)).catch(() => setExpenses([]));
  }, [isOpen]);

  if (!isOpen) return null;

  const now = new Date();
  const monthlyRemaining       = getMonthlyRemaining(expenses, monthlyBudget, now);
  const parsed                 = parseFloat(amount);
  const hasValidAmount         = amount !== "" && !isNaN(parsed) && parsed > 0;
  const projectedRemaining     = hasValidAmount ? monthlyRemaining - parsed : monthlyRemaining;
  const wouldExceedBudget      = hasValidAmount && projectedRemaining < 0;

  // ── Smart categorisation on note change ─────────────────────────────
  const handleNoteChange = (val: string) => {
    setNote(val);
    setSuggestion(null);
    if (noteDebounceRef.current) clearTimeout(noteDebounceRef.current);
    if (val.trim().length < 2) return;

    // First try keyword match (instant)
    const kw = suggestCategory(val);
    if (kw) { setSuggestion(kw); return; }

    // Fallback to AI after 800ms debounce
    noteDebounceRef.current = setTimeout(async () => {
      setAiLoading(true);
      const ai = await aiSuggestCategory(val);
      setAiLoading(false);
      if (ai) setSuggestion(ai);
    }, 800);
  };

  const applySuggestion = () => {
    if (suggestion) { setCategory(suggestion); setSuggestion(null); }
  };

  // ── Receipt scanner ────────────────────────────────────────────────
  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setReceiptScanning(true); setError("");

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 200,
          system: `You are a receipt parser. Extract the total amount and category from the receipt image.
Reply ONLY with valid JSON like: {"amount": 450.00, "category": "🍔 Food", "note": "Restaurant name"}
Category must be one of: 🍔 Food | ☕ Coffee | 🚗 Transport | 🛍️ Shopping | ⚡ Utilities | 🎮 Gaming`,
          messages: [{
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: file.type, data: base64 } },
              { type: "text", text: "Parse this receipt." },
            ],
          }],
        }),
      });

      const data = await res.json();
      const text = data?.content?.[0]?.text ?? "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);

      if (parsed.amount) setAmount(String(parsed.amount));
      if (parsed.category) setCategory(parsed.category);
      if (parsed.note) setNote(parsed.note);
    } catch {
      setError("Could not read receipt. Please enter manually.");
    } finally {
      setReceiptScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ── Submit ─────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasValidAmount) { setError("Enter a valid amount greater than ₹0.00"); return; }
    setLoading(true); setError("");
    try {
      const res = await expensesAPI.addExpense({ amount: parsed, category, note: note || undefined, date });
      const { xpAwarded, leveledUp } = res.data;
      showXPToast(xpAwarded, leveledUp ? `+${xpAwarded} XP — LEVEL UP! ⚡` : `+${xpAwarded} XP ⚡`);
      await refreshProfile();
      window.dispatchEvent(new CustomEvent("expense-added"));
      setAmount(""); setNote(""); setCategory(EXPENSE_CATEGORIES[0].value); setSuggestion(null);
      onClose();
    } catch { setError("Failed to log expense. Is the server running?"); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="glass-card w-full max-w-md rounded-2xl p-6 animate-in max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>

        <div className="flex justify-between items-center mb-4">
          <h2 className="font-title-md text-title-md text-primary">Log a Deed</h2>
          <div className="flex items-center gap-2">
            {/* Receipt scan button */}
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={receiptScanning}
              title="Scan receipt"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container-high border border-white/10 text-on-surface-variant hover:text-secondary hover:border-secondary/40 text-xs font-label-caps transition-all active:scale-95 disabled:opacity-50">
              <span className="material-symbols-outlined text-sm pointer-events-none">{receiptScanning ? "hourglass_empty" : "document_scanner"}</span>
              <span className="pointer-events-none">{receiptScanning ? "Reading..." : "Scan"}</span>
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleReceiptUpload} />
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-primary active:scale-95 transition-all">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        {/* Monthly budget status */}
        <div className={`mb-4 px-4 py-3 rounded-xl border text-sm ${monthlyRemaining < 0 ? "bg-error-container/20 border-error/30" : "bg-surface-container-high border-white/10"}`}>
          <span className="font-label-caps text-label-caps text-on-surface-variant block text-xs mb-1">Monthly remaining</span>
          <span className={`font-semibold text-base ${monthlyRemaining < 0 ? "text-error" : "text-secondary"}`}>{formatCurrency(monthlyRemaining)}</span>
          {hasValidAmount && (
            <span className="block mt-1 text-xs">After: <span className={wouldExceedBudget ? "text-error font-semibold" : "text-on-surface"}>{formatCurrency(projectedRemaining)}</span></span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount */}
          <div className="text-center">
            <label className="font-label-caps text-label-caps text-on-surface-variant block mb-2">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-on-surface-variant">₹</span>
              <input type="number" step="any" min="0.01" value={amount}
                onChange={(e) => { setAmount(e.target.value); setError(""); }}
                placeholder="0.00" required
                className={`w-full text-center text-4xl font-display-lg py-4 px-10 rounded-xl sunken-surface border text-primary focus:outline-none focus:ring-2 bg-transparent ${wouldExceedBudget ? "border-error/50 focus:ring-error" : "border-outline-variant/50 focus:ring-primary"}`}
              />
            </div>
          </div>

          {/* Note with AI suggestion */}
          <div>
            <label htmlFor="note" className="font-label-caps text-label-caps text-on-surface-variant block mb-2">
              Note (optional)
              {aiLoading && <span className="ml-2 text-xs text-primary animate-pulse">AI thinking...</span>}
            </label>
            <input id="note" type="text" value={note} onChange={(e) => handleNoteChange(e.target.value)}
              placeholder="Swiggy order, Uber, Netflix..."
              className="w-full px-4 py-3 rounded-xl sunken-surface border border-outline-variant/50 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {/* Suggestion pill */}
            {suggestion && suggestion !== category && (
              <button type="button" onClick={applySuggestion}
                className="mt-2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-bold hover:bg-primary/20 active:scale-95 transition-all">
                <span className="material-symbols-outlined text-sm pointer-events-none">auto_awesome</span>
                <span className="pointer-events-none">Use: {suggestion}</span>
              </button>
            )}
          </div>

          {/* Category */}
          <div>
            <span className="font-label-caps text-label-caps text-on-surface-variant block mb-2">Category</span>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {EXPENSE_CATEGORIES.map((cat) => (
                <button key={cat.value} type="button" onClick={() => setCategory(cat.value)}
                  className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border transition-all active:scale-95 ${
                    category === cat.value
                      ? "bg-gradient-to-r from-primary-container to-secondary text-on-primary border-transparent glow-teal"
                      : "bg-surface-container-high text-on-surface border-white/10 hover:border-primary/30"
                  }`}>
                  <span className="text-lg">{cat.emoji}</span>
                  <span className="text-sm font-semibold">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <label htmlFor="date" className="font-label-caps text-label-caps text-on-surface-variant block mb-2">Date</label>
            <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl sunken-surface border border-outline-variant/50 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {wouldExceedBudget && !error && (
            <p className="text-tertiary text-sm bg-tertiary/10 border border-tertiary/30 px-3 py-2 rounded-lg">
              Boss fight! {formatCurrency(-projectedRemaining)} over monthly budget.
            </p>
          )}
          {error && <p className="text-error text-sm bg-error-container/30 px-3 py-2 rounded-lg">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full py-4 rounded-xl font-label-caps text-label-caps text-on-primary btn-grad active:scale-[0.96] transition-all disabled:opacity-50">
            {loading ? "Logging..." : "Log Deed →"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddExpenseModal;
