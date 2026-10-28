from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Path, Query
from sqlalchemy import or_, select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from .auth import get_current_user
from .database import get_db
from .deck_schemas import SharedDeckInput
from .models import SharedDeck, User

router = APIRouter(prefix="/api/decks", tags=["decks"])
DeckId = Annotated[str, Path(min_length=1, max_length=100, pattern=r"^d[a-zA-Z0-9_-]*$")]


def response(deck: SharedDeck, author: str, user_id: int):
    return {**deck.payload, "id": deck.id, "author": author, "builtin": False,
            "canEdit": deck.owner_id == user_id, "revision": deck.revision}


@router.get("")
def list_decks(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.execute(select(SharedDeck, User.display_name).join(User, User.id == SharedDeck.owner_id)
                      .where(SharedDeck.is_deleted.is_(False), or_(SharedDeck.owner_id == user.id, SharedDeck.is_public.is_(True)))
                      .order_by(SharedDeck.id)).all()
    return [response(deck, author, user.id) for deck, author in rows]


@router.get("/{deck_id}")
def get_deck(deck_id: DeckId, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    deck = db.get(SharedDeck, deck_id)
    if not deck or deck.is_deleted or (not deck.is_public and deck.owner_id != user.id):
        raise HTTPException(404, "Kopa nav atrasta.")
    return response(deck, db.get(User, deck.owner_id).display_name, user.id)


@router.put("/{deck_id}")
def save_deck(deck_id: DeckId, payload: SharedDeckInput, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    deck = db.get(SharedDeck, deck_id)
    values = payload.model_dump(exclude={"revision"})
    if deck:
        if deck.owner_id != user.id:
            raise HTTPException(403, "Tikai kopas īpašnieks drīkst to mainīt.")
        if deck.is_deleted:
            raise HTTPException(410, "Kopa ir dzēsta. Saglabā saturu jaunā kopā.")
        if payload.revision != deck.revision:
            # Vienāda lokāla faila atkārtota importēšana ir idempotenta.
            if payload.revision is None and values == deck.payload:
                return response(deck, user.display_name, user.id)
            raise HTTPException(409, "Kopa citā cilnē ir mainīta. Atjauno kopu sarakstu un atver redaktoru vēlreiz.")
        changed = db.execute(update(SharedDeck).where(SharedDeck.id == deck_id, SharedDeck.revision == payload.revision)
                             .values(payload=values, is_public=payload.isPublic, revision=payload.revision + 1))
        if changed.rowcount != 1:
            db.rollback()
            raise HTTPException(409, "Kopa ir mainīta. Atjauno sarakstu un mēģini vēlreiz.")
        db.commit()
        db.expire_all()
        deck = db.get(SharedDeck, deck_id)
    else:
        if payload.revision is not None:
            raise HTTPException(409, "Kopa ir dzēsta. Saglabā saturu jaunā kopā.")
        deck = SharedDeck(id=deck_id, owner_id=user.id, is_public=payload.isPublic, payload=values, revision=1)
        db.add(deck)
        try:
            db.commit()
        except IntegrityError:
            db.rollback()
            raise HTTPException(409, "Šī kopa jau ir saglabāta. Atjauno sarakstu un mēģini vēlreiz.") from None
    return response(deck, user.display_name, user.id)


@router.delete("/{deck_id}")
def delete_deck(deck_id: DeckId, revision: Annotated[int, Query(ge=1)], user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    deck = db.get(SharedDeck, deck_id)
    if not deck or deck.is_deleted:
        raise HTTPException(404, "Kopa nav atrasta.")
    if deck.owner_id != user.id:
        raise HTTPException(403, "Tikai kopas īpašnieks drīkst to dzēst.")
    # Saglabā tikai dzēstā ID marķieri, lai veca cilne neatjaunotu izdzēsto kopu.
    changed = db.execute(update(SharedDeck).where(SharedDeck.id == deck_id, SharedDeck.revision == revision)
                         .values(is_deleted=True, is_public=False, payload={}, revision=revision + 1))
    if changed.rowcount != 1:
        db.rollback()
        raise HTTPException(409, "Kopa ir mainīta. Atjauno sarakstu pirms dzēšanas.")
    db.commit()
    return {"deleted": True}
