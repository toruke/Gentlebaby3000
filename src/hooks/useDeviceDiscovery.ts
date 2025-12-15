import { useState, useEffect, useRef, useCallback } from 'react';
import dgram from 'react-native-udp';
import { DiscoveredDevice } from '../models/device';

// 1. On définit le type des infos distantes (IP, Port)
interface RemoteInfo {
  address: string;
  port: number;
  family: string;
  size: number;
}

// 2. On définit le type possible d'un message UDP
// Un message peut être du texte, un Buffer binaire ou un tableau d'octets
type UdpMessage = string | Buffer | number[];

// 3. Interface précise du Socket UDP sans 'any'
interface UdpSocket {
  bind: (port: number) => void;
  close: () => void;
  removeAllListeners: () => void;
  
  // Surcharge 1 : Gestion des messages (On utilise le type UdpMessage au lieu de any)
  on(event: 'message', callback: (msg: UdpMessage, rinfo: RemoteInfo) => void): void;
  
  // Surcharge 2 : Gestion des erreurs
  on(event: 'error', callback: (err: Error) => void): void;
}

export function useDeviceDiscovery() {
  const [isScanning, setIsScanning] = useState(false);
  const [foundDevices, setFoundDevices] = useState<DiscoveredDevice[]>([]);

  const socketRef = useRef<UdpSocket | null>(null);

  const stopScanning = useCallback(() => {
    setIsScanning(false);
  }, []);

  const startScanning = useCallback(() => {
    setFoundDevices([]);
    setIsScanning(true);
  }, []);

  useEffect(() => {
    if (!isScanning) {
      if (socketRef.current) {
        try {
          socketRef.current.removeAllListeners();
          socketRef.current.close();
        } catch (_) {
          // Ignorer si déjà fermé (variable '_' pour satisfaire le linter)
        }
        socketRef.current = null;
      }
      return;
    }

    let client: UdpSocket | null = null;

    try {
      // On utilise 'unknown' comme étape intermédiaire sécurisée au lieu de 'any'
      client = dgram.createSocket({ type: 'udp4' }) as unknown as UdpSocket;
      
      const LISTENING_PORT = 12345;
      client.bind(LISTENING_PORT);

      // CORRECTION : On type explicitement msg avec notre type UdpMessage
      client.on('message', (msg: UdpMessage, rinfo: RemoteInfo) => {
        // Conversion sécurisée en string
        const message = msg ? msg.toString() : '';
        
        if (message.startsWith('BABYPHONE')) {
          const parts = message.split('|');
          if (parts.length === 3) {
            const type = parts[1];
            const mac = parts[2];

            setFoundDevices((prev) => {
              if (prev.some((d) => d.id === mac)) return prev;
              return [...prev, { id: mac, type: type, ip: rinfo.address }];
            });
          }
        }
      });

      client.on('error', (err: Error) => {
        console.log('Erreur UDP:', err);
        setIsScanning(false);
      });

      socketRef.current = client;

    } catch (err) {
      console.error('Erreur création socket:', err);
      setIsScanning(false);
    }

    return () => {
      if (client) {
        try {
          client.removeAllListeners();
          client.close();
        } catch (_) {
          // Ignorer erreur fermeture
        }
      }
      if (socketRef.current === client) {
        socketRef.current = null;
      }
    };
  }, [isScanning]);

  return {
    isScanning,
    foundDevices,
    startScanning,
    stopScanning,
  };
}