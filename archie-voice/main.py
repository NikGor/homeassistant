import os
import struct
import pvporcupine
import pyaudio
from dotenv import load_dotenv

load_dotenv()



class WakeWordDetector:
    def __init__(self, access_key: str, keyword_path: str = None):
        """
        Initialize wake word detector with Picovoice Porcupine.
        
        Args:
            access_key: Picovoice access key (get from console.picovoice.ai)
            keyword_path: Path to custom keyword file (.ppn)
        """
        self.access_key = access_key
        self.keyword_path = keyword_path
        
        # Audio configuration
        self.sample_rate = 16000
        self.frame_length = 512
        
        # Initialize Porcupine
        keywords = ['hey google'] if keyword_path is None else None
        keyword_paths = [keyword_path] if keyword_path else None
        
        self.porcupine = pvporcupine.create(
            access_key=access_key,
            keywords=keywords,
            keyword_paths=keyword_paths
        )
        
        # PyAudio setup
        self.pa = pyaudio.PyAudio()
        self.audio_stream = None
        self.is_listening = False
        
    def start_listening(self):
        """Start listening for wake word."""
        print("Начинаю слушать кодовую фразу...")
        print("Говорите 'эй Арчи' для активации")
        print("Нажмите Ctrl+C для остановки")
        try:
            self.audio_stream = self.pa.open(
                rate=self.porcupine.sample_rate,
                channels=1,
                format=pyaudio.paInt16,
                input=True,
                frames_per_buffer=self.porcupine.frame_length
            )
            
            self.is_listening = True
            
            while self.is_listening:
                pcm = self.audio_stream.read(self.porcupine.frame_length)
                pcm = struct.unpack_from("h" * self.porcupine.frame_length, pcm)
                keyword_index = self.porcupine.process(pcm)
                if keyword_index >= 0:
                    print(f"\n🎯 Обнаружена кодовая фраза! (индекс: {keyword_index})")
                    print("Система активирована!")
                    # Здесь можно добавить логику для выполнения действий после активации
                    
        except KeyboardInterrupt:
            print("\nОстанавливаю детектор...")
        except Exception as e:
            print(f"Ошибка: {e}")
        finally:
            self.stop_listening()
    
    def stop_listening(self):
        """Stop listening and cleanup resources."""
        self.is_listening = False
        
        if self.audio_stream:
            self.audio_stream.close()
            
        if self.pa:
            self.pa.terminate()
            
        if self.porcupine:
            self.porcupine.delete()


def main():
    access_key = os.getenv("PICOVOICE_ACCESS_KEY")
    keyword_path = "hey-archie_en_linux_v3_0_0.ppn"  
    detector = WakeWordDetector(access_key, keyword_path)
    detector.start_listening()


if __name__ == "__main__":
    main()
