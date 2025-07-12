from desktop import features

while True:
    val = input("enter 1 for volup and 0 for voldown: ")
    if val == "1":
        features.set_volume(features.Volume.VUP)
    elif val == "0":
        features.set_volume(features.Volume.VDOWN)