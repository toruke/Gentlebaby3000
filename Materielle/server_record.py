import socket
import os
import time

# --- Configuration ---
HOST = '0.0.0.0'  # Écouter sur toutes les interfaces
PORT = 5000       # Doit correspondre au fileReceiverPort du Pico W
OUTPUT_DIR = 'enregistrements_babyphone'
# ---------------------

def start_server():
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
        
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.bind((HOST, PORT))
    s.listen(1)
    print(f"[*] En attente de connexion sur {socket.gethostbyname(socket.gethostname())}:{PORT}...")

    while True:
        conn, addr = s.accept()
        print(f"[+] Connexion établie avec {addr}")
        
        # Le nom du fichier est créé lors de la connexion
        timestamp = time.strftime("%Y%m%d_%H%M%S")
        filename = os.path.join(OUTPUT_DIR, f"enregistrement_{timestamp}.wav")

        try:
            with open(filename, 'wb') as f:
                # Étape 1: Recevoir l'en-tête WAV temporaire (44 octets)
                # Le Pico W envoie ceci immédiatement après la connexion
                header_data = conn.recv(44)
                f.write(header_data)
                
                print(f"[*] Démarrage de l'écriture du fichier : {filename}")

                # Étape 2: Recevoir le corps des données audio
                data_size = 0
                while True:
                    data = conn.recv(4096) # Recevoir par blocs de 4KB
                    if not data:
                        break # Le client s'est déconnecté (Pico W a terminé)
                    
                    # Écrire les données brutes
                    f.write(data)
                    data_size += len(data)
                    
                    # Logique pour vérifier si l'en-tête final arrive (44 octets)
                    # La déconnexion est le signal le plus fiable, mais on vérifie la taille.
                    if len(data) == 44:
                         # Si le dernier paquet est de 44 octets (l'en-tête final)
                         # On écrit l'en-tête et on sort
                         break
                    
                print(f"[*] Réception des données brutes terminée. Taille brute reçue: {data_size} octets.")
                
                # Étape 3: Mettre à jour les informations de taille dans l'en-tête
                # L'en-tête final a été reçu et est à la fin du fichier.
                # On doit maintenant réécrire l'en-tête initial avec les valeurs de l'en-tête final
                
                f.seek(0)
                f.write(data[-44:]) # Réécrire l'en-tête initial avec l'en-tête final reçu
                
                print(f"[+] Fichier WAV finalisé et sauvegardé: {filename}")


        except Exception as e:
            print(f"[!] Erreur de socket ou d'écriture de fichier: {e}")
        finally:
            conn.close()
            print(f"[+] Déconnexion de {addr}")

if __name__ == '__main__':
    start_server()