import urllib
import logging
from os import getenv
from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from repository import TagRepository, BlogRepository
from model import BlogModel, BlogUpdateModel

logging.basicConfig(level=logging.DEBUG)
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
blogRepo = BlogRepository(database, tagRepo)

@api_router.get("/tags", status_code=200)
def get_all_tags():
    return tagRepo.get_all_tags()

@api_router.get("/blogs", status_code=200)
def get_blogs(cat: str | None = None, sub_cat: str | None = None):
    blogs = blogRepo.get_all_blogs() if cat is None else blogRepo.get_blogs_by_tag(cat, sub_cat)
    return {"blogs": blogs}

@api_router.post("/blogs", status_code=204)
def add_blog(blog: BlogModel):
    result = blogRepo.add_blog(blog)
    if not result["success"]: raise HTTPException(status_code=result["code"] or 500, detail=result["message"])

@api_router.patch("/blogs/{slug}", status_code=204)
def update_blog(slug: str, blog: BlogUpdateModel):
    result = blogRepo.update_blog(slug.strip(), blog)
    if not result["success"]: raise HTTPException(status_code=result["code"] or 500, detail=result["message"])

@api_router.delete("/blogs/{slug}", status_code=204)
def delete_blog(slug: str):
    result = blogRepo.delete_blog(slug.strip())
    if not result["success"]: raise HTTPException(status_code=result["code"] or 500, detail=result["message"])

app.include_router(api_router)
