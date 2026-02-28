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

@api_router.get("/helloasso/events")
async def get_helloasso_events():
    """Get upcoming events from HelloAsso"""
    try:
        token = await get_helloasso_access_token()
        
        async with httpx.AsyncClient() as http_client:
            response = await http_client.get(
                f"https://api.helloasso.com/v5/organizations/{HELLOASSO_ORG_SLUG}/forms",
                headers={"Authorization": f"Bearer {token}"},
                params={
                    "formTypes": "Event",
                    "states": "Public",
                    "pageSize": 20
                }
            )
            
            if response.status_code != 200:
                logger.error(f"HelloAsso events error: {response.status_code} - {response.text}")
                return {"events": [], "error": "Impossible de récupérer les événements"}
            
            data = response.json()
            events = []
            
            now = datetime.utcnow()
            
            for event in data.get("data", []):
                # Parse start date to filter future events
                start_date_str = event.get("startDate")
                if start_date_str:
                    try:
                        # Parse ISO format with timezone
                        start_date = datetime.fromisoformat(start_date_str.replace("+02:00", "").replace("+01:00", ""))
                        # Include events that haven't ended yet
                        end_date_str = event.get("endDate")
                        if end_date_str:
                            end_date = datetime.fromisoformat(end_date_str.replace("+02:00", "").replace("+01:00", ""))
                            if end_date < now:
                                continue
                        elif start_date < now:
                            continue
                    except Exception as e:
                        logger.warning(f"Date parsing error: {e}")
                
                events.append({
                    "id": event.get("formSlug"),
                    "title": event.get("title"),
                    "description": event.get("description"),
                    "startDate": event.get("startDate"),
                    "endDate": event.get("endDate"),
                    "banner": event.get("banner", {}).get("publicUrl") if event.get("banner") else None,
                    "logo": event.get("logo", {}).get("publicUrl") if event.get("logo") else None,
                    "url": event.get("url"),
                    "widgetUrl": event.get("widgetFullUrl"),
                    "widgetButtonUrl": event.get("widgetButtonUrl"),
                    "state": event.get("state"),
                    "organizationSlug": event.get("organizationSlug"),
                    "place": event.get("place")
                })
            
            # Sort by start date (ascending - earliest first)
            events.sort(key=lambda x: x.get("startDate") or "9999")
            
            return {"events": events}
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"HelloAsso events error: {e}")
        return {"events": [], "error": str(e)}

@api_router.get("/helloasso/event/{event_slug}")
async def get_helloasso_event_details(event_slug: str):
    """Get details of a specific HelloAsso event"""
    try:
        token = await get_helloasso_access_token()
        
        async with httpx.AsyncClient() as http_client:
            # Get event details
            response = await http_client.get(
                f"https://api.helloasso.com/v5/organizations/{HELLOASSO_ORG_SLUG}/forms/Event/{event_slug}",
                headers={"Authorization": f"Bearer {token}"}
            )
            
            if response.status_code != 200:
                return {"error": "Événement non trouvé"}
            
            event = response.json()
            
            # Get event items (tickets/tariffs)
            items_response = await http_client.get(
                f"https://api.helloasso.com/v5/organizations/{HELLOASSO_ORG_SLUG}/forms/Event/{event_slug}/items",
                headers={"Authorization": f"Bearer {token}"}
            )
            
            items = []
            if items_response.status_code == 200:
                items_data = items_response.json()
                for item in items_data.get("data", []):
                    items.append({
                        "id": item.get("id"),
                        "name": item.get("name"),
                        "description": item.get("description"),
                        "price": item.get("amount", 0) / 100,  # Convert cents to euros
                        "currency": "EUR"
                    })
            
            return {
                "id": event.get("formSlug"),
                "title": event.get("title"),
                "description": event.get("description"),
                "startDate": event.get("startDate"),
                "endDate": event.get("endDate"),
                "banner": event.get("banner", {}).get("publicUrl") if event.get("banner") else None,
                "logo": event.get("logo", {}).get("publicUrl") if event.get("logo") else None,
                "url": event.get("url"),
                "widgetUrl": event.get("widgetFullUrl"),
                "state": event.get("state"),
                "place": event.get("place"),
                "items": items
            }
    except Exception as e:
        logger.error(f"HelloAsso event details error: {e}")
        return {"error": str(e)}

class CheckoutRequest(BaseModel):
    event_slug: str
    first_name: str
    last_name: str
    email: str
    item_id: Optional[int] = None

@api_router.post("/helloasso/checkout")
async def create_helloasso_checkout(request: CheckoutRequest):
    """Create a HelloAsso checkout session with pre-filled user data"""
    try:
        token = await get_helloasso_access_token()
        
        async with httpx.AsyncClient() as http_client:
            # First get the event items to find a valid item ID
            items_response = await http_client.get(
                f"https://api.helloasso.com/v5/organizations/{HELLOASSO_ORG_SLUG}/forms/Event/{request.event_slug}/items",
                headers={"Authorization": f"Bearer {token}"}
            )
            
            if items_response.status_code != 200:
                logger.error(f"Failed to get items: {items_response.text}")
                return {"error": "Impossible de récupérer les tarifs de l'événement"}
            
            items_data = items_response.json()
            items = items_data.get("data", [])
            
            if not items:
                # If no items, return the direct URL
                return {
                    "checkoutUrl": f"https://www.helloasso.com/associations/{HELLOASSO_ORG_SLUG}/evenements/{request.event_slug}",
                    "fallback": True
                }
            
            # Use provided item_id or first available item
            item_id = request.item_id or items[0].get("id")
            
            # Create checkout intent
            checkout_body = {
                "totalAmount": items[0].get("amount", 0),
                "initialAmount": items[0].get("amount", 0),
                "itemName": items[0].get("name", "Inscription"),
                "backUrl": f"https://www.helloasso.com/associations/{HELLOASSO_ORG_SLUG}/evenements/{request.event_slug}",
                "errorUrl": f"https://www.helloasso.com/associations/{HELLOASSO_ORG_SLUG}/evenements/{request.event_slug}",
                "returnUrl": f"https://www.helloasso.com/associations/{HELLOASSO_ORG_SLUG}/evenements/{request.event_slug}",
                "payer": {
                    "firstName": request.first_name,
                    "lastName": request.last_name,
                    "email": request.email
                }
            }
            
            checkout_response = await http_client.post(
                f"https://api.helloasso.com/v5/organizations/{HELLOASSO_ORG_SLUG}/checkout-intents",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json"
                },
                json=checkout_body
            )
            
            if checkout_response.status_code in [200, 201]:
                checkout_data = checkout_response.json()
                return {
                    "checkoutUrl": checkout_data.get("redirectUrl"),
                    "checkoutId": checkout_data.get("id")
                }
            else:
                logger.warning(f"Checkout creation failed: {checkout_response.status_code} - {checkout_response.text}")
                # Fallback to direct URL with query params
                base_url = f"https://www.helloasso.com/associations/{HELLOASSO_ORG_SLUG}/evenements/{request.event_slug}"
                return {
                    "checkoutUrl": base_url,
                    "fallback": True,
                    "user": {
                        "firstName": request.first_name,
                        "lastName": request.last_name,
                        "email": request.email
                    }
                }
                
    except Exception as e:
        logger.error(f"HelloAsso checkout error: {e}")
        return {"error": str(e)}

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
