"use client";
import { useEffect, useState } from "react";

const SETTINGS_KEYS = [
  { key: "site_name", label: "Site Name", placeholder: "BanglaAIHub" },
  { key: "site_tagline", label: "Tagline", placeholder: "বাংলায় AI টুলস..." },
  { key: "fb_page_url", label: "Facebook Page URL", placeholder: "https://facebook.com/..." },
  { key: "telegram_channel", label: "Telegram Channel", placeholder: "@banglaaihub" },
  { key: "default_og_image", label: "Default OG Image URL", placeholder: "https://..." },
  { key: "affiliate_disclosure_bn", label: "Affiliate Disclosure (BN)", placeholder: "এই সাইটে affiliate link আছে..." },
  { key: "posts_per_run", label: "Posts Per OpenClaw Run", placeholder: "3" },
  { key: "fb_comment_delay_sec", label: "FB Comment Delay (sec)", placeholder: "300" },
];

export default function AdminSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin?action=get_settings").then(r => r.json()).then(d => {
      const map: Record<string, string> = {};
      (d || []).forEach((s: any) => { map[s.key] = s.value; });
      setSettings(map);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "save_settings", data: settings }) });
    setMsg("✅ Settings saved!"); setSaving(false);
    setTimeout(() => setMsg(""), 3000);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">⚙️ Settings</h1>
        <div className="flex items-center gap-2">{msg && <span className="text-sm">{msg}</span>}<button onClick={handleSave} disabled={saving} className="btn-primary text-sm">{saving ? "Saving..." : "💾 Save"}</button></div>
      </div>
      <div className="space-y-3">
        {SETTINGS_KEYS.map(({ key, label, placeholder }) => (
          <div key={key} className="glass-card p-4">
            <label className="text-xs text-gray-500 block mb-1">{label}</label>
            <input value={settings[key] || ""} onChange={e => setSettings({ ...settings, [key]: e.target.value })} placeholder={placeholder}
              className="w-full px-3 py-2 rounded-lg bg-brand-navy border border-brand-border text-white text-sm focus:outline-none focus:border-brand-blue/50" />
          </div>
        ))}
      </div>
    </div>
  );
}
