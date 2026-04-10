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
    { href: "/bookings", label: language === "ru" ? "Мои занятия" : "My Bookings" },
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
        alignItems: "center",
        flexWrap: "wrap",
        gap: "12px",
        padding: "16px 24px",
        borderBottom: "1px solid #e5e7eb",
        backgroundColor: "#ffffff",
        color: "#111827",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <Link
        href="/"
        style={{
          fontWeight: 700,
          marginRight: "12px",
          color: "#111827",
          textDecoration: "none",
        }}
      >
        Calingo
      </Link>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          alignItems: "center",
          flex: 1,
        }}
      >
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            style={{
              color: "#374151",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <Link
        href="/language"
        style={{
          marginLeft: "auto",
          color: "#111827",
          textDecoration: "none",
          fontWeight: 600,
        }}
      >
        Language
      </Link>
    </nav>
  );
}