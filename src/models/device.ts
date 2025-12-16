import { Timestamp, FieldValue } from 'firebase/firestore';

// Structure stockée dans Firestore
export type Device = {
  serialNumber: string; // Adresse MAC
  type: 'EMITTER' | 'RECEIVER';
  status: 'online' | 'offline' | 'pairing';
  pairedAt: Timestamp | FieldValue;
  lastSeen: Timestamp | FieldValue;
};

// Structure utilisée localement par le scanner UDP
export type DiscoveredDevice = {
  id: string;   // MAC Address
  type: string; // EMITTER ou RECEIVER
  ip: string;
};