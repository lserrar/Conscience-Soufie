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

class EmailCheckRequest(BaseModel):
    email: str

class MembershipCheckResponse(BaseModel):
    isMember: bool
    memberName: Optional[str] = None
    message: str

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

# SoundCloud RSS Feed URL
SOUNDCLOUD_RSS_URL = "https://feeds.soundcloud.com/users/soundcloud:users:522380445/sounds.rss"

# YouTube RSS Feed URL for Conscience Soufie channel
YOUTUBE_CHANNEL_ID = "UCK37umfJRkclvPvuVXFkjQA"
YOUTUBE_RSS_URL = f"https://www.youtube.com/feeds/videos.xml?channel_id={YOUTUBE_CHANNEL_ID}"

@api_router.get("/podcasts")
async def get_podcasts():
    """Get podcasts from SoundCloud RSS feed"""
    try:
        import xml.etree.ElementTree as ET
        
        async with httpx.AsyncClient() as http_client:
            response = await http_client.get(SOUNDCLOUD_RSS_URL, timeout=15.0)
            
            if response.status_code != 200:
                logger.error(f"SoundCloud RSS error: {response.status_code}")
                return {"podcasts": [], "error": "Impossible de récupérer les podcasts"}
            
            # Parse XML
            root = ET.fromstring(response.text)
            channel = root.find('channel')
            
            podcasts = []
            items = channel.findall('item') if channel is not None else []
            
            for item in items:
                title = item.find('title')
                description = item.find('description')
                pub_date = item.find('pubDate')
                link = item.find('link')
                enclosure = item.find('enclosure')
                
                # Get iTunes image or channel image
                itunes_image = item.find('{http://www.itunes.com/dtds/podcast-1.0.dtd}image')
                image_url = None
                if itunes_image is not None:
                    image_url = itunes_image.get('href')
                
                # Fallback to channel image
                if not image_url and channel is not None:
                    channel_image = channel.find('{http://www.itunes.com/dtds/podcast-1.0.dtd}image')
                    if channel_image is not None:
                        image_url = channel_image.get('href')
                    else:
                        # Try regular image
                        img = channel.find('image')
                        if img is not None:
                            url_elem = img.find('url')
                            if url_elem is not None:
                                image_url = url_elem.text
                
                # Get duration
                duration = item.find('{http://www.itunes.com/dtds/podcast-1.0.dtd}duration')
                
                podcast = {
                    "id": link.text if link is not None else str(len(podcasts)),
                    "title": title.text if title is not None else "Sans titre",
                    "description": description.text if description is not None else "",
                    "pubDate": pub_date.text if pub_date is not None else "",
                    "link": link.text if link is not None else "",
                    "audioUrl": enclosure.get('url') if enclosure is not None else None,
                    "imageUrl": image_url,
                    "duration": duration.text if duration is not None else None,
                }
                podcasts.append(podcast)
            
            return {"podcasts": podcasts}
            
    except Exception as e:
        logger.error(f"Podcasts error: {e}")
        return {"podcasts": [], "error": str(e)}

@api_router.get("/youtube/videos")
async def get_youtube_videos():
    """Get recent videos from YouTube RSS feed"""
    try:
        import xml.etree.ElementTree as ET
        
        async with httpx.AsyncClient() as http_client:
            response = await http_client.get(YOUTUBE_RSS_URL, timeout=15.0)
            
            if response.status_code != 200:
                logger.error(f"YouTube RSS error: {response.status_code}")
                return {"videos": [], "error": "Impossible de récupérer les vidéos"}
            
            # Parse XML (YouTube Atom feed)
            root = ET.fromstring(response.text)
            
            # Define namespace for Atom and Media
            ns = {
                'atom': 'http://www.w3.org/2005/Atom',
                'media': 'http://search.yahoo.com/mrss/',
                'yt': 'http://www.youtube.com/xml/schemas/2015'
            }
            
            videos = []
            entries = root.findall('atom:entry', ns)
            
            for entry in entries[:10]:  # Get up to 10 recent videos
                video_id_elem = entry.find('yt:videoId', ns)
                title_elem = entry.find('atom:title', ns)
                published_elem = entry.find('atom:published', ns)
                
                # Get media thumbnail
                media_group = entry.find('media:group', ns)
                thumbnail_url = None
                description = None
                
                if media_group is not None:
                    thumbnail_elem = media_group.find('media:thumbnail', ns)
                    if thumbnail_elem is not None:
                        thumbnail_url = thumbnail_elem.get('url')
                    
                    desc_elem = media_group.find('media:description', ns)
                    if desc_elem is not None:
                        description = desc_elem.text
                
                if video_id_elem is not None:
                    video_id = video_id_elem.text
                    video = {
                        "id": video_id,
                        "title": title_elem.text if title_elem is not None else "Sans titre",
                        "description": description[:200] + "..." if description and len(description) > 200 else description,
                        "thumbnail": thumbnail_url or f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg",
                        "url": f"https://www.youtube.com/watch?v={video_id}",
                        "publishedAt": published_elem.text if published_elem is not None else None,
                    }
                    videos.append(video)
            
            return {"videos": videos, "channelUrl": f"https://www.youtube.com/channel/{YOUTUBE_CHANNEL_ID}"}
            
    except Exception as e:
        logger.error(f"YouTube videos error: {e}")
        return {"videos": [], "error": str(e)}

@api_router.get("/articles/by-tag/{tag_slug}")
async def get_articles_by_tag(tag_slug: str, per_page: int = 10):
    """Get articles from WordPress filtered by tag or category"""
    try:
        # Map slugs to WordPress category slugs (exact match)
        # These use the actual WordPress category slugs
        category_slug_mapping = {
            "soufisme": "soufisme",
            "le-prophete-muhammad": "le-prophete-muhammad",
            "ibn-arabi": "ibn-arabi",
            "henry-corbin": "henry-corbin",
            "eva": "eva",
            "cheikh-ahmad-al-alawi": "cheikh-ahmad-al-alawi",
            "hallaj": "hallaj",
            "poesie": "poesie",
            "philosophie": "philosophie",
            "references-bibilographiques": "references-bibilographiques",
            "paix": "paix",
            "hommages": "hommages",
            "rene-guenon": "rene-guenon",
        }
        
        # Tags that should use text search (no direct category in WordPress)
        search_only_tags = {"rumi", "rene-guenon"}
        
        # Search terms for text search fallback
        search_term_mapping = {
            "rumi": "Rumi",
            "ibn-arabi": "Ibn Arabi",
            "henry-corbin": "Henry Corbin",
            "eva": "Eva de Vitray",
            "cheikh-ahmad-al-alawi": "Cheikh Alawi",
            "hallaj": "Hallaj",
            "le-prophete-muhammad": "Prophète Muhammad",
            "rene-guenon": "René Guénon",
        }
        
        async with httpx.AsyncClient() as http_client:
            # For rumi, use search directly (no WordPress category)
            if tag_slug in search_only_tags:
                search_term = search_term_mapping.get(tag_slug, tag_slug.replace("-", " "))
                search_response = await http_client.get(
                    "https://consciencesoufie.com/wp-json/wp/v2/posts",
                    params={
                        "search": search_term,
                        "per_page": per_page,
                        "_embed": True
                    }
                )
                if search_response.status_code == 200:
                    return {"articles": search_response.json(), "source": "search"}
            
            # Try to get category by slug directly (most reliable)
            wp_slug = category_slug_mapping.get(tag_slug, tag_slug)
            cat_response = await http_client.get(
                "https://consciencesoufie.com/wp-json/wp/v2/categories",
                params={"slug": wp_slug}
            )
            
            if cat_response.status_code == 200:
                cats = cat_response.json()
                if cats and len(cats) > 0:
                    cat_id = cats[0].get('id')
                    articles_response = await http_client.get(
                        "https://consciencesoufie.com/wp-json/wp/v2/posts",
                        params={
                            "categories": cat_id,
                            "per_page": per_page,
                            "_embed": True
                        }
                    )
                    if articles_response.status_code == 200:
                        return {"articles": articles_response.json(), "source": "category"}
            
            # Fallback: search by name
            search_term = search_term_mapping.get(tag_slug, tag_slug.replace("-", " "))
            search_response = await http_client.get(
                "https://consciencesoufie.com/wp-json/wp/v2/posts",
                params={
                    "search": search_term,
                    "per_page": per_page,
                    "_embed": True
                }
            )
            if search_response.status_code == 200:
                return {"articles": search_response.json(), "source": "search"}
            
            return {"articles": [], "source": "none"}
            
    except Exception as e:
        logger.error(f"Articles by tag error: {e}")
        return {"articles": [], "error": str(e)}

# Membership check endpoint
@api_router.post("/auth/check-membership", response_model=MembershipCheckResponse)
async def check_membership(request: EmailCheckRequest):
    """Check if an email is associated with an active HelloAsso membership"""
    try:
        email = request.email.lower().strip()
        logger.info(f"Checking membership for email: {email}")
        
        # Get HelloAsso access token
        access_token = await get_helloasso_access_token()
        if not access_token:
            logger.error("Failed to get HelloAsso access token")
            return MembershipCheckResponse(
                isMember=False,
                memberName=None,
                message="Impossible de vérifier l'adhésion. Réessayez plus tard."
            )
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            # Get all membership forms for the organization
            forms_response = await client.get(
                f"https://api.helloasso.com/v5/organizations/{HELLOASSO_ORG_SLUG}/forms",
                headers={"Authorization": f"Bearer {access_token}"},
                params={"formTypes": "Membership", "states": "Public", "pageSize": 20}
            )
            
            if forms_response.status_code != 200:
                logger.error(f"Failed to fetch HelloAsso forms: {forms_response.status_code}")
                return MembershipCheckResponse(
                    isMember=False,
                    memberName=None,
                    message="Erreur lors de la vérification de l'adhésion."
                )
            
            forms_data = forms_response.json()
            forms = forms_data.get("data", [])
            logger.info(f"Found {len(forms)} membership forms")
            
            # Check each membership form for the user's email
            for form in forms:
                form_slug = form.get("formSlug", "")
                logger.info(f"Checking form: {form_slug}")
                
                # Paginate through all items in this form
                page = 1
                while True:
                    items_response = await client.get(
                        f"https://api.helloasso.com/v5/organizations/{HELLOASSO_ORG_SLUG}/forms/Membership/{form_slug}/items",
                        headers={"Authorization": f"Bearer {access_token}"},
                        params={"pageSize": 100, "pageIndex": page, "withDetails": True}
                    )
                    
                    if items_response.status_code != 200:
                        break
                    
                    items_data = items_response.json()
                    items = items_data.get("data", [])
                    
                    if not items:
                        break
                    
                    logger.info(f"Form {form_slug} page {page}: {len(items)} items")
                    
                    # Search for the email in membership items
                    for item in items:
                        payer = item.get("payer", {})
                        user = item.get("user", {})
                        
                        payer_email = payer.get("email", "").lower().strip()
                        user_email = user.get("email", "").lower().strip()
                        
                        # Also check custom fields
                        custom_fields = item.get("customFields", [])
                        custom_emails = [f.get("answer", "").lower().strip() for f in custom_fields if "email" in f.get("name", "").lower()]
                        
                        all_emails = [payer_email, user_email] + custom_emails
                        
                        if email in all_emails:
                            member_name = f"{user.get('firstName', '')} {user.get('lastName', '')}".strip()
                            if not member_name:
                                member_name = f"{payer.get('firstName', '')} {payer.get('lastName', '')}".strip()
                            
                            logger.info(f"Found membership for {email}: {member_name} in form {form_slug}")
                            return MembershipCheckResponse(
                                isMember=True,
                                memberName=member_name if member_name else None,
                                message="Bienvenue ! Vous êtes adhérent."
                            )
                    
                    # Check for more pages - continue if we got 100 items (might be more)
                    if len(items) < 100:
                        break
                    page += 1
                    
                    # Safety limit to avoid infinite loops
                    if page > 20:
                        break
            
            # No membership found
            logger.info(f"No membership found for {email}")
            return MembershipCheckResponse(
                isMember=False,
                memberName=None,
                message="Aucune adhésion trouvée pour cet email."
            )
            
    except Exception as e:
        logger.error(f"Membership check error: {e}")
        return MembershipCheckResponse(
            isMember=False,
            memberName=None,
            message="Erreur lors de la vérification de l'adhésion."
        )

# Get current membership form URL dynamically
@api_router.get("/helloasso/membership-form")
async def get_membership_form():
    """Get the current active membership form URL from HelloAsso"""
    try:
        access_token = await get_helloasso_access_token()
        if not access_token:
            return {"url": "https://www.helloasso.com/associations/conscience-soufie", "error": "Token unavailable"}
        
        async with httpx.AsyncClient() as client:
            # Get membership forms
            response = await client.get(
                f"https://api.helloasso.com/v5/organizations/{HELLOASSO_ORG_SLUG}/forms",
                headers={"Authorization": f"Bearer {access_token}"},
                params={"formTypes": "Membership", "states": "Public", "pageSize": 10}
            )
            
            if response.status_code == 200:
                data = response.json()
                forms = data.get("data", [])
                
                if forms:
                    # Get the most recent public membership form
                    latest_form = forms[0]
                    form_slug = latest_form.get("formSlug", "")
                    
                    # Construct the HelloAsso URL
                    url = f"https://www.helloasso.com/associations/{HELLOASSO_ORG_SLUG}/adhesions/{form_slug}"
                    return {"url": url, "title": latest_form.get("title", "")}
            
            # Fallback to organization page
            return {"url": "https://www.helloasso.com/associations/conscience-soufie"}
            
    except Exception as e:
        logger.error(f"Error fetching membership form: {e}")
        return {"url": "https://www.helloasso.com/associations/conscience-soufie", "error": str(e)}

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
