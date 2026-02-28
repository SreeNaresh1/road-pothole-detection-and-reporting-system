try:
    import awsgi
except ImportError:
    awsgi = None
from flask import Flask, request, jsonify
import base64
from flask_cors import CORS
from ultralytics import YOLO
import cv2
import numpy as np

app = Flask(__name__)
CORS(app)

# Load the YOLO model
model = YOLO("best.pt")
class_names = model.names


@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'message': 'Flask app running successfully'
    }), 200

@app.route('/status', methods=['GET'])
def check_status():
    return jsonify({
        'message': 'Status is OK'
    }), 200


def detect_potholes(image_data):
    # Convert image data to numpy array
    np_img = np.frombuffer(image_data, np.uint8)
    
    # Decode the image
    img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)
    
    # Resize the image to match the model input size
    img_resized = cv2.resize(img, (640, 320))  # Change size based on your model's requirement

    # Run the model on the image
    results = model.predict(img_resized)

    num_potholes = 0
    annotated_img = img_resized.copy()

    for r in results:
        boxes = r.boxes  # Boxes object for bbox outputs
        masks = r.masks  # Masks object for segment masks outputs
        
        if boxes is not None and len(boxes) > 0:
            num_potholes = len(boxes)
            for box in boxes:
                # Get bounding box coordinates
                x1, y1, x2, y2 = map(int, box.xyxy[0].cpu().numpy())
                conf = float(box.conf[0].cpu().numpy())
                cls = int(box.cls[0].cpu().numpy())
                label = class_names.get(cls, 'pothole')
                
                # Draw bounding box (red)
                cv2.rectangle(annotated_img, (x1, y1), (x2, y2), (0, 0, 255), 2)
                
                # Draw label background
                label_text = f"{label} {conf:.0%}"
                (tw, th), _ = cv2.getTextSize(label_text, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
                cv2.rectangle(annotated_img, (x1, y1 - th - 8), (x1 + tw + 4, y1), (0, 0, 255), -1)
                cv2.putText(annotated_img, label_text, (x1 + 2, y1 - 4),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1, cv2.LINE_AA)
        
        elif masks is not None:
            masks_data = masks.data.cpu().numpy()
            num_potholes = len(masks_data)
            # Draw mask overlays
            for i, mask in enumerate(masks_data):
                mask_resized = cv2.resize(mask, (annotated_img.shape[1], annotated_img.shape[0]))
                colored_mask = np.zeros_like(annotated_img)
                colored_mask[:, :, 2] = (mask_resized * 255).astype(np.uint8)  # Red channel
                annotated_img = cv2.addWeighted(annotated_img, 1.0, colored_mask, 0.4, 0)
                # Find contours for outline
                mask_uint8 = (mask_resized * 255).astype(np.uint8)
                contours, _ = cv2.findContours(mask_uint8, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
                cv2.drawContours(annotated_img, contours, -1, (0, 0, 255), 2)

    # Encode annotated image to bytes
    _, annotated_buffer = cv2.imencode('.png', annotated_img)
    annotated_bytes = annotated_buffer.tobytes()

    return num_potholes, annotated_bytes

@app.route('/upload_image', methods=['POST'])
def upload_image():
    data = request.get_json()

    # Get the image data from the request
    image_data = data['image']

    # Decode the base64 image
    image_data = base64.b64decode(image_data.split(',')[1])

    # Detect potholes and get the number of potholes
    num_potholes, _ = detect_potholes(image_data)

    # Construct message based on prediction
    message = f"Number of potholes detected: {num_potholes}"

    # Return JSON response
    return jsonify({
        'message': message,
        'num_potholes': num_potholes
    }), 200


@app.route('/detect_potholes', methods=['POST'])
def detect_potholes_endpoint():
    """Accepts multipart file upload from Spring Boot backend"""
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400

    file = request.files['image']
    image_data = file.read()

    # Detect potholes and get annotated image
    num_potholes, annotated_bytes = detect_potholes(image_data)

    # Encode annotated image as base64 for JSON response
    annotated_b64 = base64.b64encode(annotated_bytes).decode('utf-8')

    return jsonify({
        'message': f'Number of potholes detected: {num_potholes}',
        'num_potholes': num_potholes,
        'annotated_image': annotated_b64
    }), 200


def lambda_handler(event, context):
    if awsgi:
        return awsgi.response(app, event, context, base64_content_types={"image/png"})
    return {"statusCode": 500, "body": "awsgi not available"}


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=4000, debug=False)
