class TagRepository:
    def __init__(self, database):
        self.database = database
        self.tags = self.database.get_collection("tags")
      
    def get_all_tags(self):
        result = self.tags.find(projection={ "_id": False })
        return list(result)
