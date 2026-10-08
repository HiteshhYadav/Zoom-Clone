"""
Zoom Clone — Development Server Launcher
Starts both the FastAPI backend (port 8000) and Next.js frontend (port 3000).
"""

import subprocess
import sys
import os
import signal

ROOT = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(ROOT, "backend")
FRONTEND_DIR = os.path.join(ROOT, "frontend")


def main():
    procs = []

    try:
        # ── Backend ─────────────────────────────────────────────
        print("\n🚀  Starting FastAPI backend on http://localhost:8000 ...")
        backend = subprocess.Popen(
            [sys.executable, "-m", "uvicorn", "main:app", "--reload", "--port", "8000"],
            cwd=BACKEND_DIR,
        )
        procs.append(backend)

        # ── Frontend ────────────────────────────────────────────
        print("🚀  Starting Next.js frontend on http://localhost:3000 ...\n")
        frontend = subprocess.Popen(
            ["npm", "run", "dev"],
            cwd=FRONTEND_DIR,
            shell=True,
        )
        procs.append(frontend)

        # Wait for either to exit
        for p in procs:
            p.wait()

    except KeyboardInterrupt:
        print("\n\n🛑  Shutting down servers...")
        for p in procs:
            p.terminate()
        print("   Done.\n")


if __name__ == "__main__":
    main()
