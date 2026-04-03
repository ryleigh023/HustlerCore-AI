from fastapi import FastAPI

app = FastAPI()

def get_disruption():
    return {
        "rain": "moderate",
        "aqi": "poor",
        "curfew": False,
        "level": "medium"
    }

@app.get("/status")
def status():
    return get_disruption()