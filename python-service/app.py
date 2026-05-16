import base64
import io
import json
import os

import qrcode
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)

cors_origins = os.environ.get("CORS_ORIGIN", "*")
CORS(app, origins=cors_origins.split(",") if cors_origins != "*" else "*")


@app.get("/health")
def health():
    return jsonify({"ok": True, "service": "qr-generator"})


@app.post("/generate-qr")
def generate_qr():
    data = request.get_json(silent=True) or {}
    session_id = data.get("sessionId")
    timestamp = data.get("timestamp")
    token = data.get("token")

    if not session_id or not timestamp or not token:
        return jsonify({"message": "sessionId, timestamp, and token are required"}), 400

    payload = {"sessionId": session_id, "timestamp": timestamp, "token": token}
    text = json.dumps(payload, separators=(",", ":"))

    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=4,
    )
    qr.add_data(text)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    b64 = base64.b64encode(buf.getvalue()).decode("ascii")

    return jsonify({"image_base64": b64})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    debug = os.environ.get("FLASK_DEBUG", "false").lower() == "true"
    app.run(host="0.0.0.0", port=port, debug=debug)
