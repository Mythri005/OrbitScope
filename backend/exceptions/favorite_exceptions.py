class FavoriteAlreadyExistsException(Exception):
    def __init__(self):
        self.message = "Satellite already exists in favorites"


class FavoriteNotFoundException(Exception):
    def __init__(self):
        self.message = "Favorite satellite not found"