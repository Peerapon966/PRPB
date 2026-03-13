from typing import List, Optional
from datetime import date
from pydantic import BaseModel, model_validator

class BlogModel(BaseModel):
    slug: str
    title: str
    category: str
    subcategories: List[str]
    thumbnail: str
    description: str
    publishDate: date

class BlogUpdateModel(BaseModel):
    slug: Optional[str] = None
    title: Optional[str] = None
    category: Optional[str] = None
    subcategories: Optional[List[str]] = None
    thumbnail: Optional[str] = None
    description: Optional[str] = None
    publishDate: Optional[date] = None

    @model_validator(mode='after')
    def validate_category_pairing(self) -> 'BlogUpdateModel':
        # both category and subcategories must be both provided or omitted together
        cat_provided = bool(self.category)
        sub_provided = bool(self.subcategories)

        if cat_provided != sub_provided:
            raise ValueError(
                "Both 'category' and 'subcategories' must be provided together, or both must be omitted."
            )
        return self
