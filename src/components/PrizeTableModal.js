import React, { useState, useEffect } from "react";
import { savePrizes } from "../utils/api";

export default function PrizeTableModal({ open, onClose, prizeTable, setPrizeTable }) {
  const [localPrizeTable, setLocalPrizeTable] = useState(prizeTable || []);
  const [newStamp, setNewStamp] = useState("");
  const [newPrize, setNewPrize] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLocalPrizeTable(prizeTable || []);
  }, [prizeTable, open]);

  const handleAddPrize = (e) => {
    e.preventDefault();
    if (!newStamp || !newPrize) return;
    setLocalPrizeTable([...localPrizeTable, { stamps: Number(newStamp), prize: newPrize }]);
    setNewStamp(""); setNewPrize("");
  };

  const handleRemove = (idx) => {
    setLocalPrizeTable(localPrizeTable.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    setSaving(true);
    const sorted = [...localPrizeTable].sort((a, b) => a.stamps - b.stamps);
    await savePrizes(sorted);
    setPrizeTable(sorted);
    setSaving(false);
    onClose();
  };

  if (!open) return null;
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
      background: "rgba(0,0,0,0.16)", zIndex: 2000,
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{
        background: "#fff", borderRadius: 16, minWidth: 340, maxWidth: 400, padding: "2rem",
        boxShadow: "0 8px 32px rgba(20,62,142,0.18)", textAlign: "center"
      }}>
        <h3 style={{ color: "#143E8E", marginTop: 0 }}>Edit Prizes</h3>
        <ul style={{ listStyle: "none", padding: 0, marginBottom: 20 }}>
          {localPrizeTable.map((pr, i) => (
            <li key={i} style={{ margin: "7px 0", fontSize: 15 }}>
              <b>{pr.stamps} stamps:</b> {pr.prize}{" "}
              <button onClick={() => handleRemove(i)} style={{
                marginLeft: 10, background: "none", border: "none", color: "#E02327", cursor: "pointer"
              }}>✕</button>
            </li>
          ))}
        </ul>
        <form onSubmit={handleAddPrize} style={{ display: "flex", gap: 6, marginBottom: 18, justifyContent: "center" }}>
          <input
            type="number" min={1} required
            value={newStamp}
            onChange={e => setNewStamp(e.target.value)}
            placeholder="Stamps"
            style={{ width: 70, padding: 6, borderRadius: 6, border: "1.5px solid #143E8E", fontSize: 14 }}
          />
          <input
            required
            value={newPrize}
            onChange={e => setNewPrize(e.target.value)}
            placeholder="Prize"
            style={{ width: 120, padding: 6, borderRadius: 6, border: "1.5px solid #143E8E", fontSize: 14 }}
          />
          <button type="submit" style={{ background: "#143E8E", color: "white", border: "none", borderRadius: 6, padding: "7px 12px", fontSize: 15 }}>Add</button>
        </form>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button onClick={handleSave} disabled={saving} style={{ background: "#143E8E", color: "white", border: "none", borderRadius: 8, padding: "8px 22px", fontWeight: 600 }}>
            {saving ? "Saving..." : "Save"}
          </button>
          <button onClick={onClose} style={{ background: "none", color: "#E02327", border: "none", borderRadius: 8, padding: "8px 22px", fontWeight: 600 }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
