import React, { useState } from "react";
import { deleteUser } from "../utils/api";

const PRIMARY_RED = "#E02327";
const PRIMARY_BLUE = "#143E8E";

export default function AdminTable({
  users,
  manualEdit,
  handleManualEdit,
  handleSaveManualEdit,
  setManualEdit,
  onDeleteUser
}) {
  const [confirming, setConfirming] = useState(null); // email to confirm deletion

  return (
    <table style={{ width: "100%", borderCollapse: "collapse", background: "#f9faff", borderRadius: 10 }}>
      <thead>
        <tr>
          <th style={thStyle}>Email</th>
          <th style={thStyle}>Display Name</th>
          <th style={thStyle}>Stamps</th>
          <th style={thStyle}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map(user =>
          <tr key={user.email} style={{ borderBottom: "1px solid #eee" }}>
            <td style={tdStyle}>{user.email}</td>
            <td style={tdStyle}>{user.display_name || ""}</td>
            <td style={tdStyle}>
              {manualEdit[user.email] ? (
                <>
                  <input
                    type="number"
                    min={0}
                    value={manualEdit[user.email].stamp_count}
                    onChange={e => handleManualEdit(user.email, "stamp_count", e.target.value)}
                    style={{
                      width: 60,
                      padding: "3px 7px",
                      borderRadius: 5,
                      border: `1.5px solid ${PRIMARY_BLUE}`,
                      fontSize: 15
                    }}
                  />
                  <button
                    onClick={() => handleSaveManualEdit(user.email)}
                    title="Save"
                    style={actionButtonStyle}
                  >💾</button>
                  <button
                    onClick={() => setManualEdit({ ...manualEdit, [user.email]: undefined })}
                    title="Cancel"
                    style={{ ...actionButtonStyle, color: PRIMARY_RED }}
                  >✕</button>
                </>
              ) : (
                <>
                  {user.stamp_count}
                  <button
                    onClick={() => setManualEdit({ ...manualEdit, [user.email]: { stamp_count: user.stamp_count } })}
                    title="Edit"
                    style={{ ...actionButtonStyle, marginLeft: 8 }}
                  >✎</button>
                </>
              )}
            </td>
            <td style={tdStyle}>
              {/* Delete Button */}
              <button
                style={{ ...actionButtonStyle, color: PRIMARY_RED, fontSize: 19 }}
                title="Delete User"
                onClick={() => setConfirming(user.email)}
              >🗑️</button>

              {/* Confirmation Modal */}
              {confirming === user.email && (
                <div style={modalOverlayStyle}>
                  <div style={modalStyle}>
                    <p>Are you sure you want to delete user<br /><b>{user.display_name || user.email}</b>?</p>
                    <button
                      onClick={async () => {
                        await deleteUser(user.email);
                        setConfirming(null);
                        if (onDeleteUser) onDeleteUser();
                      }}
                      style={{
                        background: PRIMARY_RED, color: "#fff", border: "none",
                        borderRadius: 7, padding: "8px 22px", marginRight: 12, fontWeight: 600, fontSize: 15, cursor: "pointer"
                      }}
                    >Yes, Delete</button>
                    <button
                      onClick={() => setConfirming(null)}
                      style={{
                        background: PRIMARY_BLUE, color: "#fff", border: "none",
                        borderRadius: 7, padding: "8px 22px", fontWeight: 600, fontSize: 15, cursor: "pointer"
                      }}
                    >Cancel</button>
                  </div>
                </div>
              )}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

// --- Styling ---
const thStyle = {
  background: "#143E8E", color: "#fff", padding: "10px 6px", fontWeight: 700, fontSize: 15
};
const tdStyle = {
  padding: "9px 6px", fontSize: 15, textAlign: "center"
};
const actionButtonStyle = {
  background: "none", border: "none", fontSize: 17, cursor: "pointer"
};
const modalOverlayStyle = {
  position: "fixed", left: 0, top: 0, width: "100vw", height: "100vh",
  background: "rgba(0,0,0,0.10)", zIndex: 9999,
  display: "flex", alignItems: "center", justifyContent: "center"
};
const modalStyle = {
  background: "#fff", borderRadius: 12, boxShadow: "0 6px 24px rgba(20,62,142,0.10)", padding: 32, textAlign: "center", minWidth: 260
};
