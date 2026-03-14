import { useCallback, useRef } from 'react';

export function useFileUpload(onFile) {
  const fileRef = useRef();

  const handleFile = useCallback(
    (file) => {
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => onFile(file.name, e.target.result);
      reader.readAsText(file);
    },
    [onFile]
  );

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleFile(e.dataTransfer.files[0]);
    },
    [handleFile]
  );

  const onClick = useCallback(() => {
    fileRef.current?.click();
  }, []);

  const onChange = useCallback(
    (e) => {
      handleFile(e.target.files[0]);
    },
    [handleFile]
  );

  return { fileRef, onDragOver, onDrop, onClick, onChange };
}
