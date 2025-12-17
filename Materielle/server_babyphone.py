import socket
import struct
import math
import threading
import time
from flask import Flask, request, jsonify

# --- CONFIGURATION ---
AUDIO_TCP_PORT = 5000    # Port d'écoute pour l'Émetteur (Bébé)
CONTROL_HTTP_PORT = 8080 # Port pour l'App (Bouton Create Session)
UDP_TARGET_PORT = 4200   # Port d'écoute du Récepteur (Parent)

# Seuils Audio (A ajuster selon le micro)
RMS_THRESHOLD = 500      # Niveau sonore min pour envoyer (filtre silence)

# --- VARIABLES GLOBALES ---
# Stocke la session : { "active": True, "receivers": ["192.168.1.50"] }
session_state = {
    "active": False,
    "receivers": [] 
}

app = Flask(__name__)

# --- 1. API POUR L'APPLICATION (Le Bouton) ---
@app.route('/create_session', methods=['POST'])
def create_session():
    data = request.json
    receiver_ip = data.get('receiverIp')
    
    if not receiver_ip:
        return jsonify({"error": "IP manquante"}), 400
    
    if receiver_ip not in session_state['receivers']:
        session_state['receivers'].append(receiver_ip)
    
    session_state['active'] = True
    print(f"✅ SESSION ACTIVE : Audio sera redirigé vers {session_state['receivers']}")
    return jsonify({"status": "Session started", "target": receiver_ip})

@app.route('/stop_session', methods=['POST'])
def stop_session():
    session_state['receivers'] = []
    session_state['active'] = False
    print("🛑 SESSION STOPPÉE")
    return jsonify({"status": "Session stopped"})

# --- 2. TRAITEMENT AUDIO (Le "Cerveau") ---
def calculate_rms(data_chunk):
    # Convertit bytes en array de short (16-bit)
    count = len(data_chunk) // 2
    if count == 0: return 0
    shorts = struct.unpack(f'{count}h', data_chunk)
    
    sum_squares = sum(s**2 for s in shorts)
    return math.sqrt(sum_squares / count)

def audio_server():
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.bind(('0.0.0.0', AUDIO_TCP_PORT))
    server_socket.listen(1)
    
    udp_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    
    print(f"👂 Serveur Audio en attente sur le port {AUDIO_TCP_PORT}...")

    while True:
        conn, addr = server_socket.accept()
        print(f"👶 Émetteur connecté : {addr}")
        
        try:
            while True:
                # Recevoir un buffer (taille ajustée pour packetSizeSamples du récepteur)
                # 256 samples * 2 bytes = 512 bytes
                data = conn.recv(512) 
                if not data: break
                
                # 1. Analyse du volume
                rms = calculate_rms(data)
                
                # 2. Logique de transfert
                if session_state['active'] and rms > RMS_THRESHOLD:
                    # Le bébé pleure ET la session est active
                    print(f"🔊 Bruit détecté (RMS: {int(rms)}) -> Envoi UDP")
                    
                    for ip in session_state['receivers']:
                        try:
                            udp_socket.sendto(data, (ip, UDP_TARGET_PORT))
                        except Exception as e:
                            print(f"Erreur envoi UDP vers {ip}: {e}")
                else:
                    # Silence ou pas de session -> On ignore (le "Micro" est virtuellement coupé)
                    pass

        except Exception as e:
            print(f"Erreur connexion: {e}")
        finally:
            conn.close()
            print("👶 Émetteur déconnecté")

# --- MAIN ---
if __name__ == '__main__':
    # Lancer le serveur Audio dans un thread séparé
    t = threading.Thread(target=audio_server)
    t.daemon = True
    t.start()
    
    # Lancer l'API Flask (Bloquant)
    print(f"📱 API App disponible sur le port {CONTROL_HTTP_PORT}")
    app.run(host='0.0.0.0', port=CONTROL_HTTP_PORT)