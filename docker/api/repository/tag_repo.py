from pymongo.database import Database
from typing import List, Optional
import logging

logger = logging.getLogger("uvicorn.error")


class TagRepository:
    def __init__(self, database: Database):
        self.database = database
        self.tags = self.database.get_collection("tags")

    def get_all_tags(self):
        tags = list(self.tags.find(projection={"_id": False}))
        categories: List[str] = []
        subcategories: dict[str, List[str]] = {}

        for tag in tags:
            if tag["category"] is None:
                categories.append(tag["value"])
                subcategories[tag["value"]] = []
                continue

            subcategories[tag["category"]].append(tag["value"])

        return {
            "categories": categories,
            "subcategories": subcategories,
        }

    def validate_tags(self, cat: str, sub_cat: List[str]):
        category = list(
            self.tags.find(
                filter={"category": None, "value": cat},
                projection={"_id": False, "category": False},
            )
        )
        subcategories = {
            item["value"]
            for item in self.tags.find(
                filter={"category": cat},
                projection={"_id": False, "category": False},
            )
        }
        tag_valid = len(list(category)) and set(
            sub_cat).issubset(subcategories)
        return tag_valid

    def add_category(self, name: str):
        existing = self.tags.find_one({"category": None, "value": name})
        if existing:
            return {
                "success": False,
                "code": 400,
                "message": f"Category '{name}' already exists",
            }

        try:
            self.tags.insert_one({"category": None, "value": name})
            return {"success": True}
        except Exception as e:
            logger.exception("Error inserting category '%s'", name)
            return {
                "success": False,
                "code": 400,
                "message": f"Error inserting category. Exception Name: {type(e).__name__} - Message: {e}",
            }

    def add_subcategory(self, category: str, name: str):
        parent = self.tags.find_one({"category": None, "value": category})
        if not parent:
            return {
                "success": False,
                "code": 404,
                "message": f"Category '{category}' not found",
            }

        existing = self.tags.find_one({"category": category, "value": name})
        if existing:
            return {
                "success": False,
                "code": 400,
                "message": f"Subcategory '{name}' already exists in category '{category}'",
            }

        try:
            self.tags.insert_one({"category": category, "value": name})
            return {"success": True}
        except Exception as e:
            logger.exception(
                "Error inserting subcategory '%s' for category '%s'", name, category
            )
            return {
                "success": False,
                "code": 400,
                "message": f"Error inserting subcategory. Exception Name: {type(e).__name__} - Message: {e}",
            }

    def delete_subcategory(self, category: str, name: str):
        try:
            result = self.tags.delete_one(
                {"category": category, "value": name})
            if result.deleted_count == 0:
                return {
                    "success": False,
                    "code": 404,
                    "message": f"Subcategory '{name}' in category '{category}' not found",
                }
            return {"success": True}
        except Exception as e:
            logger.exception(
                "Error deleting subcategory '%s' from category '%s'", name, category
            )
            return {
                "success": False,
                "code": 400,
                "message": f"Error deleting subcategory. Exception Name: {type(e).__name__} - Message: {e}",
            }

    def delete_category(self, name: str):
        try:
            result = self.tags.delete_one({"category": None, "value": name})
            if result.deleted_count == 0:
                return {
                    "success": False,
                    "code": 404,
                    "message": f"Category '{name}' not found",
                }

            self.tags.delete_many({"category": name})
            return {"success": True}
        except Exception as e:
            logger.exception("Error deleting category '%s'", name)
            return {
                "success": False,
                "code": 400,
                "message": f"Error deleting category. Exception Name: {type(e).__name__} - Message: {e}",
            }

    def update_category_name(self, old_name: str, new_name: str):
        existing_old = self.tags.find_one(
            {"category": None, "value": old_name})
        if not existing_old:
            return {
                "success": False,
                "code": 404,
                "message": f"Category '{old_name}' not found",
            }

        existing_new = self.tags.find_one(
            {"category": None, "value": new_name})
        if existing_new:
            return {
                "success": False,
                "code": 400,
                "message": f"Category '{new_name}' already exists",
            }

        try:
            self.tags.update_one(
                {"category": None, "value": old_name},
                {"$set": {"value": new_name}},
            )
            self.tags.update_many(
                {"category": old_name},
                {"$set": {"category": new_name}},
            )
            return {"success": True}
        except Exception as e:
            logger.exception(
                "Error updating category name from '%s' to '%s'", old_name, new_name
            )
            return {
                "success": False,
                "code": 400,
                "message": f"Error updating category. Exception Name: {type(e).__name__} - Message: {e}",
            }

    def update_subcategory(
        self,
        category: str,
        old_name: str,
        new_category: Optional[str] = None,
        new_name: Optional[str] = None,
    ):
        target_category = new_category or category
        target_name = new_name or old_name

        if new_category and new_category != category:
            parent = self.tags.find_one(
                {"category": None, "value": new_category},
            )
            if not parent:
                return {
                    "success": False,
                    "code": 404,
                    "message": f"Target category '{new_category}' not found",
                }

        existing_target = self.tags.find_one(
            {"category": target_category, "value": target_name}
        )
        if existing_target and not (
            target_category == category and target_name == old_name
        ):
            return {
                "success": False,
                "code": 400,
                "message": f"Subcategory '{target_name}' already exists in category '{target_category}'",
            }

        try:
            result = self.tags.update_one(
                {"category": category, "value": old_name},
                {"$set": {"category": target_category, "value": target_name}},
            )
            if result.matched_count == 0:
                return {
                    "success": False,
                    "code": 404,
                    "message": f"Subcategory '{old_name}' in category '{category}' not found",
                }
            return {"success": True}
        except Exception as e:
            logger.exception(
                "Error updating subcategory '%s' in category '%s'", old_name, category
            )
            return {
                "success": False,
                "code": 400,
                "message": f"Error updating subcategory. Exception Name: {type(e).__name__} - Message: {e}",
            }
