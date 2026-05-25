import os
import sys
import subprocess
import json
import logging
from django.conf import settings
from django.core.cache import cache

logger = logging.getLogger(__name__)

CACHE_TTL = 1800 # 30 minutes

class ScraperService:
    @staticmethod
    def _run_node_scraper(args, timeout=30):
        """Helper to run the node scraper script via subprocess."""
        script_path = os.path.join(settings.BASE_DIR, 'apps', 'streaming', 'scraper.js')
        
        try:
            cmd = ['node', script_path] + args
            logger.info(f"[ScraperService] Executing command: {' '.join(cmd)}")
            
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=timeout,
                cwd=settings.BASE_DIR
            )
            
            if result.returncode != 0:
                logger.error(f"[ScraperService] Node scraper returned non-zero code {result.returncode}. Stderr: {result.stderr}")
                return None
                
            stdout_content = result.stdout.strip()
            if not stdout_content:
                logger.error("[ScraperService] Node scraper returned empty output.")
                return None
                
            # Node print might contain logs before the JSON line, but our scraper only prints the JSON object to console.log
            # To be safe, we parse the last line if there are multiple lines.
            last_line = stdout_content.split('\n')[-1]
            payload = json.loads(last_line)
            return payload
            
        except subprocess.TimeoutExpired:
            logger.error(f"[ScraperService] Timeout after {timeout}s running scraper.")
            return None
        except json.JSONDecodeError as e:
            logger.error(f"[ScraperService] Failed to parse scraper output as JSON. Error: {str(e)}. Raw output: {result.stdout}")
            return None
        except Exception as e:
            logger.error(f"[ScraperService] Exception running scraper: {str(e)}")
            return None

    @classmethod
    def get_anime_info(cls, query):
        """Fetch anime info by search query. Hits cache first."""
        normalized_query = query.lower().strip()
        cache_key = f"info:{normalized_query}"
        
        cached_result = cache.get(cache_key)
        if cached_result:
            logger.info(f"[ScraperService] Cache hit for info query: {normalized_query}")
            return cached_result
            
        logger.info(f"[ScraperService] Cache miss for info query: {normalized_query}. Querying scraper...")
        payload = cls._run_node_scraper(['info', query])
        
        if not payload or not payload.get('success'):
            err_msg = payload.get('error', 'Unknown scraping error') if payload else 'Scraper execution failed'
            logger.error(f"[ScraperService] Scraping failed for query '{query}': {err_msg}")
            return None
            
        info = payload.get('data', {})
        provider_name = info.get('provider')
        has_dub = provider_name in ['Hianime', 'Gogoanime']
        
        result = {
            'provider': provider_name,
            'hasDub': has_dub,
            'id': info.get('id'),
            'title': info.get('title'),
            'image': info.get('image'),
            'description': info.get('description'),
            'episodes': [
                {
                    'id': ep.get('id'),
                    'number': ep.get('number'),
                    'title': ep.get('title') or f"Episode {ep.get('number')}",
                    'isFiller': ep.get('isFiller') or False,
                    'provider': provider_name,
                }
                for ep in info.get('episodes', [])
            ]
        }
        
        cache.set(cache_key, result, CACHE_TTL)
        return result

    @classmethod
    def get_episode_sources(cls, episode_id, provider, sub_or_dub):
        """Fetch playable episode stream sources. Hits cache first."""
        cache_key = f"watch:{episode_id}:{provider}:{sub_or_dub}"
        
        cached_result = cache.get(cache_key)
        if cached_result:
            logger.info(f"[ScraperService] Cache hit for episode sources: {cache_key}")
            return cached_result
            
        logger.info(f"[ScraperService] Cache miss for episode sources: {cache_key}. Querying scraper...")
        payload = cls._run_node_scraper(['watch', episode_id, provider, sub_or_dub])
        
        if not payload or not payload.get('success'):
            err_msg = payload.get('error', 'Unknown scraping error') if payload else 'Scraper execution failed'
            logger.error(f"[ScraperService] Scraping failed for episode watch '{episode_id}': {err_msg}")
            return None
            
        sources_data = payload.get('data', {})
        
        result = {
            'provider': sources_data.get('provider', provider),
            'subOrDub': sub_or_dub,
            'sources': sources_data.get('sources') or [],
            'subtitles': sources_data.get('subtitles') or [],
            'intro': sources_data.get('intro'),
            'outro': sources_data.get('outro'),
            'isFallback': sources_data.get('isFallback') or False,
        }
        
        cache.set(cache_key, result, CACHE_TTL)
        return result
