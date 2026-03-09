import React from 'react';
import { useApp } from '../context/AppContext';
import GitVerseIDE from '../components/simulators/GitVerseIDE';

export default function IDEPage() {
  const { earnXP, setView } = useApp();

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200 }}>
      <GitVerseIDE
        onXP={(amount, reason) => earnXP(amount, reason)}
        onBack={() => setView('home')}
      />
    </div>
  );
}