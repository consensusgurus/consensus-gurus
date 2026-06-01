import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
const ADMIN_EMAIL = "consensusgurus@gmail.com";

serve(async (req) => {
  try {
    const payload = await req.json();
    const { table, record } = payload;

    let subject = "";
    let htmlContent = "";

    if (table === "user_lists") {
      subject = `New List Submission: ${record.title}`;
      htmlContent = `<p>New list submitted:</p>
            <p><strong>${record.title}</strong></p>
            <p>Category: ${record.category}</p>
            <p><a href="https://consensusgurus.com/admin">View in Admin Panel</a></p>`;
    } else if (table === "complaints") {
      subject = `New Research Request: ${record.list_title}`;
      htmlContent = `<p>New research request:</p>
            <p><strong>${record.list_title}</strong></p>
            <p>Message: ${record.message || "No message"}</p>
            <p><a href="https://consensusgurus.com/admin">View in Admin Panel</a></p>`;
    } else if (table === "extras") {
      subject = `New Vote Item Submitted: ${record.item_name}`;
      htmlContent = `<p>New user-submitted vote item:</p>
            <p><strong>${record.item_name}</strong></p>
            <p>List: ${record.list_id}</p>
            <p><a href="https://consensusgurus.com/list/${record.list_id}">View the list</a> &middot; <a href="https://consensusgurus.com/admin">View in Admin Panel</a></p>`;
    }

    if (!subject) {
      return new Response(JSON.stringify({ error: "Unknown table" }), { status: 400 });
    }

    if (!BREVO_API_KEY) {
      console.error("BREVO_API_KEY is not set. Run: supabase secrets set BREVO_API_KEY=...");
      return new Response(JSON.stringify({ error: "Email service not configured" }), { status: 500 });
    }

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: [{ email: ADMIN_EMAIL }],
        sender: { email: ADMIN_EMAIL, name: "Consensus Gurus" },
        subject,
        htmlContent,
      }),
    });

    const result = await response.json();
    console.log("Brevo response:", result);
    return new Response(JSON.stringify({ ok: true, messageId: result.messageId }), { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
