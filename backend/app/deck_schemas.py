from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator

Identifier = Annotated[str, Field(min_length=1, max_length=100, pattern=r"^[a-zA-Z0-9_-]+$")]
ShortAnswer = Annotated[str, Field(min_length=1, max_length=120)]


class SharedCardInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    id: Identifier
    question: str = Field(min_length=1, max_length=200)
    answer: ShortAnswer
    wrong: list[ShortAnswer] = Field(default_factory=list, max_length=3)
    explanation: str | None = Field(default=None, max_length=200)

    @model_validator(mode="after")
    def distinct_options(self):
        choices = [self.answer.casefold(), *(value.casefold() for value in self.wrong)]
        if len(choices) != len(set(choices)):
            raise ValueError("Atbilžu varianti nedrīkst atkārtoties.")
        return self


class SharedDeckInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    title: str = Field(min_length=3, max_length=60)
    description: str = Field(default="", max_length=200)
    category: Literal['geo', 'lang', 'sci', 'it', 'hist', 'math', 'other'] = 'other'
    language: Literal['lv', 'en'] = 'lv'
    tags: list[Annotated[str, Field(min_length=1, max_length=24)]] = Field(default_factory=list, max_length=6)
    icon: Literal['globe', 'flask', 'languages', 'code', 'landmark', 'calculator', 'orbit', 'book', 'brain', 'music', 'palette', 'leaf'] = 'book'
    hue: int = Field(default=265, ge=0, le=360)
    reversible: bool = False
    ask: str | None = Field(default=None, max_length=80)
    reverseAsk: str | None = Field(default=None, max_length=80)
    isPublic: bool = False
    cards: list[SharedCardInput] = Field(min_length=5, max_length=300)
    rankIndex: int = Field(default=0, ge=0, le=14)
    createdAt: int = Field(default=0, ge=0, le=4102444800000)
    updatedAt: int = Field(default=0, ge=0, le=4102444800000)
    revision: int | None = Field(default=None, ge=1)

    @model_validator(mode="after")
    def distinct_cards(self):
        if len({card.id for card in self.cards}) != len(self.cards):
            raise ValueError("Kartīšu identifikatoriem jābūt unikāliem.")
        if len({card.question.casefold() for card in self.cards}) != len(self.cards):
            raise ValueError("Jautājumi nedrīkst atkārtoties.")
        return self
