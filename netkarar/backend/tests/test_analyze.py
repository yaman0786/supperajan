from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_ok():
    response = client.get("/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert "version" in body


def test_analyze_safe_text_returns_green():
    response = client.post("/analyze", json={"text": "Arkadaşımla hafta sonu kitap okumayı planlıyorum."})
    assert response.status_code == 200
    data = response.json()
    assert data["decision"] == "YAP"
    assert data["decision_color"] == "green"
    assert data["risk"] <= 30
    assert isinstance(data["reasons"], list)


def test_analyze_scam_returns_red():
    text = (
        "Merhaba, hemen IBAN'a para gönder, OTP kodunu bana SMS ile ilet. "
        "Son gün, kaçırma, garantili getiri var."
    )
    response = client.post("/analyze", json={"text": text})
    assert response.status_code == 200
    data = response.json()
    assert data["decision"] == "YAPMA"
    assert data["decision_color"] == "red"
    assert data["risk"] >= 65
    assert any("OTP" in r or "IBAN" in r for r in data["reasons"])


def test_analyze_medium_urgency_returns_yellow():
    response = client.post(
        "/analyze",
        json={
            "text": (
                "Acilen karar vermen gerek, son gün! Sadece bugün geçerli özel teklif, "
                "şimdi karar ver."
            )
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["decision"] == "DİKKATLİ OL"
    assert data["decision_color"] == "yellow"
    assert 30 <= data["risk"] < 65


def test_analyze_rejects_blank_text():
    response = client.post("/analyze", json={"text": "   "})
    assert response.status_code == 422


def test_analyze_rejects_empty_text():
    response = client.post("/analyze", json={"text": ""})
    assert response.status_code == 422
