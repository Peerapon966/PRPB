from pymongo.database import Database
from typing import List
import logging

logger = logging.getLogger("uvicorn.error")

class TagRepository:
    def __init__(self, database: Database):
        self.database = database
        self.tags = self.database.get_collection("tags")
      
    def get_all_tags(self):
        tags = list(self.tags.find(projection={"_id": False}))
        categories = []
        subcategories = {}

        for tag in tags:
            if tag["category"] is None:
                categories.append(tag["value"])
                subcategories[tag["value"]] = []
                continue
            
            subcategories[tag["category"]].append(tag["value"])
            
        return {
            "categories": categories,
            "subcategories": subcategories
        }

    def validate_tags(self, cat: str, sub_cat: List[str]):
        category = list(self.tags.find(filter={"category": None, "value": cat}, projection={"_id": False, "category": False}))
        subcategories = {item["value"] for item in self.tags.find(filter={"category": cat}, projection={"_id": False, "category": False})}
        tag_valid = len(list(category)) and set(sub_cat).issubset(subcategories)
        return tag_valid