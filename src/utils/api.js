const BASE = "https://qjbg4gz6ff.execute-api.us-east-1.amazonaws.com/prod";

export async function getUserCard(email) {
  const res = await fetch(`${BASE}/card?email=${encodeURIComponent(email)}`);
  return await res.json();
}

// in utils/api.js
export async function createOrUpdateUser(email, displayName, initialStamps, waiverAccepted) {
  const body = {
    email,
    display_name: displayName
  };
  if (initialStamps !== undefined) body.initial_stamps = initialStamps;
  if (waiverAccepted !== undefined) body.waiver_accepted = waiverAccepted;
  const res = await fetch(`${BASE}/card`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  return await res.json();
}


export async function addStamp(email) {
  const res = await fetch(`${BASE}/stamp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });
  return await res.json();
}

export async function fetchUsers() {
  const res = await fetch(`${BASE}/users`);
  return await res.json();
}

export async function fetchPrizes() {
  const res = await fetch(`${BASE}/prizes`);
  return await res.json();
}

export async function savePrizes(prizes) {
  const res = await fetch(`${BASE}/prizes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prizes })
  });
  return await res.json();
}

// NEW: Delete user API call
export async function deleteUser(email) {
  const res = await fetch(`${BASE}/user?email=${encodeURIComponent(email)}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" }
  });
  return await res.json();
}
export async function getPrizes() {
  const resp = await fetch(`${BASE}/prizes`);
  if (!resp.ok) throw new Error("Could not fetch prizes");
  return await resp.json();
}