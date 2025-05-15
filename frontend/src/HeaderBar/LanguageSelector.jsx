import React, { useState, useRef, useEffect } from "react";

export default function LanguageSelector({ lang, setLang }) {
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef();

  useEffect(() => {
    function handleClickOutside(event) {
      if (langRef.current && !langRef.current.contains(event.target)) {
        setLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div style={{ position: "relative" }} ref={langRef}>
      <div
        style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}
        onClick={() => setLangOpen((v) => !v)}
      >
        <img src={lang === "en" ?  "https://flagcdn.com/vn.svg" : "https://flagcdn.com/us.svg"} alt="Lang" style={{ width: 20, borderRadius: 2 }} />
        <span style={{ fontSize: 15, color: "#444" }}>{lang === "en" ? "Tiếng Việt" : "English"}</span>
        <span className="material-icons" style={{ fontSize: 18, color: "#888" }}>expand_more</span>
      </div>
      {langOpen && (
        <div style={{
          position: "absolute", top: 32, left: 0, background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
          borderRadius: 8, zIndex: 10, minWidth: 120
        }}>
          <div style={{ padding: "8px 16px", cursor: "pointer" }} onClick={() => { setLang("en"); setLangOpen(false); }}>English</div>
          <div style={{ padding: "8px 16px", cursor: "pointer" }} onClick={() => { setLang("vi"); setLangOpen(false); }}>Tiếng Việt</div>
        </div>
      )}
    </div>
  );
}
