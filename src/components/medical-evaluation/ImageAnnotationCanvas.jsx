import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Line, Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';
import { Button } from '@/components/ui/button';
import { Upload, Eraser, Undo, Redo, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDropzone } from 'react-dropzone';

const ImageAnnotationCanvas = ({ imageState, onImageStateChange }) => {
  const [lines, setLines] = useState(imageState.lines || []);
  const [history, setHistory] = useState([imageState.lines || []]);
  const [historyStep, setHistoryStep] = useState(0);
  const [imageSrc, setImageSrc] = useState(imageState.imageSrc || null);
  const [konvaImage] = useImage(imageSrc, 'Anonymous');
  const isDrawing = useRef(false);
  const stageRef = useRef(null);

  useEffect(() => {
    onImageStateChange({ ...imageState, lines, imageSrc });
  }, [lines, imageSrc]);

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const fileUrl = URL.createObjectURL(acceptedFiles[0]);
      setImageSrc(fileUrl);
      setLines([]);
      setHistory([[]]);
      setHistoryStep(0);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.jpg'] },
    multiple: false,
  });

  const handleMouseDown = (e) => {
    if (!konvaImage) return;
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    setLines([...lines, { tool: 'pen', points: [pos.x, pos.y] }]);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing.current || !konvaImage) return;
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    let lastLine = lines[lines.length - 1];
    lastLine.points = lastLine.points.concat([point.x, point.y]);
    lines.splice(lines.length - 1, 1, lastLine);
    setLines(lines.concat());
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(lines);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyStep > 0) {
      const newStep = historyStep - 1;
      setHistoryStep(newStep);
      setLines(history[newStep]);
    }
  };

  const handleRedo = () => {
    if (historyStep < history.length - 1) {
      const newStep = historyStep + 1;
      setHistoryStep(newStep);
      setLines(history[newStep]);
    }
  };

  const handleClear = () => {
    setLines([]);
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push([]);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const handleDescriptionChange = (e) => {
    onImageStateChange({ ...imageState, description: e.target.value });
  };

  return (
    <div className="p-4 border border-dashed border-violet-500 rounded-lg bg-black/20 space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div
          {...getRootProps()}
          className={`relative w-full sm:w-1/2 aspect-square border-2 border-dashed rounded-lg flex items-center justify-center text-center p-4 cursor-pointer transition-colors
          ${isDragActive ? 'border-green-500 bg-green-900/20' : 'border-violet-400/50 hover:border-violet-400'}`}
        >
          <input {...getInputProps()} />
          {konvaImage ? (
            <Stage
              width={300}
              height={300}
              onMouseDown={handleMouseDown}
              onMousemove={handleMouseMove}
              onMouseup={handleMouseUp}
              ref={stageRef}
            >
              <Layer>
                <KonvaImage image={konvaImage} width={300} height={300} />
                {lines.map((line, i) => (
                  <Line
                    key={i}
                    points={line.points}
                    stroke="#ef4444"
                    strokeWidth={3}
                    tension={0.5}
                    lineCap="round"
                    globalCompositeOperation={
                      line.tool === 'eraser' ? 'destination-out' : 'source-over'
                    }
                  />
                ))}
              </Layer>
            </Stage>
          ) : (
            <div className="flex flex-col items-center gap-2 text-violet-300">
              <Upload className="w-8 h-8" />
              <p>Arraste uma imagem ou clique para selecionar</p>
            </div>
          )}
        </div>
        <div className="w-full sm:w-1/2 space-y-4">
          <div>
            <Label htmlFor={`description-${imageState.id}`}>Descrição da Imagem</Label>
            <Input
              id={`description-${imageState.id}`}
              placeholder="Ex: Vista frontal do nariz"
              value={imageState.description}
              onChange={handleDescriptionChange}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={handleUndo} disabled={historyStep === 0}><Undo className="w-4 h-4 mr-2" /> Desfazer</Button>
            <Button variant="outline" onClick={handleRedo} disabled={historyStep === history.length - 1}><Redo className="w-4 h-4 mr-2" /> Refazer</Button>
            <Button variant="outline" onClick={handleClear}><Eraser className="w-4 h-4 mr-2" /> Limpar Desenho</Button>
            <Button variant="destructive" onClick={() => onImageStateChange(null)}><Trash2 className="w-4 h-4 mr-2" /> Remover Imagem</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageAnnotationCanvas;