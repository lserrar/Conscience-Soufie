"""
Backend API Tests for Conscience Soufie App
Tests the new Podcast and Articles by Tag endpoints
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('EXPO_PUBLIC_BACKEND_URL', 'https://sufi-hub.preview.emergentagent.com')

class TestHealthCheck:
    """Basic health check tests"""
    
    def test_api_root(self):
        """Test API root endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert data["message"] == "Conscience Soufie API"
        print("✓ API root endpoint working")


class TestPodcastsAPI:
    """Tests for /api/podcasts endpoint - SoundCloud RSS integration"""
    
    def test_podcasts_endpoint_returns_200(self):
        """Test that podcasts endpoint returns 200"""
        response = requests.get(f"{BASE_URL}/api/podcasts", timeout=20)
        assert response.status_code == 200
        print("✓ Podcasts endpoint returns 200")
    
    def test_podcasts_returns_podcast_list(self):
        """Test that podcasts endpoint returns a list of podcasts"""
        response = requests.get(f"{BASE_URL}/api/podcasts", timeout=20)
        assert response.status_code == 200
        data = response.json()
        
        # Check structure
        assert "podcasts" in data
        assert isinstance(data["podcasts"], list)
        print(f"✓ Podcasts endpoint returns {len(data['podcasts'])} podcasts")
    
    def test_podcasts_have_required_fields(self):
        """Test that each podcast has required fields"""
        response = requests.get(f"{BASE_URL}/api/podcasts", timeout=20)
        assert response.status_code == 200
        data = response.json()
        
        if len(data["podcasts"]) > 0:
            podcast = data["podcasts"][0]
            
            # Check required fields
            required_fields = ["id", "title", "description", "pubDate", "link"]
            for field in required_fields:
                assert field in podcast, f"Missing field: {field}"
            
            # Validate types
            assert isinstance(podcast["title"], str)
            assert len(podcast["title"]) > 0
            print(f"✓ First podcast has all required fields: {podcast['title'][:50]}...")
    
    def test_podcasts_audio_url_present(self):
        """Test that podcasts have audioUrl field"""
        response = requests.get(f"{BASE_URL}/api/podcasts", timeout=20)
        assert response.status_code == 200
        data = response.json()
        
        if len(data["podcasts"]) > 0:
            podcast = data["podcasts"][0]
            assert "audioUrl" in podcast
            # audioUrl can be null for some podcasts
            print(f"✓ Podcasts have audioUrl field (value: {podcast.get('audioUrl', 'None')[:50] if podcast.get('audioUrl') else 'None'}...)")


class TestArticlesByTagAPI:
    """Tests for /api/articles/by-tag/{tag_slug} endpoint"""
    
    def test_articles_by_tag_soufisme(self):
        """Test fetching articles by soufisme tag"""
        response = requests.get(f"{BASE_URL}/api/articles/by-tag/soufisme", timeout=20)
        assert response.status_code == 200
        data = response.json()
        
        assert "articles" in data
        assert isinstance(data["articles"], list)
        print(f"✓ Articles by tag 'soufisme' returns {len(data['articles'])} articles")
    
    def test_articles_by_tag_rumi(self):
        """Test fetching articles by rumi tag"""
        response = requests.get(f"{BASE_URL}/api/articles/by-tag/rumi", timeout=20)
        assert response.status_code == 200
        data = response.json()
        
        assert "articles" in data
        print(f"✓ Articles by tag 'rumi' returns {len(data['articles'])} articles")
    
    def test_articles_by_tag_ibn_arabi(self):
        """Test fetching articles by ibn-arabi tag"""
        response = requests.get(f"{BASE_URL}/api/articles/by-tag/ibn-arabi", timeout=20)
        assert response.status_code == 200
        data = response.json()
        
        assert "articles" in data
        print(f"✓ Articles by tag 'ibn-arabi' returns {len(data['articles'])} articles")
    
    def test_articles_by_tag_henri_corbin(self):
        """Test fetching articles by henri-corbin tag"""
        response = requests.get(f"{BASE_URL}/api/articles/by-tag/henri-corbin", timeout=20)
        assert response.status_code == 200
        data = response.json()
        
        assert "articles" in data
        print(f"✓ Articles by tag 'henri-corbin' returns {len(data['articles'])} articles")
    
    def test_articles_have_wordpress_structure(self):
        """Test that articles have WordPress post structure"""
        response = requests.get(f"{BASE_URL}/api/articles/by-tag/soufisme", timeout=20)
        assert response.status_code == 200
        data = response.json()
        
        if len(data["articles"]) > 0:
            article = data["articles"][0]
            
            # WordPress posts have these fields
            assert "id" in article
            assert "title" in article
            assert "rendered" in article["title"]
            print(f"✓ Articles have WordPress structure: {article['title']['rendered'][:50]}...")
    
    def test_articles_by_unknown_tag_returns_empty(self):
        """Test that unknown tag returns empty list or fallback results"""
        response = requests.get(f"{BASE_URL}/api/articles/by-tag/unknown-tag-xyz", timeout=20)
        assert response.status_code == 200
        data = response.json()
        
        assert "articles" in data
        # Either empty or fallback search results
        print(f"✓ Unknown tag returns {len(data['articles'])} articles (search fallback)")


class TestHelloAssoEventsAPI:
    """Tests for /api/helloasso/events endpoint"""
    
    def test_helloasso_events_endpoint(self):
        """Test HelloAsso events endpoint"""
        response = requests.get(f"{BASE_URL}/api/helloasso/events", timeout=20)
        assert response.status_code == 200
        data = response.json()
        
        assert "events" in data
        assert isinstance(data["events"], list)
        print(f"✓ HelloAsso events returns {len(data['events'])} events")
    
    def test_events_have_required_fields(self):
        """Test that events have required fields"""
        response = requests.get(f"{BASE_URL}/api/helloasso/events", timeout=20)
        assert response.status_code == 200
        data = response.json()
        
        if len(data["events"]) > 0:
            event = data["events"][0]
            
            required_fields = ["id", "title", "startDate", "url"]
            for field in required_fields:
                assert field in event, f"Missing field: {field}"
            
            print(f"✓ Events have required fields: {event['title'][:50]}...")


class TestZoomWebinarsAPI:
    """Tests for /api/zoom/webinars endpoint"""
    
    def test_zoom_webinars_endpoint(self):
        """Test Zoom webinars endpoint"""
        response = requests.get(f"{BASE_URL}/api/zoom/webinars", timeout=20)
        assert response.status_code == 200
        data = response.json()
        
        assert "webinars" in data
        assert isinstance(data["webinars"], list)
        print(f"✓ Zoom webinars endpoint working, returns {len(data['webinars'])} webinars")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
