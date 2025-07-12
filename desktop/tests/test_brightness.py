from desktop import features

while True:
    val = input("enter 1 for up and 0 for down: ")
    if val == "1":
        features.set_brightness(features.Brightness.BUP)
    elif val == "0":
        features.set_brightness(features.Brightness.BDOWN)