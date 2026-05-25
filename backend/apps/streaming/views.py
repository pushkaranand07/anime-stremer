import re
import base64
import json
import requests
import logging
from urllib.parse import urlparse, urljoin, quote, unquote
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.http import StreamingHttpResponse, HttpResponse
from django.views import View

from .scraper_service import ScraperService

logger = logging.getLogger(__name__)

class InfoView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        query = request.GET.get('q', '').strip()
        logger.info(f"[InfoView] GET /info?q='{query}'")
        if not query:
            return Response({
                'success': False,
                'statusCode': 400,
                'message': 'Query parameter ?q= is required',
                'data': None
            }, status=status.HTTP_400_BAD_REQUEST)
            
        result = ScraperService.get_anime_info(query)
        if not result:
            return Response({
                'success': False,
                'statusCode': 503,
                'message': 'Failed to fetch anime sources. Please try again.',
                'data': None
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
            
        return Response({
            'success': True,
            'statusCode': 200,
            'message': 'Anime info fetched',
            'data': result
        }, status=status.HTTP_200_OK)


class WatchView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request, episode_id):
        provider = request.GET.get('provider', 'Hianime')
        sub_or_dub = request.GET.get('subOrDub', 'sub')
        
        decoded_episode_id = unquote(episode_id)
        logger.info(f"[WatchView] GET /watch/{decoded_episode_id}?provider={provider}&subOrDub={sub_or_dub}")
        
        result = ScraperService.get_episode_sources(decoded_episode_id, provider, sub_or_dub)
        if not result or not result.get('sources'):
            return Response({
                'success': False,
                'statusCode': 503,
                'message': 'No streaming sources available. All providers failed.',
                'data': None
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
            
        return Response({
            'success': True,
            'statusCode': 200,
            'message': 'Video sources fetched',
            'data': result
        }, status=status.HTTP_200_OK)


class ProxyView(View):
    ALLOWED_HOSTNAME_PATTERNS = [
        re.compile(r'\.hianime\.', re.IGNORECASE),
        re.compile(r'\.animixplay\.', re.IGNORECASE),
        re.compile(r'\.gogoanime\.', re.IGNORECASE),
        re.compile(r'\.animekai\.', re.IGNORECASE),
        re.compile(r'\.animepahe\.', re.IGNORECASE),
        re.compile(r'\.crunchyroll\.', re.IGNORECASE),
        re.compile(r'\.kickassanime\.', re.IGNORECASE),
        re.compile(r'\.akamaized\.net$', re.IGNORECASE),
        re.compile(r'\.fastly\.net$', re.IGNORECASE),
        re.compile(r'\.cloudfront\.net$', re.IGNORECASE),
        re.compile(r'\.cdn\.net$', re.IGNORECASE),
        re.compile(r'\.biananset\.net$', re.IGNORECASE),
        re.compile(r'\.netmagcdn\.com$', re.IGNORECASE),
        re.compile(r'\.megacloud\.tv$', re.IGNORECASE),
        re.compile(r'\.rapid-cloud\.', re.IGNORECASE),
    ]

    BLOCKED_HOSTS = [
        '127.', '10.', '192.168.', '0.0.0.0', '169.254.', '::1', 'localhost'
    ]

    def is_url_allowed(self, target_url):
        try:
            parsed = urlparse(target_url)
            if parsed.scheme not in ['http', 'https']:
                return False
                
            hostname = parsed.hostname.lower()
            
            # Check blocked hosts
            for prefix in self.BLOCKED_HOSTS:
                if hostname.startswith(prefix) or hostname == prefix.rstrip('.'):
                    return False
                    
            # Check 172.16. to 172.31.
            if hostname.startswith('172.'):
                parts = hostname.split('.')
                if len(parts) >= 2:
                    try:
                        second_octet = int(parts[1])
                        if 16 <= second_octet <= 31:
                            return False
                    except ValueError:
                        pass
                        
            # Check allowed patterns
            for pattern in self.ALLOWED_HOSTNAME_PATTERNS:
                if pattern.search(hostname):
                    return True
                    
            return False
        except Exception:
            return False

    def get_absolute_url(self, url, base_url):
        if url.startswith('http'):
            return url
        if url.startswith('/'):
            parsed = urlparse(base_url)
            return f"{parsed.scheme}://{parsed.netloc}{url}"
        return urljoin(base_url, url)

    def get_proxy_url(self, target_url, proxy_prefix, headers_string):
        url = f"{proxy_prefix}?url={quote(target_url)}"
        if headers_string:
            url += f"&headers={quote(headers_string)}"
        return url

    def rewrite_m3u8(self, content, target_url, request, headers_b64):
        proxy_prefix = request.build_absolute_uri(request.path)
        base_url = target_url.rsplit('/', 1)[0] + '/'
        
        lines = content.split('\n')
        rewritten_lines = []
        for line in lines:
            line_stripped = line.strip()
            if not line_stripped:
                rewritten_lines.append(line)
                continue
                
            if line_stripped.startswith('#'):
                if line_stripped.startswith('#EXT-X-I-FRAME-STREAM-INF') or line_stripped.startswith('#EXT-X-STREAM-INF') or line_stripped.startswith('#EXT-X-MEDIA'):
                    def replacer(match):
                        uri = match.group(1)
                        abs_uri = self.get_absolute_url(uri, base_url)
                        proxy_url = self.get_proxy_url(abs_uri, proxy_prefix, headers_b64)
                        return f'URI="{proxy_url}"'
                    rewritten_line = re.sub(r'URI="([^"]+)"', replacer, line_stripped)
                    rewritten_lines.append(rewritten_line)
                else:
                    rewritten_lines.append(line_stripped)
            else:
                abs_url = self.get_absolute_url(line_stripped, base_url)
                proxy_url = self.get_proxy_url(abs_url, proxy_prefix, headers_b64)
                rewritten_lines.append(proxy_url)
                
        return '\n'.join(rewritten_lines)

    def get(self, request):
        url = request.GET.get('url')
        if not url:
            return HttpResponse('Missing url parameter', status=400)
            
        target_url = unquote(url)
        
        if not self.is_url_allowed(target_url):
            return HttpResponse('Proxying this host is forbidden', status=403)
            
        headers_b64 = request.GET.get('headers')
        custom_headers = {}
        if headers_b64:
            try:
                # Add padding if needed for base64 decoding
                padded_b64 = headers_b64 + '=' * (4 - len(headers_b64) % 4)
                custom_headers = json.loads(base64.b64decode(padded_b64).decode('utf-8'))
            except Exception as e:
                logger.error(f"[ProxyView] Failed to decode headers: {str(e)}")
                
        target_origin = f"{urlparse(target_url).scheme}://{urlparse(target_url).netloc}"
        req_headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': custom_headers.get('Referer') or target_origin,
        }
        
        for k, v in custom_headers.items():
            if k.lower() != 'referer':
                req_headers[k] = v
                
        if '.m3u8' in target_url:
            try:
                res = requests.get(target_url, headers=req_headers, timeout=15)
                content = res.text
                rewritten_content = self.rewrite_m3u8(content, target_url, request, headers_b64)
                
                response = HttpResponse(
                    rewritten_content, 
                    content_type=res.headers.get('content-type', 'application/vnd.apple.mpegurl')
                )
                response['Access-Control-Allow-Origin'] = '*'
                return response
            except Exception as e:
                logger.error(f"[ProxyView] M3U8 fetch failed: {str(e)}")
                return HttpResponse('Failed to fetch playlist', status=502)
                
        try:
            res = requests.get(target_url, headers=req_headers, stream=True, timeout=20)
            
            def stream_generator():
                for chunk in res.iter_content(chunk_size=65536):
                    yield chunk
                    
            response = StreamingHttpResponse(
                stream_generator(),
                content_type=res.headers.get('content-type', 'video/MP2T'),
                status=res.status_code
            )
            response['Access-Control-Allow-Origin'] = '*'
            return response
        except Exception as e:
            logger.error(f"[ProxyView] Segment pipe failed: {str(e)}")
            return HttpResponse(status=500)
