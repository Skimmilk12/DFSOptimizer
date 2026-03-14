import { useState, useCallback } from 'react';
import { parseCSV } from './engine/parser';
import { findOptimalLineup } from './engine/optimal';
import Header from './components/Header';
import StepNav from './components/StepNav';
import UploadStep from './components/UploadStep';
import ConfigureStep from './components/ConfigureStep';
import GenerateStep from './components/GenerateStep';
import SimulateStep from './components/SimulateStep';
import OptimizeStep from './components/OptimizeStep';

export default function App() {
  const [step, setStep] = useState('upload');
  const [players, setPlayers] = useState([]);
  const [entries, setEntries] = useState([]);
  const [fileName, setFileName] = useState('');
  const [optimalLineup, setOptimalLineup] = useState(null);
  const [findingOptimal, setFindingOptimal] = useState(false);

  const [settings, setSettings] = useState({
    lineupCount: 5000,
    floorPct: 94,
    noiseFactor: 0.35,
    qbWrStack: false,
    bringBack: false,
    minSalary: 49000,
    simCount: 1000,
    fieldSize: 150,
    overlapPenalty: 4,
  });

  const [lineups, setLineups] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState({ count: 0, attempts: 0 });

  const [simResults, setSimResults] = useState(null);
  const [simulating, setSimulating] = useState(false);
  const [simProgress, setSimProgress] = useState(0);

  const [portfolio, setPortfolio] = useState(null);

  const projFloor = optimalLineup
    ? (optimalLineup.projection * settings.floorPct) / 100
    : 0;

  const handleFile = useCallback((name, text) => {
    setFileName(name);
    const { entries: ent, players: pl } = parseCSV(text);
    setPlayers(pl);
    setEntries(ent);
    setFindingOptimal(true);
    setTimeout(() => {
      const opt = findOptimalLineup(pl);
      setOptimalLineup(opt);
      setFindingOptimal(false);
    }, 50);
  }, []);

  return (
    <div
      className="min-h-screen text-white font-mono"
      style={{
        background:
          'linear-gradient(135deg, #050a18 0%, #0a1628 50%, #0d0f1a 100%)',
      }}
    >
      <Header fileName={fileName} />
      <StepNav step={step} setStep={setStep} />

      <main className="max-w-7xl mx-auto px-4 py-4">
        {step === 'upload' && (
          <UploadStep
            players={players}
            entries={entries}
            fileName={fileName}
            optimalLineup={optimalLineup}
            findingOptimal={findingOptimal}
            onFile={handleFile}
            onNext={() => setStep('configure')}
          />
        )}

        {step === 'configure' && (
          <ConfigureStep
            settings={settings}
            setSettings={setSettings}
            optimalLineup={optimalLineup}
            projFloor={projFloor}
            onNext={() => setStep('generate')}
          />
        )}

        {step === 'generate' && (
          <GenerateStep
            players={players}
            settings={settings}
            optimalLineup={optimalLineup}
            projFloor={projFloor}
            lineups={lineups}
            setLineups={setLineups}
            generating={generating}
            setGenerating={setGenerating}
            genProgress={genProgress}
            setGenProgress={setGenProgress}
            onNext={() => setStep('simulate')}
          />
        )}

        {step === 'simulate' && (
          <SimulateStep
            players={players}
            lineups={lineups}
            settings={settings}
            simResults={simResults}
            setSimResults={setSimResults}
            simulating={simulating}
            setSimulating={setSimulating}
            simProgress={simProgress}
            setSimProgress={setSimProgress}
            onNext={() => setStep('optimize')}
          />
        )}

        {step === 'optimize' && (
          <OptimizeStep
            simResults={simResults}
            entries={entries}
            settings={settings}
            portfolio={portfolio}
            setPortfolio={setPortfolio}
          />
        )}
      </main>
    </div>
  );
}
