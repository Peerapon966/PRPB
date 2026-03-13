import logging
from pymongo.database import Database
from model import BlogModel, BlogUpdateModel
from repository import TagRepository

logger = logging.getLogger(__name__)

class BlogRepository:
    def __init__(self, database: Database, tagRepo: TagRepository):
        self.database = database
        self.blogs = self.database.get_collection("blogs")
        self.tagRepo = tagRepo

    def get_all_blogs(self):
        result = self.blogs.find(filter={}, projection={"_id": False}).sort({"publishDate": -1})
        return list(result)

    def get_blogs_by_tag(self, cat: str, sub_cat: str | None = None):
        if sub_cat is None:
            query = {"category": cat}
        else:
            query = {
                "category": cat,
                "subcategories": sub_cat
            }

        result = self.blogs.find(filter=query, projection={"_id": False})
        return list(result)

    def add_blog(self, blog: BlogModel):
        slug_duplicated = list(self.blogs.find(filter={"slug": blog.slug}, projection={"_id": False})).__len__() > 0
        if slug_duplicated: return {"success": False, "code": 400, "message": f"Blog item with slug: {blog.slug} is already exist"}
    
        tag_valid = self.tagRepo.validate_tags(cat=blog.category, sub_cat=blog.subcategories)
        if not tag_valid: return {"success": False, "code": 400, "message": f"Invalid tags; category: {blog.category}; subcategories: {blog.subcategories}"}

        blog.publishDate = blog.publishDate.strftime("%Y-%m-%d")
        try:
            self.blogs.insert_one(blog.dict())
            return {"success": True}
        except Exception as e:
            return {"success": False, "code": 400, "message": f"Error inserting blog. Exception Name: {type(e).__name__} - Message: {e}"}

    def update_blog(self, slug: str, blog: BlogUpdateModel):
        blog_exists = list(self.blogs.find(filter={"slug": slug}, projection={"_id": False})).__len__() > 0
        if not blog_exists: return {"success": False, "code": 404, "message": f"Blog item with slug: {blog.slug} not found"}

        tag_valid = self.tagRepo.validate_tags(cat=blog.category, sub_cat=blog.subcategories) if ("category" in blog and "subcategories" in blog) else True
        if not tag_valid: return {"success": False, "code": 400, "message": f"Invalid tags; category: {blog.category}; subcategories: {blog.subcategories}"}

        blog = {key: value for key, value in blog.dict().items() if value is not None}
        if "publishDate" in blog: blog["publishDate"] = blog["publishDate"].strftime("%Y-%m-%d")

        try:
            self.blogs.update_one({"slug": slug}, {"$set": blog})
            return {"success": True}
        except Exception as e:
            return {"success": False, "code": 400, "message": f"Error updating blog. Exception Name: {type(e).__name__} - Message: {e}"}

    def delete_blog(self, slug: str):
        try:
            self.blogs.delete_one({"slug": slug})
            return {"success": True}
        except Exception as e:
            return {"success": False, "code": 400, "message": f"Error deleting blog. Exception Name: {type(e).__name__} - Message: {e}"}
