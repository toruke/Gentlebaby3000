// src/hooks/useDeviceDiscovery.ts (CORRIGÉ AVEC LOGS DE DEBUG UDP)

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
type UdpMessage = string | Buffer | number[];

// 3. Interface précise du Socket UDP sans 'any'
interface UdpSocket {
  bind: (port: number, address?: string, callback?: () => void) => void; // Ajout d'arguments optionnels pour 'bind'
  close: () => void;
  removeAllListeners: () => void;
  address: () => { address: string; port: number };
  
  on(event: 'message', callback: (msg: UdpMessage, rinfo: RemoteInfo) => void): void;
  on(event: 'error', callback: (err: Error) => void): void;
  on(event: 'listening', callback: () => void): void; // Pour confirmer l'écoute
}

export function useDeviceDiscovery() {
  const [isScanning, setIsScanning] = useState(false);
  const [foundDevices, setFoundDevices] = useState<DiscoveredDevice[]>([]);

  const socketRef = useRef<UdpSocket | null>(null);

  const stopScanning = useCallback(() => {
    if (socketRef.current) {
      console.log('UDP SCAN: Arrêt du scan et fermeture du socket.');
      try {
        socketRef.current.removeAllListeners();
        socketRef.current.close();
      } catch (e) {
        console.warn('UDP SCAN: Erreur à la fermeture du socket:', e);
      }
      socketRef.current = null;
    }
    setIsScanning(false);
    setFoundDevices([]);
  }, []);


  const startScanning = useCallback(() => {
    stopScanning(); // Assure qu'un seul scan est actif

    setIsScanning(true);
    setFoundDevices([]);

    try {
      // 🟢 LOG: Tentative de création
      console.log('UDP SCAN: Tentative de création du socket UDP...');
      const client = dgram.createSocket({ type: 'udp4' }) as unknown as UdpSocket;
      
      const LISTENING_PORT = 12345;

      // 🟢 LOG: Confirmation de l'écoute
      client.on('listening', () => {
        const address = client.address();
        console.log(`UDP SCAN: ✅ Socket écoute sur ${address.address}:${address.port}`);
      });
      
      client.on('message', (msg: UdpMessage, rinfo: RemoteInfo) => {
        const message = msg ? msg.toString() : '';
        
        // 🟢 LOG: Message reçu - CRITIQUE pour le debugging
        console.log(`UDP SCAN: Message reçu de ${rinfo.address}:${rinfo.port} -> ${message}`); 

        if (message.startsWith('BABYPHONE')) {
          const parts = message.split('|');
          if (parts.length === 3) {
            const type = parts[1];
            const mac = parts[2];

            setFoundDevices((prev) => {
              if (prev.some((d) => d.id === mac)) return prev;
              
              // 🟢 LOG: Détection format correct
              console.log(`UDP SCAN: Nouveau Babyphone détecté (MAC: ${mac}, Type: ${type})`); 
              
              return [...prev, { id: mac, type: type, ip: rinfo.address }];
            });
          } else {
            console.log(`UDP SCAN: ⚠️ Format BABYPHONE incorrect (parties: ${parts.length})`);
          }
        }
      });

      client.on('error', (err: Error) => {
        console.error('UDP SCAN: ❌ Erreur critique:', err);
        setIsScanning(false);
        stopScanning(); // Arrêter le scan en cas d'erreur
      });
      
      // La fonction bind lance l'écoute
      client.bind(LISTENING_PORT, '0.0.0.0', () => {
        console.log(`UDP SCAN: Socket bindé sur le port ${LISTENING_PORT}.`);
      });

      socketRef.current = client;

    } catch (err) {
      console.error('UDP SCAN: ❌ Erreur création socket:', err);
      setIsScanning(false);
    }
    
    // Ajout d'un timeout de scan pour ne pas scanner à l'infini
    const timeout = setTimeout(() => {
      if(isScanning) {
        console.log('UDP SCAN: Timeout de scan atteint.');
        stopScanning();
      }
    }, 20000); // Scan pendant 20 secondes

    return () => {
      clearTimeout(timeout);
      stopScanning();
    };

  }, [stopScanning]);
  
  useEffect(() => {
    // Si vous voulez que le scan se lance au montage du hook, vous pouvez le décommenter.
    // Mais pour l'App, on préfère le déclencher via le bouton.
    // startScanning(); 
    return () => stopScanning();
  }, [stopScanning]);

  return { startScanning: startScanning, stopScanning, foundDevices, isScanning };
}