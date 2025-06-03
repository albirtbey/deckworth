import React, { useState, useRef } from 'react';
import { Camera, Upload } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

export function CardScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startScanner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsScanning(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const stopScanner = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      setIsScanning(false);
    }
  };

  const handleCapture = () => {
    // TODO: Implement card capture and AI recognition
    stopScanner();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // TODO: Implement file processing and AI recognition
    }
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Card Scanner</h3>
        
        {isScanning ? (
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full rounded-lg"
            />
            <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
              <Button onClick={handleCapture}>Capture Card</Button>
              <Button variant="outline" onClick={stopScanner}>Cancel</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Button className="w-full" onClick={startScanner}>
              <Camera className="mr-2 h-4 w-4" />
              Scan Card
            </Button>
            <div className="relative">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Image
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          </div>
        )}
        
        <p className="text-sm text-muted-foreground">
          Position the card within the frame and ensure good lighting for best results.
        </p>
      </div>
    </Card>
  );
}