from typing import List, Literal
from pydantic import BaseModel, Field, field_validator

Decision = Literal["YAP", "YAPMA", "DİKKATLİ OL"]
Color = Literal["green", "yellow", "red"]


class AnalyzeRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000)

    @field_validator("text")
    @classmethod
    def not_blank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("text must not be blank")
        return value


class AnalyzeResponse(BaseModel):
    decision: Decision
    decision_color: Color
    risk: int = Field(..., ge=0, le=100)
    confidence: int = Field(..., ge=0, le=100)
    category: str
    summary: str
    reasons: List[str]
    suggestions: List[str]


class HealthResponse(BaseModel):
    status: Literal["ok"]
    version: str
