from sqlalchemy import Column, Integer, String, Boolean, JSON

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String)
    city = Column(String)

    districts = Column(JSON, nullable=True)
    metros = Column(JSON, nullable=True)

    gender = Column(String)
    age = Column(Integer)

    receive_scope = Column(String, default="city")
    has_access = Column(Boolean, default=False)


class Ad(Base):
    __tablename__ = "ads"

    id = Column(Integer, primary_key=True, index=True)

    text = Column(String)
    city = Column(String)

    districts = Column(JSON, nullable=True)
    metros = Column(JSON, nullable=True)
    scope = Column(String, default="city")
    target_gender = Column(String)
    target_age_from = Column(String)
    target_age_to = Column(String)

    contact = Column(String)