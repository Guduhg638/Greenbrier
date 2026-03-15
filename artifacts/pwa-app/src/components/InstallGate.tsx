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

export default function InstallGate({ children }: InstallGateProps) {
  const [installed, setInstalled] = useState(false);
  const [platform, setPlatform] = useState<Platform>("unknown");
  const [step, setStep] = useState<"ios-share" | "ios-add" | "android" | "desktop" | null>(null);

  useEffect(() => {
    const p = detectPlatform();
    setPlatform(p);

    if (isStandalone()) {
      setInstalled(true);
    } else {
      if (p === "ios") setStep("ios-share");
      else if (p === "android") setStep("android");
      else setStep("desktop");
    }
  }, []);

  if (installed) {
    return <>{children}</>;
  }

  return (
    <div className="install-gate">
      <div className="install-gate__backdrop" />

      <div className="install-gate__content">
        <div className="install-gate__app-icon">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="64" height="64" rx="14" fill="#000" />
            <path d="M32 14L38 26H26L32 14Z" fill="white" />
            <rect x="20" y="28" width="24" height="4" rx="2" fill="white" />
            <rect x="20" y="36" width="24" height="4" rx="2" fill="white" />
            <rect x="20" y="44" width="16" height="4" rx="2" fill="white" />
          </svg>
        </div>

        <h1 className="install-gate__title">Add to Home Screen</h1>
        <p className="install-gate__subtitle">
          Install this app on your device for the best experience.
        </p>

        {step === "ios-share" && (
          <div className="install-gate__steps">
            <div className="install-gate__step">
              <div className="install-gate__step-number">1</div>
              <div className="install-gate__step-text">
                <p>Tap the <strong>Share</strong> icon</p>
                <div className="install-gate__icon-demo">
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="28" height="28" rx="6" fill="#f0f0f0" />
                    <path d="M14 5v11M10 9l4-4 4 4" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 13H7a1 1 0 00-1 1v7a1 1 0 001 1h14a1 1 0 001-1v-7a1 1 0 00-1-1h-2" stroke="#007AFF" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <p className="install-gate__step-hint">at the bottom of your browser</p>
              </div>
            </div>

            <div className="install-gate__arrow">↓</div>

            <div className="install-gate__step">
              <div className="install-gate__step-number">2</div>
              <div className="install-gate__step-text">
                <p>Tap <strong>"Add to Home Screen"</strong></p>
                <div className="install-gate__icon-demo install-gate__icon-demo--row">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <rect width="20" height="20" rx="4" fill="#f0f0f0"/>
                    <path d="M10 4v12M4 10h12" stroke="#007AFF" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span>Add to Home Screen</span>
                </div>
              </div>
            </div>

            <div className="install-gate__arrow">↓</div>

            <div className="install-gate__step install-gate__step--hint">
              <p>Can't find it?</p>
              <p>Scroll down the share menu or look after tapping the <strong>···</strong> icon</p>
            </div>
          </div>
        )}

        {step === "android" && (
          <div className="install-gate__steps">
            <div className="install-gate__step">
              <div className="install-gate__step-number">1</div>
              <div className="install-gate__step-text">
                <p>Tap the <strong>menu icon</strong></p>
                <div className="install-gate__icon-demo">
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <rect width="28" height="28" rx="6" fill="#f0f0f0"/>
                    <circle cx="14" cy="8" r="1.5" fill="#333"/>
                    <circle cx="14" cy="14" r="1.5" fill="#333"/>
                    <circle cx="14" cy="20" r="1.5" fill="#333"/>
                  </svg>
                </div>
                <p className="install-gate__step-hint">in the top-right of your browser</p>
              </div>
            </div>

            <div className="install-gate__arrow">↓</div>

            <div className="install-gate__step">
              <div className="install-gate__step-number">2</div>
              <div className="install-gate__step-text">
                <p>Select <strong>"Add to Home Screen"</strong></p>
                <p className="install-gate__step-hint">or "Install app"</p>
              </div>
            </div>
          </div>
        )}

        {step === "desktop" && (
          <div className="install-gate__steps">
            <div className="install-gate__step install-gate__step--hint">
              <p>This app is designed for mobile devices.</p>
              <p>Please open it on your phone and add it to your home screen for the full experience.</p>
            </div>
            <button
              className="install-gate__continue-btn"
              onClick={() => setInstalled(true)}
            >
              Continue anyway
            </button>
          </div>
        )}
      </div>

      {step === "ios-share" && (
        <div className="install-gate__arrow-bottom">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M16 4L16 24M8 16l8 8 8-8" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}
    </div>
  );
}
