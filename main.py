import uvicorn
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
import random
import string
import asyncio

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def serve_index():
    return FileResponse("static/index.html")

async def construct_pair():
    await asyncio.sleep(0.2)

async def pca():
    await asyncio.sleep(0.5)

async def construct_examples():
    for _ in range(10):
        await construct_pair()
    await pca()

@app.post("/random_string")
async def get_random_string(request: Request):
    data = await request.json()
    await asyncio.sleep(3)
    letters = string.ascii_letters
    rand_str = ''.join(random.choice(letters) for _ in range(20))
    return JSONResponse({"randomString": rand_str})

@app.post("/rename_dimension")
async def rename_dimension(request: Request):
    data = await request.json()
    await construct_examples()
    return JSONResponse({"success": True})

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
