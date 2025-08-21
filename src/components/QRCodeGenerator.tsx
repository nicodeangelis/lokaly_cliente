import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface QRCodeGeneratorProps {
  tokens?: string[];
}

export function QRCodeGenerator({ tokens = ['TEST_QR_001', 'TEST_QR_002', 'TEST_QR_003', 'TEST_QR_004', 'TEST_QR_005'] }: QRCodeGeneratorProps) {
  const [selectedToken, setSelectedToken] = useState(tokens[0]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Generador QR de Prueba</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {tokens.map((token) => (
            <Button
              key={token}
              variant={selectedToken === token ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedToken(token)}
            >
              {token}
            </Button>
          ))}
        </div>
        
        <div className="flex justify-center p-4 bg-white rounded-lg">
          <QRCodeSVG
            value={selectedToken}
            size={200}
            level="M"
            includeMargin={true}
          />
        </div>
        
        <div className="text-center text-sm text-muted-foreground">
          <p>Token: {selectedToken}</p>
          <p>Escanea este QR para probar el escáner</p>
        </div>
      </CardContent>
    </Card>
  );
}