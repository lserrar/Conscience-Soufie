from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
import httpx
import base64

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Zoom credentials
ZOOM_ACCOUNT_ID = os.environ.get('ZOOM_ACCOUNT_ID', '')
ZOOM_CLIENT_ID = os.environ.get('ZOOM_CLIENT_ID', '')
ZOOM_CLIENT_SECRET = os.environ.get('ZOOM_CLIENT_SECRET', '')

# HelloAsso credentials
HELLOASSO_CLIENT_ID = os.environ.get('HELLOASSO_CLIENT_ID', '')
HELLOASSO_CLIENT_SECRET = os.environ.get('HELLOASSO_CLIENT_SECRET', '')
HELLOASSO_ORG_SLUG = os.environ.get('HELLOASSO_ORG_SLUG', 'conscience-soufie')

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

class ZoomWebinar(BaseModel):
    id: str
    uuid: Optional[str] = None
    topic: str
    start_time: Optional[str] = None
    duration: Optional[int] = None
    timezone: Optional[str] = None
    join_url: Optional[str] = None
    status: Optional[str] = None

class ZoomTokenCache:
    token: Optional[str] = None
    expires_at: Optional[datetime] = None

zoom_token_cache = ZoomTokenCache()

class HelloAssoTokenCache:
    token: Optional[str] = None
    expires_at: Optional[datetime] = None

helloasso_token_cache = HelloAssoTokenCache()

async def get_helloasso_access_token():
    """Get HelloAsso access token using OAuth2 client credentials"""
    global helloasso_token_cache
    
    # Check if we have a valid cached token
    if helloasso_token_cache.token and helloasso_token_cache.expires_at:
        if datetime.utcnow() < helloasso_token_cache.expires_at:
            return helloasso_token_cache.token
    
    async with httpx.AsyncClient() as http_client:
        try:
            response = await http_client.post(
                "https://api.helloasso.com/oauth2/token",
                data={
                    "grant_type": "client_credentials",
                    "client_id": HELLOASSO_CLIENT_ID,
                    "client_secret": HELLOASSO_CLIENT_SECRET
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            
            if response.status_code != 200:
                logger.error(f"HelloAsso OAuth error: {response.status_code} - {response.text}")
                raise HTTPException(status_code=500, detail="Erreur d'authentification HelloAsso")
            
            data = response.json()
            helloasso_token_cache.token = data["access_token"]
            # Token expires in 30 minutes, cache for 25 minutes
            from datetime import timedelta
            helloasso_token_cache.expires_at = datetime.utcnow() + timedelta(minutes=25)
            
            return helloasso_token_cache.token
        except httpx.RequestError as e:
            logger.error(f"HelloAsso request error: {e}")
            raise HTTPException(status_code=500, detail="Erreur de connexion à HelloAsso")

async def get_zoom_access_token():
    """Get Zoom access token using Server-to-Server OAuth"""
    global zoom_token_cache
    
    # Check if we have a valid cached token
    if zoom_token_cache.token and zoom_token_cache.expires_at:
        if datetime.utcnow() < zoom_token_cache.expires_at:
            return zoom_token_cache.token
    
    # Get new token
    credentials = f"{ZOOM_CLIENT_ID}:{ZOOM_CLIENT_SECRET}"
    encoded_credentials = base64.b64encode(credentials.encode()).decode()
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"https://zoom.us/oauth/token?grant_type=account_credentials&account_id={ZOOM_ACCOUNT_ID}",
                headers={
                    "Authorization": f"Basic {encoded_credentials}",
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            )
            
            if response.status_code != 200:
                logger.error(f"Zoom OAuth error: {response.status_code} - {response.text}")
                raise HTTPException(status_code=500, detail="Erreur d'authentification Zoom")
            
            data = response.json()
            zoom_token_cache.token = data["access_token"]
            # Token expires in 1 hour, cache for 55 minutes
            zoom_token_cache.expires_at = datetime.utcnow().replace(
                second=0, microsecond=0
            )
            from datetime import timedelta
            zoom_token_cache.expires_at += timedelta(minutes=55)
            
            return zoom_token_cache.token
        except httpx.RequestError as e:
            logger.error(f"Zoom request error: {e}")
            raise HTTPException(status_code=500, detail="Erreur de connexion à Zoom")

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Conscience Soufie API"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

@api_router.get("/zoom/webinars")
async def get_zoom_webinars():
    """Get upcoming webinars from Zoom"""
    try:
        token = await get_zoom_access_token()
        
        async with httpx.AsyncClient() as http_client:
            # Use 'me' to get webinars for the authenticated user
            # This works with webinar:read:list_webinars:admin scope
            webinars_response = await http_client.get(
                "https://api.zoom.us/v2/users/me/webinars",
                headers={"Authorization": f"Bearer {token}"},
                params={"page_size": 30, "type": "scheduled"}
            )
            
            all_webinars = []
            
            if webinars_response.status_code == 200:
                webinars_data = webinars_response.json()
                for webinar in webinars_data.get("webinars", []):
                    all_webinars.append({
                        "id": str(webinar.get("id")),
                        "uuid": webinar.get("uuid"),
                        "topic": webinar.get("topic"),
                        "start_time": webinar.get("start_time"),
                        "duration": webinar.get("duration"),
                        "timezone": webinar.get("timezone"),
                        "join_url": webinar.get("join_url"),
                        "status": webinar.get("status", "scheduled")
                    })
            else:
                logger.warning(f"Zoom webinars response: {webinars_response.status_code} - {webinars_response.text}")
            
            # Sort by start_time and get upcoming ones
            from datetime import datetime, timedelta
            now = datetime.utcnow()
            
            upcoming_webinars = []
            for w in all_webinars:
                if w.get("start_time"):
                    try:
                        start = datetime.fromisoformat(w["start_time"].replace("Z", "+00:00"))
                        # Include webinars that haven't ended yet (start_time + duration)
                        duration_minutes = w.get("duration", 60)
                        end_time = start + timedelta(minutes=duration_minutes)
                        if end_time.replace(tzinfo=None) >= now:
                            upcoming_webinars.append(w)
                    except:
                        upcoming_webinars.append(w)
                else:
                    upcoming_webinars.append(w)
            
            # Sort by start_time
            upcoming_webinars.sort(key=lambda x: x.get("start_time") or "9999")
            
            return {"webinars": upcoming_webinars[:5]}
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Zoom webinars error: {e}")
        return {"webinars": [], "error": str(e)}

@api_router.get("/zoom/webinar/{webinar_id}")
async def get_webinar_details(webinar_id: str):
    """Get details of a specific webinar"""
    try:
        token = await get_zoom_access_token()
        
        async with httpx.AsyncClient() as http_client:
            response = await http_client.get(
                f"https://api.zoom.us/v2/webinars/{webinar_id}",
                headers={"Authorization": f"Bearer {token}"}
            )
            
            if response.status_code != 200:
                return {"error": "Webinaire non trouvé"}
            
            data = response.json()
            return {
                "id": str(data.get("id")),
                "uuid": data.get("uuid"),
                "topic": data.get("topic"),
                "agenda": data.get("agenda"),
                "start_time": data.get("start_time"),
                "duration": data.get("duration"),
                "timezone": data.get("timezone"),
                "join_url": data.get("join_url"),
                "status": data.get("status", "scheduled")
            }
    except Exception as e:
        logger.error(f"Webinar details error: {e}")
        return {"error": str(e)}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
