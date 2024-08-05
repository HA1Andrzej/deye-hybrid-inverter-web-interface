#!/bin/bash

# Finde alle laufenden Python-Prozesse und beende sie
ps aux | grep '[p]ython' | awk '{print $2}' | xargs sudo kill

echo "Alle Python-Prozesse wurden beendet."
