import subprocess
import sys
import os

def run_server():
    os.chdir('backend')
    with open('debug_log.txt', 'w', encoding='utf-8') as f:
        process = subprocess.Popen(
            [sys.executable, '-m', 'uvicorn', 'main:app', '--host', '127.0.0.1', '--port', '8000'],
            stdout=f,
            stderr=subprocess.STDOUT
        )
        try:
            process.wait(timeout=10) # Wait 10 seconds to see if it crashes
        except subprocess.TimeoutExpired:
            print("Server is still running after 10 seconds.")
            return True
        
    print(f"Server exited with code {process.returncode}")
    return False

if __name__ == "__main__":
    run_server()
