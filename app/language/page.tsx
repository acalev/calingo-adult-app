"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSavedLanguage } from "../../lib/getLanguage";
import { translations, Language } from "../../lib/translations";

export default function LanguagePage() {
  const router = useRouter();
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    const saved = getSavedLanguage() as Language;
    setLanguage(saved);
  }, []);

  const t = translations[language];

  const chooseLanguage = (lang: Language) => {
    localStorage.setItem("interfaceLanguage", lang);
    router.push("/home");
    router.refresh();
  };

  return (
    <main style={{ padding: "40px", fontFamily: "Arial, sans-serif" }}>
      <h1>{t.language.title}</h1>
      <p>{t.language.subtitle}</p>

      <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
        <button onClick={() => chooseLanguage("en")} style={{ padding: "12px 20px" }}>
          {t.language.english}
        </button>
        <button onClick={() => chooseLanguage("ru")} style={{ padding: "12px 20px" }}>
          {t.language.russian}
        </button>
      </div>
    </main>
  );
}
