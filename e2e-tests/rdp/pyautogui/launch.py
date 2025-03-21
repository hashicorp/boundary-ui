import pyautogui
import os
import time
import sys

rdp_target_address = sys.argv[1]
rdp_target_user = sys.argv[2]
rdp_target_password = sys.argv[3]

script_dir = os.path.dirname(__file__)
def get_path(path):
    return os.path.join(script_dir, path)

pixelRatio = pyautogui.screenshot().size[0]/pyautogui.size().width
os.system("open /Applications/Windows\\ App.app")

try:
    pyautogui.locateOnScreen(get_path('target.png'), confidence=0.9, minSearchTime=2)
    doesTargetExist = True
except:
    doesTargetExist = False

if not doesTargetExist:
    add_button_location = pyautogui.locateCenterOnScreen(get_path('new.png'), confidence=0.9, minSearchTime=5)
    pyautogui.click(add_button_location.x/pixelRatio, add_button_location.y/pixelRatio)

    add_pc_location = pyautogui.locateCenterOnScreen(get_path('add_pc.png'), confidence=0.9)
    pyautogui.click(add_pc_location.x/pixelRatio, add_pc_location.y/pixelRatio)
    time.sleep(0.5)

    pyautogui.write(rdp_target_address, interval=0.25)
    pyautogui.press('tab')
    pyautogui.press('tab')
    pyautogui.press('tab')
    pyautogui.write("RDP Target", interval=0.25)

    add_button_location = pyautogui.locateCenterOnScreen(get_path('add_button.png'), confidence=0.9)
    pyautogui.click(add_button_location.x/pixelRatio, add_button_location.y/pixelRatio)

target = pyautogui.locateCenterOnScreen(get_path('target.png'), confidence=0.9, minSearchTime=5)
pyautogui.click(target.x/pixelRatio, target.y/pixelRatio)
pyautogui.press('enter')
time.sleep(0.5)

pyautogui.write(rdp_target_user, interval=0.25)
pyautogui.press('tab')
pyautogui.write(rdp_target_password, interval=0.25)
pyautogui.press('enter')

continueBtn = pyautogui.locateCenterOnScreen(get_path('continue.png'), confidence=0.9, minSearchTime=5)
pyautogui.click(continueBtn.x/pixelRatio, continueBtn.y/pixelRatio)

try:
    pyautogui.locateOnScreen(get_path('windows_desktop.png'), confidence=0.8, minSearchTime=10)
except:
    try:
        pyautogui.locateOnScreen(get_path('wrong_credentials.png'), confidence=0.9, minSearchTime=5)
        sys.stdout.write("Could not connect to RDP target")
    except:
        sys.stdout.write("Windows Desktop did not appear")
    sys.stdout.flush()
    sys.exit(0)

screenshot = pyautogui.screenshot()
screenshot.save(get_path('post_connection.png'))
