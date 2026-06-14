# Test App

This is a small Flask app for testing API Studio capture, replay, mock, throttle, beacon, and cookie workflows.

## Run locally

```bash
cd test
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

Open `http://localhost:5000`.

## Run with Docker

```bash
cd test
docker build -t api-studio-test-app .
docker run --rm -p 5000:5000 api-studio-test-app
```
