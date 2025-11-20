"""Django management command to poll smart home devices and save state to Redis"""
import time
import logging
from django.core.management.base import BaseCommand
from homeassistant.light.services import LightStateService
from homeassistant.climate.services import ClimateStateService

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Poll smart home devices every 30 seconds and save state to Redis"
    
    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("Starting device polling service..."))
        logger.info("poll_devices_001: Device polling service started")
        
        light_service = LightStateService()
        climate_service = ClimateStateService()
        
        while True:
            try:
                logger.info("poll_devices_002: Polling devices...")
                
                # Poll light devices
                light_service.save_to_redis()
                
                # Poll climate devices  
                climate_service.save_to_redis()
                
                logger.info("poll_devices_003: Device state saved to Redis successfully")
                
            except Exception as e:
                logger.error(f"poll_devices_error_001: Error polling devices: {e}")
            
            # Wait 30 seconds before next poll
            time.sleep(30)
