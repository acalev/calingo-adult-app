"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSavedLanguage } from "../lib/getLanguage";
import { translations, Language } from "../lib/translations";

export default function Nav() {
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    const lang = getSavedLanguage() as Language;
    setLanguage(lang);
  }, []);

  const t = translations[language];

  const links = [
    { href: "/home", label: t.nav.home },
    { href: "/schedule", label: t.nav.schedule },
    { href: "/study", label: t.nav.study },
    { href: "/quizzes", label: t.nav.quizzes },
    { href: "/progress", label: t.nav.progress },
    { href: "/wallet", label: t.nav.wallet },
    { href: "/subscription", label: t.nav.subscription },
    { href: "/support", label: t.nav.support },
    { href: "/admin", label: t.nav.admin },
  ];

  return (
    <nav
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "12px",
        padding: "16px 24px",
        borderBottom: "1px solid #ddd",
        background: "#f8f8f8",
      }}
    >
      <Link href="/" style={{ fontWeight: "bold", marginRight: "12px" }}>
        Calingo
      </Link>

      {links.map((link) => (
        <Link key={link.href} href={link.href}>
          {link.label}
        </Link>
      ))}

      <Link href="/language" style={{ marginLeft: "auto" }}>
        Language
      </Link>
    </nav>
  );
}
