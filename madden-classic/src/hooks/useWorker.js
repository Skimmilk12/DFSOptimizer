import { useRef, useCallback } from 'react';

export function useWorker(workerFactory) {
  const workerRef = useRef(null);

  const start = useCallback(
    (data, onProgress, onDone) => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
      const worker = workerFactory();
      workerRef.current = worker;
      worker.onmessage = (e) => {
        if (e.data.type === 'progress') onProgress(e.data);
        if (e.data.type === 'done') {
          onDone(e.data);
          worker.terminate();
          workerRef.current = null;
        }
      };
      worker.postMessage(data);
    },
    [workerFactory]
  );

  const cancel = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
  }, []);

  return { start, cancel };
}
