"""
Data cleanup utilities for auto-deleting old conversations.
Runs periodically to maintain 30-day retention policy.
"""

from datetime import datetime, timedelta
from typing import Dict
import asyncio
from ..services.supabase_service import supabase_service
from ..core.config import settings
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DataCleanup:
    """
    Handles automatic cleanup of old user data.
    """
    
    @staticmethod
    async def cleanup_old_data(days: int = None) -> Dict[str, int]:
        """
        Delete conversations and messages older than specified days.
        
        This ensures compliance with 30-day data retention policy.
        
        Args:
            days: Number of days to retain (default from settings)
        
        Returns:
            Dictionary with cleanup statistics
        """
        if days is None:
            days = settings.DATA_RETENTION_DAYS
        
        try:
            logger.info(f"Starting data cleanup for data older than {days} days...")
            
            # Calculate cutoff date
            cutoff_date = datetime.utcnow() - timedelta(days=days)
            logger.info(f"Cutoff date: {cutoff_date.isoformat()}")
            
            # Perform cleanup
            result = await supabase_service.delete_old_user_data(days=days)
            
            logger.info(f"Data cleanup completed successfully")
            
            return {
                "success": True,
                "cutoff_date": cutoff_date.isoformat(),
                "days_retained": days
            }
        
        except Exception as e:
            logger.error(f"Error during data cleanup: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    @staticmethod
    async def schedule_daily_cleanup():
        """
        Run cleanup task once per day.
        
        This would run as a background task in production.
        For now, you can trigger it manually or via cron job.
        """
        while True:
            try:
                # Run cleanup
                await DataCleanup.cleanup_old_data()
                
                # Wait 24 hours before next cleanup
                await asyncio.sleep(24 * 60 * 60)  # 24 hours in seconds
            
            except Exception as e:
                logger.error(f"Error in scheduled cleanup: {str(e)}")
                # Wait 1 hour before retrying if error occurs
                await asyncio.sleep(60 * 60)
    
    @staticmethod
    async def get_data_statistics() -> Dict[str, any]:
        """
        Get statistics about stored data.
        Useful for monitoring and admin dashboard.
        
        Returns:
            Dictionary with data statistics
        """
        try:
            # This would query Supabase for stats
            # For now, return placeholder
            return {
                "total_users": 0,
                "total_conversations": 0,
                "total_messages": 0,
                "oldest_data_date": None
            }
        
        except Exception as e:
            logger.error(f"Error fetching data statistics: {str(e)}")
            return {}


# Create singleton instance
data_cleanup = DataCleanup()
