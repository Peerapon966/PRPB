import urllib
import logging
from os import getenv
from fastapi import FastAPI, APIRouter
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from repository import TagRepository, BlogRepository

logger = logging.getLogger("uvicorn.error")

app = FastAPI()
api_router = APIRouter(prefix="/api")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

username = urllib.parse.quote_plus(getenv("MONGO_INITDB_ROOT_USERNAME"))
password = urllib.parse.quote_plus(getenv("MONGO_INITDB_ROOT_PASSWORD"))
db = getenv("MONGO_INITDB_DATABASE")
uri = f"mongodb://{username}:{password}@mongodb:27017/{db}?authSource=admin"
client = MongoClient(uri)
database = client.get_database(db)

tagRepo = TagRepository(database)
blogRepo = BlogRepository(database)

@api_router.get("/tags")
def get_all_tags():
    tags = tagRepo.get_all_tags()
    categories = []
    subcategories = {}

    for tag in tags:
        if tag["category"] is None:
            categories.append(tag["value"])
            subcategories[tag["value"]] = []
            continue
        
        subcategories[tag["category"]].append(tag["value"])

    result = {
        "status": 200,
        "categories": categories,
        "subcategories": subcategories
    }

    return JSONResponse(content=jsonable_encoder(result))

@api_router.get("/blogs")
def read_root():
    blogs = blogRepo.get_all_blogs()
    result = {
        "status": 200,
        "blogs": blogs
    }

    return JSONResponse(content=jsonable_encoder(result))

app.include_router(api_router)
