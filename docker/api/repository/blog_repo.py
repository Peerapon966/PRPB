class BlogRepository:
    def __init__(self, database):
        self.database = database
        self.blogs = self.database.get_collection("blogs")
      
    def get_all_blogs(self):
        result = self.blogs.find(projection={ "_id": False })
        return list(result)
