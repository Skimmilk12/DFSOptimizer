const STEPS = [
  { id: 'upload', label: 'Upload', icon: '📂' },
  { id: 'configure', label: 'Configure', icon: '⚙️' },
  { id: 'generate', label: 'Generate', icon: '🔨' },
  { id: 'simulate', label: 'Simulate', icon: '🎲' },
  { id: 'optimize', label: 'Optimize', icon: '🏆' },
];

export { STEPS };

export default function StepNav({ step, setStep }) {
  const stepIdx = STEPS.findIndex((s) => s.id === step);

  return (
    <nav className="max-w-7xl mx-auto px-4 pt-4 pb-2">
      <div className="flex gap-1">
        {STEPS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setStep(s.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              step === s.id
                ? 'tab-active text-cyan-300'
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
            }`}
            style={{
              border: step === s.id ? undefined : '1px solid transparent',
            }}
          >
            <span className="text-base">{s.icon}</span>
            <span className="font-display">{s.label}</span>
            {i < stepIdx && (
              <span className="text-emerald-400 text-xs">✓</span>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
