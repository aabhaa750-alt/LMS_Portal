import os
import uvicorn

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print(f"==================================================")
    print(f"  My Learning Hub — Personal LMS for MBA Studies  ")
    print(f"  Available at: http://127.0.0.1:{port}          ")
    print(f"==================================================")
    uvicorn.run("app.main:app", host="127.0.0.1", port=port, reload=False)
