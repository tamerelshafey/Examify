import React, { useRef, useEffect } from 'react';

interface AudioVisualizerProps {
    analyserNode: AnalyserNode | null;
    isAnimating: boolean;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ analyserNode, isAnimating }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    // Fix: Explicitly pass an initial value to useRef to satisfy strict linting rules.
    const animationFrameId = useRef<number | undefined>(undefined);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !analyserNode) return;

        const canvasCtx = canvas.getContext('2d');
        if (!canvasCtx) return;

        analyserNode.fftSize = 2048;
        const bufferLength = analyserNode.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const draw = () => {
            if (!isAnimating) {
                canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
                return;
            }

            animationFrameId.current = requestAnimationFrame(draw);
            analyserNode.getByteTimeDomainData(dataArray);

            canvasCtx.fillStyle = 'rgb(241 245 249)'; // slate-100
            if (document.documentElement.classList.contains('dark')) {
                canvasCtx.fillStyle = 'rgb(15 23 42)'; // slate-900
            }

            canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
            canvasCtx.lineWidth = 2;
            canvasCtx.strokeStyle = 'rgb(59 130 246)'; // primary-500
            
            canvasCtx.beginPath();
            
            const sliceWidth = canvas.width * 1.0 / bufferLength;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 128.0;
                const y = v * canvas.height / 2;

                if (i === 0) {
                    canvasCtx.moveTo(x, y);
                } else {
                    canvasCtx.lineTo(x, y);
                }
                x += sliceWidth;
            }
            canvasCtx.lineTo(canvas.width, canvas.height / 2);
            canvasCtx.stroke();
        };

        draw();

        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [analyserNode, isAnimating]);

    return <canvas ref={canvasRef} className="w-full h-full" />;
};

export default AudioVisualizer;