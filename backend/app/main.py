from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import Base, SessionLocal, engine
from app.models import Ad, User

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class UserCreate(BaseModel):
    name: str
    city: str
    districts: list[str] = []
    metros: list[str] = []
    gender: str
    age: int
    has_access: bool = False
    receive_scope: str = "city"


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
    target_age_from: str
    target_age_to: str
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


@app.get("/")
def root():
    return {"message": "Backend is working"}


@app.get("/ads")
def get_ads():
    db: Session = SessionLocal()
    ads = db.query(Ad).order_by(Ad.id.desc()).all()

    result = [
        AdPublic(
            id=ad.id,
            text=ad.text,
            city=ad.city,
            districts=ad.districts or [],
            metros=ad.metros or [],
            scope=ad.scope,
            target_gender=ad.target_gender,
            target_age_from=ad.target_age_from,
            target_age_to=ad.target_age_to,
        )
        for ad in ads
    ]

    db.close()
    return result


@app.get("/ads/{ad_id}")
def get_ad(ad_id: int):
    db: Session = SessionLocal()
    ad = db.query(Ad).filter(Ad.id == ad_id).first()

    if not ad:
        db.close()
        return None

    result = AdPublic(
        id=ad.id,
        text=ad.text,
        city=ad.city,
        districts=ad.districts or [],
        metros=ad.metros or [],
        scope=ad.scope,
        target_gender=ad.target_gender,
        target_age_from=ad.target_age_from,
        target_age_to=ad.target_age_to,
    )

    db.close()
    return result


@app.post("/ads")
def create_ad(ad: AdCreate):
    db: Session = SessionLocal()

    new_ad = Ad(
        text=ad.text,
        city=ad.city,
        districts=ad.districts,
        metros=ad.metros,
        scope=ad.scope,
        target_gender=ad.target_gender,
        target_age_from=ad.target_age_from,
        target_age_to=ad.target_age_to,
        contact=ad.contact,
    )

    db.add(new_ad)
    db.commit()
    db.refresh(new_ad)

    result = {
        "message": "Рассылка создана",
        "ad": new_ad,
    }

    db.close()

    return result


@app.post("/users")
def create_user(user: UserCreate):
    db: Session = SessionLocal()

    new_user = User(
        name=user.name,
        city=user.city,
        districts=user.districts,
        metros=user.metros,
        gender=user.gender,
        age=user.age,
        has_access=user.has_access,
        receive_scope=user.receive_scope,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    db.close()

    return new_user


@app.get("/users/{user_id}")
def get_user(user_id: int):
    db: Session = SessionLocal()

    user = db.query(User).filter(User.id == user_id).first()

    db.close()

    return user

@app.get("/users/{user_id}/inbox")
def get_user_inbox(user_id: int):
    db: Session = SessionLocal()

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        db.close()
        return []

    if not user.has_access:
        db.close()
        return []

    ads = db.query(Ad).filter(
        Ad.city == user.city,
        (Ad.target_gender == user.gender) | (Ad.target_gender == "all"),
        Ad.target_age_from <= str(user.age),
        Ad.target_age_to >= str(user.age),
    ).order_by(Ad.id.desc()).all()

    filtered_ads = []

    for ad in ads:
        if user.receive_scope == "city":
            filtered_ads.append(ad)

        elif user.receive_scope == "district":
            if ad.scope == "city":
                filtered_ads.append(ad)

            elif ad.scope == "district":
                user_districts = user.districts or []
                ad_districts = ad.districts or []

                if set(user_districts) & set(ad_districts):
                    filtered_ads.append(ad)

        elif user.receive_scope == "metro":
            if ad.scope == "city":
                filtered_ads.append(ad)

            elif ad.scope == "metro":
                user_metros = user.metros or []
                ad_metros = ad.metros or []

                if set(user_metros) & set(ad_metros):
                    filtered_ads.append(ad)

    result = [
        AdPrivate(
            id=ad.id,
            text=ad.text,
            city=ad.city,
            districts=ad.districts or [],
            metros=ad.metros or [],
            scope=ad.scope,
            target_gender=ad.target_gender,
            target_age_from=ad.target_age_from,
            target_age_to=ad.target_age_to,
            contact=ad.contact,
        )
        for ad in filtered_ads
    ]

    db.close()

    return result

@app.patch("/users/{user_id}")
def update_user(user_id: int, user_update: UserUpdate):
    db: Session = SessionLocal()

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        db.close()
        return {"error": "Пользователь не найден"}

    update_data = user_update.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(user, key, value)

    db.commit()
    db.refresh(user)

    db.close()

    return user