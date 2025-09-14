'use client';
import { useEffect, useState } from 'react';

export default function Toast({ message, type='success', onDone, duration=2500 }) {
  const [show, setShow] = useState(!!message);
  useEffect(() => {
    if (!message) return;
    setShow(true);
    const t = setTimeout(() => { setShow(false); onDone?.(); }, duration);
    return () => clearTimeout(t);
  }, [message, duration, onDone]);

  if (!show || !message) return null;
  const color = type === 'error' ? 'bg-red-600' : 'bg-emerald-600';
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className={`text-white px-4 py-2 rounded-xl shadow-xl ${color}`}>
        {message}
      </div>
    </div>
  );
}
