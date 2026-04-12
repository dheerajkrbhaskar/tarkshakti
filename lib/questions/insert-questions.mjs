import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL in environment.");
}

if (!supabaseAnonKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY in environment.");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});

const questionsPayload = [
  {
    topic_id: 4,
    title: [{ type: "text", value: "What is 12 + 8?" }],
    options: [
      [{ type: "text", value: "18" }],
      [{ type: "text", value: "20" }],
      [{ type: "text", value: "22" }],
      [{ type: "text", value: "24" }],
    ],
    correct_option: JSON.stringify([{ type: "text", value: "20" }]),
    explanation: [{ type: "text", value: "12 + 8 = 20." }],
  },
  {
    topic_id: 2,
    title: [{ type: "text", value: 'Choose the synonym of "brief".' }],
    options: [
      [{ type: "text", value: "Lengthy" }],
      [{ type: "text", value: "Concise" }],
      [{ type: "text", value: "Obscure" }],
      [{ type: "text", value: "Massive" }],
    ],
    correct_option: JSON.stringify([{ type: "text", value: "Concise" }]),
    explanation: [{ type: "text", value: '"Brief" means short or concise.' }],
  },
];

async function run() {
  const { data, error } = await supabase
    .from("questions")
    .insert(questionsPayload)
    .select("id, topic_id");

  if (error) {
    throw new Error(`Insert failed: ${error.message}`);
  }

  console.log("Inserted questions:", data);
}

run().catch((err) => {
  const message = err?.message || String(err);
  if (message.toLowerCase().includes("row-level security")) {
    console.error(
      "Insert blocked by RLS. With anon key, add an INSERT policy on questions (or run with service role key in a secure server-side script)."
    );
  }
  console.error(message);
  process.exit(1);
});
