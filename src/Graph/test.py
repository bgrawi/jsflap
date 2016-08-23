class Man:
    def __init__(self, string):
        self.string = string

    def reset(self, newObj):
        self = newObj
        print(self.string)

Me = Man("Hello")
You = Man("World")
print(Me.string)
Me.reset(You)
print(Me.string)