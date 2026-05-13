# import base64
# import io
# import json

# import qrcode
# from flask import Flask, jsonify, request
# from flask_cors import CORS

# app = Flask(__name__)
# CORS(app)


# @app.get("/health")
# def health():
#     return jsonify({"ok": True})


# @app.post("/generate-qr")
# def generate_qr():
#     data = request.get_json(silent=True) or {}
#     session_id = data.get("sessionId")
#     timestamp = data.get("timestamp")
#     token = data.get("token")
#     if not session_id or not timestamp or not token:
#         return jsonify({"message": "sessionId, timestamp, and token are required"}), 400

#     payload = {"sessionId": session_id, "timestamp": timestamp, "token": token}
#     text = json.dumps(payload, separators=(",", ":"))

#     qr = qrcode.QRCode(
#         version=None,
#         error_correction=qrcode.constants.ERROR_CORRECT_M,
#         box_size=4,
#         border=2,
#     )
#     qr.add_data(text)
#     qr.make(fit=True)
#     img = qr.make_image(fill_color="black", back_color="white")
#     buf = io.BytesIO()
#     img.save(buf, format="PNG")
#     b64 = base64.b64encode(buf.getvalue()).decode("ascii")
#     return jsonify({"image_base64": b64})


# if __name__ == "__main__":
#     # threaded=True handles concurrent requests from the Node API faster
#     app.run(host="127.0.0.1", port=5001, debug=False, threaded=True)

# gemini code
import base64
import io
import json
import qrcode
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.get("/health")
def health():
    return jsonify({"status": "up", "message": "QR Generator is running"})

@app.post("/generate-qr")
def generate_qr():
    try:
        # 1. Get and Validate Data
        data = request.get_json(silent=True)
        if not data:
            return jsonify({"error": "Invalid JSON or empty body"}), 400

        session_id = data.get("sessionId")
        timestamp = data.get("timestamp")
        token = data.get("token")

        if not all([session_id, timestamp, token]):
            return jsonify({
                "error": "Missing fields",
                "received": list(data.keys()),
                "required": ["sessionId", "timestamp", "token"]
            }), 400

        # 2. Create Payload
        payload = {"sessionId": session_id, "timestamp": timestamp, "token": token}
        text = json.dumps(payload, separators=(",", ":"))

        # 3. Generate QR Code
        qr = qrcode.QRCode(
            version=1, # Start with version 1
            error_correction=qrcode.constants.ERROR_CORRECT_M,
            box_size=10, # Increased for better scanability
            border=4,
        )
        qr.add_data(text)
        qr.make(fit=True)

        # 4. Convert to Base64
        img = qr.make_image(fill_color="black", back_color="white")
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        b64 = base64.b64encode(buf.getvalue()).decode("ascii")

        return jsonify({
            "success": True,
            "image_base64": f"data:image/png;base64,{b64}" # Added prefix for easy frontend use
        })

    except Exception as e:
        # This will catch Pillow issues or memory errors
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    # Use 0.0.0.0 if you need to access this from other devices on your network
    app.run(host="127.0.0.1", port=5001, debug=True)