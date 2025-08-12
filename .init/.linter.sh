#!/bin/bash
cd /home/kavia/workspace/code-generation/digital-tic-tac-toe-1352-1361/tic_tac_toe_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

