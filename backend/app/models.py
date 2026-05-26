from datetime import datetime

from sqlalchemy import Column, Integer, String, Boolean, JSON, ForeignKey, DateTime, UniqueConstraint

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    login = Column(String, unique=True, nullable=True)
    password_hash = Column(String, nullable=True)
    balance = Column(Integer, default=0, server_default="0")

    name = Column(String)
    city = Column(String)
    districts = Column(JSON, nullable=True)
    metros = Column(JSON, nullable=True)
    gender = Column(String)
    age = Column(Integer)
    receive_scope = Column(String, default="city")
    has_access = Column(Boolean, default=False)
    inbox_unlocked = Column(Boolean, default=False, server_default="false")


class Ad(Base):
    __tablename__ = "ads"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    text = Column(String)
    city = Column(String)
    districts = Column(JSON, nullable=True)
    metros = Column(JSON, nullable=True)
    scope = Column(String, default="city")
    target_gender = Column(String)
    target_age_from = Column(String)
    target_age_to = Column(String)
    contact = Column(String)


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(String, nullable=False)
    amount = Column(Integer, nullable=False)
    description = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Favorite(Base):
    __tablename__ = "favorites"
    __table_args__ = (UniqueConstraint("user_id", "ad_id"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    ad_id = Column(Integer, ForeignKey("ads.id"), nullable=False)


class Ignored(Base):
    __tablename__ = "ignored"
    __table_args__ = (UniqueConstraint("user_id", "ad_id"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    ad_id = Column(Integer, ForeignKey("ads.id"), nullable=False)
