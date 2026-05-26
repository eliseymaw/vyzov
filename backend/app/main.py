from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from passlib.context import CryptContext
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.auth import create_access_token, get_current_user_id
from app.database import Base, SessionLocal, engine
from app.models import Ad, Favorite, Ignored, Transaction, User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _migrate():
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS login VARCHAR"))
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR"))
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS balance INTEGER NOT NULL DEFAULT 0"))
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS inbox_unlocked BOOLEAN NOT NULL DEFAULT false"))
        conn.execute(text("ALTER TABLE ads ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id)"))
        conn.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    _migrate()
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def calculate_ad_price(scope: str, districts: list, metros: list) -> int:
    if scope == "city":
        return 300
    if scope == "district":
        return max(len(districts), 1) * 150
    if scope == "metro":
        return max(len(metros), 1) * 50
    return 300


# ── Schemas ──────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    login: str
    password: str
    name: str
    city: str
    gender: str
    age: int
    districts: list[str] = []
    metros: list[str] = []
    receive_scope: str = "city"


class LoginRequest(BaseModel):
    login: str
    password: str


class UserUpdate(BaseModel):
    name: str | None = None
    city: str | None = None
    districts: list[str] | None = None
    metros: list[str] | None = None
    gender: str | None = None
    age: int | None = None
    has_access: bool | None = None
    receive_scope: str | None = None


class AdCreate(BaseModel):
    text: str
    city: str
    districts: list[str] = []
    metros: list[str] = []
    scope: str = "city"
    target_gender: str
    target_age_from: int | str
    target_age_to: int | str
    contact: str


class AdPublic(BaseModel):
    id: int
    text: str
    city: str
    districts: list[str] | None = []
    metros: list[str] | None = []
    scope: str
    target_gender: str
    target_age_from: str
    target_age_to: str


class AdPrivate(AdPublic):
    contact: str


# ── Auth ─────────────────────────────────────────────────────────────────────

def _do_register(body: RegisterRequest, db: Session):
    existing = db.query(User).filter(User.login == body.login).first()
    if existing:
        raise HTTPException(status_code=400, detail="Логин уже занят")

    new_user = User(
        login=body.login,
        password_hash=pwd_context.hash(body.password),
        balance=0,
        inbox_unlocked=False,
        has_access=False,
        name=body.name,
        city=body.city,
        districts=body.districts,
        metros=body.metros,
        gender=body.gender,
        age=body.age,
        receive_scope=body.receive_scope,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token(new_user.id)
    return {"access_token": token, "user_id": new_user.id}


@app.post("/register")
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    return _do_register(body, db)


@app.post("/users")
def register_via_users(body: RegisterRequest, db: Session = Depends(get_db)):
    return _do_register(body, db)


@app.post("/login")
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.login == body.login).first()
    if not user or not user.password_hash:
        raise HTTPException(status_code=401, detail="Неверный логин или пароль")
    if not pwd_context.verify(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Неверный логин или пароль")

    token = create_access_token(user.id)
    return {"access_token": token, "user_id": user.id}


# ── Current user ─────────────────────────────────────────────────────────────

@app.get("/users/me")
def get_me(user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    return user


@app.patch("/users/me")
def update_me(body: UserUpdate, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(user, key, value)

    db.commit()
    db.refresh(user)
    return user


class TopUpRequest(BaseModel):
    amount: int


@app.post("/users/me/top-up")
def top_up(body: TopUpRequest, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    if body.amount <= 0:
        raise HTTPException(status_code=400, detail="Сумма должна быть положительной")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    user.balance += body.amount
    if user.balance >= 500:
        user.inbox_unlocked = True
        user.has_access = True

    db.add(Transaction(
        user_id=user_id,
        type="top_up",
        amount=body.amount,
        description=f"Пополнение баланса",
    ))
    db.commit()
    db.refresh(user)
    return {"user": user}


@app.get("/users/me/favorite-ids")
def get_favorite_ids(user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    rows = db.query(Favorite).filter(Favorite.user_id == user_id).all()
    return [r.ad_id for r in rows]


@app.get("/users/me/ignored-ids")
def get_ignored_ids(user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    rows = db.query(Ignored).filter(Ignored.user_id == user_id).all()
    return [r.ad_id for r in rows]


@app.get("/users/me/inbox")
def get_my_inbox(user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.inbox_unlocked:
        return []

    ignored_ids = {r.ad_id for r in db.query(Ignored).filter(Ignored.user_id == user_id).all()}

    ads = db.query(Ad).filter(
        Ad.city == user.city,
        (Ad.target_gender == user.gender) | (Ad.target_gender == "all"),
        Ad.target_age_from <= str(user.age),
        Ad.target_age_to >= str(user.age),
    ).order_by(Ad.id.desc()).all()

    result = []
    for ad in ads:
        if ad.id in ignored_ids:
            continue

        if user.receive_scope == "city":
            result.append(ad)
        elif user.receive_scope == "district":
            if ad.scope == "city":
                result.append(ad)
            elif ad.scope == "district" and set(user.districts or []) & set(ad.districts or []):
                result.append(ad)
        elif user.receive_scope == "metro":
            if ad.scope == "city":
                result.append(ad)
            elif ad.scope == "metro" and set(user.metros or []) & set(ad.metros or []):
                result.append(ad)

    return [
        AdPrivate(
            id=ad.id, text=ad.text, city=ad.city,
            districts=ad.districts or [], metros=ad.metros or [],
            scope=ad.scope, target_gender=ad.target_gender,
            target_age_from=ad.target_age_from, target_age_to=ad.target_age_to,
            contact=ad.contact,
        )
        for ad in result
    ]


@app.get("/users/me/ads")
def get_my_ads(user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    ads = db.query(Ad).filter(Ad.user_id == user_id).order_by(Ad.id.desc()).all()
    return [
        AdPrivate(
            id=ad.id, text=ad.text, city=ad.city,
            districts=ad.districts or [], metros=ad.metros or [],
            scope=ad.scope, target_gender=ad.target_gender,
            target_age_from=ad.target_age_from, target_age_to=ad.target_age_to,
            contact=ad.contact,
        )
        for ad in ads
    ]


@app.get("/users/me/transactions")
def get_my_transactions(user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    txs = db.query(Transaction).filter(Transaction.user_id == user_id).order_by(Transaction.id.desc()).all()
    return txs


@app.get("/users/me/favorites")
def get_my_favorites(user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    rows = db.query(Favorite).filter(Favorite.user_id == user_id).all()
    ad_ids = [r.ad_id for r in rows]
    if not ad_ids:
        return []
    ads = db.query(Ad).filter(Ad.id.in_(ad_ids)).all()
    return [
        AdPrivate(
            id=ad.id, text=ad.text, city=ad.city,
            districts=ad.districts or [], metros=ad.metros or [],
            scope=ad.scope, target_gender=ad.target_gender,
            target_age_from=ad.target_age_from, target_age_to=ad.target_age_to,
            contact=ad.contact,
        )
        for ad in ads
    ]


@app.get("/users/me/ignored")
def get_my_ignored(user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    rows = db.query(Ignored).filter(Ignored.user_id == user_id).all()
    ad_ids = [r.ad_id for r in rows]
    if not ad_ids:
        return []
    ads = db.query(Ad).filter(Ad.id.in_(ad_ids)).all()
    return [
        AdPrivate(
            id=ad.id, text=ad.text, city=ad.city,
            districts=ad.districts or [], metros=ad.metros or [],
            scope=ad.scope, target_gender=ad.target_gender,
            target_age_from=ad.target_age_from, target_age_to=ad.target_age_to,
            contact=ad.contact,
        )
        for ad in ads
    ]


# ── Ads ───────────────────────────────────────────────────────────────────────

@app.get("/ads")
def get_ads(db: Session = Depends(get_db)):
    ads = db.query(Ad).order_by(Ad.id.desc()).all()
    return [
        AdPublic(
            id=ad.id, text=ad.text, city=ad.city,
            districts=ad.districts or [], metros=ad.metros or [],
            scope=ad.scope, target_gender=ad.target_gender,
            target_age_from=ad.target_age_from, target_age_to=ad.target_age_to,
        )
        for ad in ads
    ]


@app.get("/ads/{ad_id}")
def get_ad(ad_id: int, db: Session = Depends(get_db)):
    ad = db.query(Ad).filter(Ad.id == ad_id).first()
    if not ad:
        raise HTTPException(status_code=404, detail="Рассылка не найдена")
    return AdPublic(
        id=ad.id, text=ad.text, city=ad.city,
        districts=ad.districts or [], metros=ad.metros or [],
        scope=ad.scope, target_gender=ad.target_gender,
        target_age_from=ad.target_age_from, target_age_to=ad.target_age_to,
    )


@app.post("/ads")
def create_ad(ad: AdCreate, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    price = calculate_ad_price(ad.scope, ad.districts, ad.metros)

    if user.balance < price:
        raise HTTPException(
            status_code=402,
            detail=f"Недостаточно средств. Нужно {price} ₽, на балансе {user.balance} ₽",
        )

    new_ad = Ad(
        user_id=user_id,
        text=ad.text, city=ad.city,
        districts=ad.districts, metros=ad.metros,
        scope=ad.scope, target_gender=ad.target_gender,
        target_age_from=str(ad.target_age_from), target_age_to=str(ad.target_age_to),
        contact=ad.contact,
    )
    db.add(new_ad)

    user.balance -= price
    db.add(Transaction(
        user_id=user_id,
        type="ad_spend",
        amount=price,
        description=f"Рассылка: {ad.text[:40]}",
    ))

    db.commit()
    db.refresh(new_ad)
    return {"message": "Рассылка создана", "ad_id": new_ad.id, "charged": price, "balance": user.balance}


# ── Favorites ────────────────────────────────────────────────────────────────

@app.post("/ads/{ad_id}/favorite", status_code=201)
def add_favorite(ad_id: int, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    exists = db.query(Favorite).filter(Favorite.user_id == user_id, Favorite.ad_id == ad_id).first()
    if not exists:
        db.add(Favorite(user_id=user_id, ad_id=ad_id))
        db.commit()
    return {"ok": True}


@app.delete("/ads/{ad_id}/favorite", status_code=200)
def remove_favorite(ad_id: int, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    db.query(Favorite).filter(Favorite.user_id == user_id, Favorite.ad_id == ad_id).delete()
    db.commit()
    return {"ok": True}


# ── Ignored ───────────────────────────────────────────────────────────────────

@app.post("/ads/{ad_id}/ignore", status_code=201)
def add_ignore(ad_id: int, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    exists = db.query(Ignored).filter(Ignored.user_id == user_id, Ignored.ad_id == ad_id).first()
    if not exists:
        db.add(Ignored(user_id=user_id, ad_id=ad_id))
        db.commit()
    return {"ok": True}


@app.delete("/ads/{ad_id}/ignore", status_code=200)
def remove_ignore(ad_id: int, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    db.query(Ignored).filter(Ignored.user_id == user_id, Ignored.ad_id == ad_id).delete()
    db.commit()
    return {"ok": True}


# ── Legacy ────────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"message": "Backend is working"}


@app.get("/users/{user_id}")
def get_user(user_id: int, db: Session = Depends(get_db)):
    return db.query(User).filter(User.id == user_id).first()


@app.patch("/users/{user_id}")
def update_user_legacy(user_id: int, body: UserUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return user
