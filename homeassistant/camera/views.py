from django.shortcuts import render
from django.http import StreamingHttpResponse, JsonResponse
import cv2
import json

def camera_view(request):
    """Render camera page"""
    return render(request, 'camera/camera.html')

def video_feed(request):
    """Video streaming generator function"""
    def generate():
        camera = cv2.VideoCapture(0)  # Try default camera first
        
        # If no camera found, generate synthetic video feed
        if not camera.isOpened():
            import numpy as np
            import time
            
            while True:
                # Create synthetic frame with current time
                frame = np.zeros((480, 640, 3), dtype=np.uint8)
                frame[:] = (20, 20, 40)  # Dark blue background
                
                # Add timestamp
                font = cv2.FONT_HERSHEY_SIMPLEX
                timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
                cv2.putText(frame, "Camera Simulation", (50, 100), font, 1, (255, 255, 255), 2)
                cv2.putText(frame, timestamp, (50, 150), font, 0.7, (0, 255, 0), 2)
                cv2.putText(frame, "No physical camera detected", (50, 200), font, 0.6, (255, 255, 0), 1)
                
                # Add moving circle
                import math
                t = time.time()
                x = int(320 + 100 * math.cos(t))
                y = int(240 + 50 * math.sin(t * 2))
                cv2.circle(frame, (x, y), 20, (0, 255, 255), -1)
                
                # Encode frame as JPEG
                ret, buffer = cv2.imencode('.jpg', frame)
                if ret:
                    frame_bytes = buffer.tobytes()
                    yield (b'--frame\r\n'
                           b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
                
                time.sleep(0.1)  # 10 FPS
        else:
            # Real camera feed
            try:
                while True:
                    success, frame = camera.read()
                    if not success:
                        break
                    else:
                        # Encode frame as JPEG
                        ret, buffer = cv2.imencode('.jpg', frame)
                        frame = buffer.tobytes()
                        
                        # Yield frame in byte format
                        yield (b'--frame\r\n'
                               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
            finally:
                camera.release()
    
    return StreamingHttpResponse(generate(), content_type='multipart/x-mixed-replace; boundary=frame')

def camera_api(request):
    """API endpoint for camera controls"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            action = data.get('action', 'toggle')
            
            # Here you can implement camera controls like:
            # - Take snapshot
            # - Start/stop recording
            # - Change resolution
            # - Toggle flash (if available)
            
            return JsonResponse({
                'status': 'success',
                'action': action,
                'message': f'Camera {action} executed'
            })
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            })
    
    return JsonResponse({'status': 'error', 'message': 'Only POST method allowed'})
