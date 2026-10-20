import React from "react";
import { SendoraLogo, SendIcon, DownloadIcon, ActivityIcon, SunIcon, MoonIcon } from "./Icons.jsx";
import { useTheme } from "../hooks/useTheme.js";

export function Navbar({ activeMode, onSwitchMode }) {
  const { isDark, toggle } = useTheme();
  return (
    <header className="sendora-header">
      <div className="navbar-container">
        {/* Brand */}
        <div
          className="brand-container"
          onClick={() => onSwitchMode?.("send")}
          role="button"
          tabIndex={0}
        >
          <SendoraLogo size={26} />
          <span className="brand-name">
            SendEveryWhere<span className="brand-tm"></span>
          </span>
        </div>

        {/* Working Center Navigation: Mode Switcher */}
        <nav className="navbar-nav-working">
          <button
            type="button"
            className={`nav-pill-tab ${activeMode === "send" ? "active" : ""}`}
            onClick={() => onSwitchMode?.("send")}
          >
            <SendIcon size={14} />
            <span>Send</span>
          </button>
          <button
            type="button"
            className={`nav-pill-tab ${activeMode === "receive" ? "active" : ""}`}
            onClick={() => onSwitchMode?.("receive")}
          >
            <DownloadIcon size={14} />
            <span>Receive</span>
          </button>
          <button
            type="button"
            className={`nav-pill-tab ${activeMode === "activity" ? "active" : ""}`}
            onClick={() => onSwitchMode?.("activity")}
          >
            <ActivityIcon size={14} />
            <span>Activity</span>
          </button>
        </nav>

        {/* Working Right Action */}
        <div className="navbar-actions">
          <button
            type="button"
            className="theme-toggle"
            onClick={toggle}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <SunIcon size={16} /> : <MoonIcon size={16} />}
          </button>
          <button
            type="button"
            className="btn-quick-mode"
            onClick={() =>
              onSwitchMode?.(activeMode === "send" ? "receive" : "send")
            }
          >
            <span className="quick-label-full">
              {activeMode === "send" ? "Have a Code?" : "Send Files"}
            </span>
            <span className="quick-label-short" aria-hidden="true">
              {activeMode === "send" ? "Code?" : "Send"}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
