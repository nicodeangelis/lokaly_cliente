import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Camera, Smartphone } from 'lucide-react';

interface QRCodeDemoProps {
  token: string;
  localName: string;
  points: number;
}

export default function QRCodeDemo({ token, localName, points }: QRCodeDemoProps) {
  const qrUrl = `${window.location.origin}/visit/${token}`;

  const downloadQR = () => {
    const svg = document.getElementById(`qr-${token}`);
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `qr-${localName.toLowerCase().replace(/\s+/g, '-')}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <Card className="shadow-medium">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Camera className="w-5 h-5 text-primary" />
          Demo QR - {localName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <div className="bg-white p-4 rounded-lg shadow-soft">
            <QRCodeSVG 
              id={`qr-${token}`}
              value={qrUrl}
              size={200}
              level="M"
              includeMargin={true}
            />
          </div>
        </div>
        
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Escanea con la cámara de tu móvil
          </p>
          <div className="flex items-center justify-center gap-2 text-primary">
            <Smartphone className="w-4 h-4" />
            <span className="font-semibold">+{points} puntos</span>
          </div>
        </div>

        <div className="space-y-2">
          <Button 
            onClick={downloadQR}
            variant="outline" 
            className="w-full"
          >
            <Download className="w-4 h-4 mr-2" />
            Descargar QR
          </Button>
          
          <div className="text-xs text-muted-foreground text-center">
            Token: {token}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}