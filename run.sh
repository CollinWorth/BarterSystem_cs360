#! /bin/bash

# Frontend - Open in a New Terminal Window #
osascript -e 'tell application "Terminal" to do script "cd ~/Code/Year3GitProjects/BarterSystem_cs360/Frontend && npm start"'

# Backend #
cd ~/Code/Year3GitProjects/BarterSystem_cs360/Backend
source ~/venv/bin/activate
uvicorn main:app --reload 


# VS Code #
code ~/Code/Year3GitProjects/BarterSystem_cs360

