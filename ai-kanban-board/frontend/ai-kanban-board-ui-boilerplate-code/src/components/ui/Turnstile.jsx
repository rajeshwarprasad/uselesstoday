import { useEffect, useRef } from "react";

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;

const Turnstile = ({ onVerify }) => {
  const ref = useRef(null);
  const widgetId = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    const render = () => {
      if (!window.turnstile) return false;
      widgetId.current = window.turnstile.render(ref.current, {
        sitekey: SITE_KEY,
        callback: (token) => onVerify(token),
        "expired-callback": () => onVerify(null),
        "error-callback": () => onVerify(null),
      });
      return true;
    };

    if (render()) return;

    const interval = setInterval(() => {
      if (render()) clearInterval(interval);
    }, 50);

    return () => {
      clearInterval(interval);
      if (widgetId.current && window.turnstile) {
        window.turnstile.remove(widgetId.current);
      }
    };
  }, [onVerify]);

  return (
    <div
      ref={ref}
      className="cf-turnstile"
      data-sitekey={SITE_KEY}
      data-action="turnstile-spin-v2"
    />
  );
};

export default Turnstile;
