/**
 * Outbound email notifications.
 * Uses Resend when RESEND_API_KEY is configured; otherwise the notification is
 * logged server-side so nothing breaks while the credential is pending.
 */
export async function sendAdminEmail(subject: string, lines: Array<[string, unknown]>) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL ?? "travelsmartbudget@gmail.com";
  const from = process.env.NOTIFY_FROM ?? "Travel Smart Budget <onboarding@resend.dev>";

  const html = `<div dir="rtl" style="font-family:system-ui,sans-serif">
    <h2>${escapeHtml(subject)}</h2>
    <table cellpadding="6" style="border-collapse:collapse">
      ${lines
        .filter(([, v]) => v !== undefined && v !== null && v !== "")
        .map(
          ([k, v]) =>
            `<tr><td style="border:1px solid #ddd"><b>${escapeHtml(k)}</b></td><td style="border:1px solid #ddd">${escapeHtml(
              typeof v === "object" ? JSON.stringify(v) : String(v),
            )}</td></tr>`,
        )
        .join("")}
    </table>
  </div>`;

  if (!apiKey) {
    console.info(`[notify:skipped] ${subject}`, Object.fromEntries(lines));
    return { sent: false, reason: "missing_api_key" as const };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to], subject, html }),
  });

  if (!res.ok) {
    console.error(`[notify:failed ${res.status}] ${await res.text()}`);
    return { sent: false, reason: "provider_error" as const };
  }
  return { sent: true as const };
}

export async function sendCustomerEmail(to: string, subject: string, bodyHtml: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.NOTIFY_FROM ?? "Travel Smart Budget <onboarding@resend.dev>";
  if (!apiKey) {
    console.info(`[notify:skipped customer] ${subject} -> ${to}`);
    return { sent: false as const };
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      html: `<div dir="rtl" style="font-family:system-ui,sans-serif">${bodyHtml}</div>`,
    }),
  });
  if (!res.ok) console.error(`[notify:failed ${res.status}] ${await res.text()}`);
  return { sent: res.ok };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
