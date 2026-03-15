import { useState, useEffect } from "react";

type Platform = "ios" | "android" | "desktop" | "unknown";

function detectPlatform(): Platform {
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  if (/android/.test(ua)) return "android";
  if (/windows|macintosh|linux/.test(ua)) return "desktop";
  return "unknown";
}

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

interface InstallGateProps {
  children: React.ReactNode;
}

function ShareIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M11 2v12M7 6l4-4 4 4" stroke="#007AFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7 10H5a1 1 0 00-1 1v7a1 1 0 001 1h12a1 1 0 001-1v-7a1 1 0 00-1-1h-2" stroke="#007AFF" strokeWidth="2.2" strokeLinecap="round"/>
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="5" r="1.5" fill="#555"/>
      <circle cx="11" cy="11" r="1.5" fill="#555"/>
      <circle cx="11" cy="17" r="1.5" fill="#555"/>
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M9 3v12M3 9h12" stroke="#007AFF" strokeWidth="2.2" strokeLinecap="round"/>
    </svg>
  );
}

function AppIcon() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <defs>
        <linearGradient id="iconGrad" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1e1b4b"/>
          <stop offset="100%" stopColor="#312e81"/>
        </linearGradient>
      </defs>
      <rect width="80" height="80" rx="18" fill="url(#iconGrad)"/>
      <path d="M40 16L47 30H33L40 16Z" fill="white" opacity="0.95"/>
      <rect x="24" y="34" width="32" height="5" rx="2.5" fill="white" opacity="0.85"/>
      <rect x="24" y="44" width="32" height="5" rx="2.5" fill="white" opacity="0.7"/>
      <rect x="24" y="54" width="20" height="5" rx="2.5" fill="white" opacity="0.5"/>
    </svg>
  );
}

export default function InstallGate({ children }: InstallGateProps) {
  const [installed, setInstalled] = useState(false);
  const [step, setStep] = useState<"ios" | "android" | "desktop" | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const p = detectPlatform();
    if (isStandalone()) {
      setInstalled(true);
    } else {
      if (p === "ios") setStep("ios");
      else if (p === "android") setStep("android");
      else setStep("desktop");
      setTimeout(() => setVisible(true), 30);
    }
  }, []);

  if (installed) return <>{children}</>;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "linear-gradient(160deg, #0f0c29 0%, #1a1a3e 40%, #0d1b3e 100%)",
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "flex-end", padding: "0 0 env(safe-area-inset-bottom, 0)",
        overflowY: "auto",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.3s ease",
      }}
    >
      {/* Background glows */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: "-10%", left: "50%", transform: "translateX(-50%)",
          width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)",
        }} />
        <div style={{
          position: "absolute", bottom: "30%", left: "-10%",
          width: 320, height: 320, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)",
        }} />
      </div>

      {/* App branding at top */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", padding: "48px 24px 24px",
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: "transform 0.5s cubic-bezier(0.16,1,0.3,1)",
      }}>
        <div style={{ marginBottom: 20, filter: "drop-shadow(0 8px 24px rgba(99,102,241,0.4))" }}>
          <AppIcon />
        </div>
        <h1 style={{
          fontSize: 26, fontWeight: 800, color: "#fff", margin: "0 0 10px",
          textAlign: "center", letterSpacing: "-0.5px", fontFamily: "Inter, sans-serif",
        }}>
          FlagIt
        </h1>
        <p style={{
          fontSize: 15, color: "rgba(255,255,255,0.55)", margin: 0,
          textAlign: "center", maxWidth: 220, lineHeight: 1.5,
          fontFamily: "Inter, sans-serif",
        }}>
          Add to your home screen for the best experience
        </p>
      </div>

      {/* Bottom sheet */}
      <div style={{
        width: "100%", maxWidth: 480, margin: "0 auto",
        background: "rgba(255,255,255,0.97)",
        borderRadius: "28px 28px 0 0",
        padding: "28px 24px 40px",
        boxShadow: "0 -8px 48px rgba(0,0,0,0.4)",
        transform: visible ? "translateY(0)" : "translateY(60px)",
        transition: "transform 0.5s cubic-bezier(0.16,1,0.3,1) 0.1s",
      }}>
        {/* Handle bar */}
        <div style={{
          width: 36, height: 4, background: "#e0e0e0", borderRadius: 99,
          margin: "0 auto 24px",
        }} />

        {step === "ios" && (
          <>
            <p style={{
              fontSize: 13, fontWeight: 700, color: "#999", textTransform: "uppercase",
              letterSpacing: "0.08em", margin: "0 0 16px", fontFamily: "Inter, sans-serif",
            }}>
              How to install
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Step number={1} icon={<ShareIcon />} iconBg="#EBF4FF">
                Tap the <b>Share</b> button{" "}
                <span style={{ color: "#999", fontWeight: 400 }}>at the bottom of Safari</span>
              </Step>

              <Divider />

              <Step number={2} icon={<PlusIcon />} iconBg="#EBF4FF">
                Select <b>"Add to Home Screen"</b>
                <span style={{ display: "block", fontSize: 12, color: "#aaa", marginTop: 2, fontWeight: 400 }}>
                  Scroll down in the share sheet if needed
                </span>
              </Step>

              <Divider />

              <Step number={3} icon={<span style={{ fontSize: 16 }}>✓</span>} iconBg="#EDFAF3">
                Tap <b>Add</b> to confirm
              </Step>
            </div>

            <div style={{
              marginTop: 20, padding: "12px 14px", background: "#f7f7f8", borderRadius: 12,
              fontSize: 12, color: "#aaa", lineHeight: 1.5, fontFamily: "Inter, sans-serif",
            }}>
              Can't see "Add to Home Screen"? Tap the <b style={{ color: "#555" }}>···</b> more options button in the share menu.
            </div>
          </>
        )}

        {step === "android" && (
          <>
            <p style={{
              fontSize: 13, fontWeight: 700, color: "#999", textTransform: "uppercase",
              letterSpacing: "0.08em", margin: "0 0 16px", fontFamily: "Inter, sans-serif",
            }}>
              How to install
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Step number={1} icon={<MenuIcon />} iconBg="#F5F5F5">
                Tap the <b>⋮ menu</b>{" "}
                <span style={{ color: "#999", fontWeight: 400 }}>in the top-right of Chrome</span>
              </Step>

              <Divider />

              <Step number={2} icon={<PlusIcon />} iconBg="#EBF4FF">
                Tap <b>"Add to Home screen"</b>
                <span style={{ display: "block", fontSize: 12, color: "#aaa", marginTop: 2, fontWeight: 400 }}>
                  Also shown as "Install app"
                </span>
              </Step>

              <Divider />

              <Step number={3} icon={<span style={{ fontSize: 16 }}>✓</span>} iconBg="#EDFAF3">
                Tap <b>Add</b> to confirm
              </Step>
            </div>
          </>
        )}

        {step === "desktop" && (
          <>
            <div style={{ textAlign: "center", padding: "8px 0 20px" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📱</div>
              <p style={{
                fontSize: 17, fontWeight: 700, color: "#111", margin: "0 0 8px",
                fontFamily: "Inter, sans-serif",
              }}>
                Best on mobile
              </p>
              <p style={{
                fontSize: 14, color: "#888", lineHeight: 1.6, margin: 0,
                fontFamily: "Inter, sans-serif",
              }}>
                Open this page on your phone and add it to your home screen for the full experience.
              </p>
            </div>
            <button
              onClick={() => setInstalled(true)}
              style={{
                width: "100%", padding: "15px", background: "#0f172a", color: "#fff",
                border: "none", borderRadius: 14, fontSize: 16, fontWeight: 700,
                cursor: "pointer", fontFamily: "Inter, sans-serif",
                boxShadow: "0 4px 16px rgba(15,23,42,0.2)",
              }}
            >
              Continue on desktop
            </button>
          </>
        )}
      </div>

      {/* iOS bottom arrow hint */}
      {step === "ios" && (
        <div style={{
          position: "fixed", bottom: 12, left: "50%", transform: "translateX(-50%)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
          animation: "ig-bounce 2s ease-in-out infinite",
          zIndex: 10000,
        }}>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "Inter, sans-serif" }}>
            Share is down here
          </span>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 3v12M4 10l6 6 6-6" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}

      <style>{`
        @keyframes ig-bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(5px); }
        }
      `}</style>
    </div>
  );
}

function Step({ number, icon, iconBg, children }: {
  number: number;
  icon: React.ReactNode;
  iconBg: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 14,
      padding: "14px 16px", background: "#fafafa", borderRadius: 16,
      border: "1px solid rgba(0,0,0,0.05)",
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10, background: iconBg,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, paddingTop: 2 }}>
        <span style={{
          display: "inline-block", fontSize: 10, fontWeight: 800, color: "#bbb",
          textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3,
          fontFamily: "Inter, sans-serif",
        }}>
          Step {number}
        </span>
        <div style={{ fontSize: 14, color: "#222", lineHeight: 1.4, fontFamily: "Inter, sans-serif" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function Divider() {
  return (
    <div style={{
      display: "flex", justifyContent: "center", alignItems: "center",
      height: 10, paddingLeft: 32,
    }}>
      <div style={{ width: 1.5, height: 10, background: "#e8e8e8", borderRadius: 99 }} />
    </div>
  );
}
