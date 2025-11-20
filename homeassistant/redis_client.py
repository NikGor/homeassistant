import json
import logging
from datetime import datetime
from typing import Any
import redis
from django.conf import settings
from archie_shared.user.models import UserState

logger = logging.getLogger(__name__)


class RedisClient:
    """Redis client for user state caching"""

    def __init__(self):
        self.redis_client = redis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            db=settings.REDIS_DB,
            decode_responses=True
        )

    def _get_user_key(self, user_id: str) -> str:
        """Generates key for user state"""
        return f"user_state:{user_id}"

    def get_user_state(self, user_id: str) -> UserState | None:
        """Gets user state from Redis"""
        try:
            key = self._get_user_key(user_id)
            data = self.redis_client.get(key)

            if data:
                state_dict = json.loads(data)
                return UserState(**state_dict)
            return None

        except Exception as e:
            logger.error(f"redis_client_001: Error getting user state {user_id}: {e}")
            return None

    def set_user_state(
        self, user_id: str, state: UserState, ttl: int | None = None
    ) -> bool:
        """
        Saves user state to Redis

        Args:
            user_id: User ID
            state: User state
            ttl: Time to live in seconds (default: None)
        """
        try:
            key = self._get_user_key(user_id)
            data = state.model_dump_json()

            if ttl:
                self.redis_client.setex(key, ttl, data)
            else:
                self.redis_client.set(key, data)

            return True

        except Exception as e:
            logger.error(f"redis_client_002: Error saving user state {user_id}: {e}")
            return False

    def update_user_state(
        self, user_id: str, updates: dict[str, Any], ttl: int | None = None
    ) -> bool:
        """
        Partially updates user state

        Args:
            user_id: User ID
            updates: Dictionary with updates
            ttl: Record lifetime in seconds
        """
        try:
            current_state = self.get_user_state(user_id)

            if current_state is None:
                # Create new state if it doesn't exist
                current_state = UserState(user_id=user_id)

            # Update fields
            state_dict = current_state.model_dump()
            state_dict.update(updates)

            updated_state = UserState(**state_dict)
            return self.set_user_state(user_id, updated_state, ttl)

        except Exception as e:
            logger.error(f"redis_client_003: Error updating user state {user_id}: {e}")
            return False

    def delete_user_state(self, user_id: str) -> bool:
        """Deletes user state from Redis"""
        try:
            key = self._get_user_key(user_id)
            result = self.redis_client.delete(key)
            return result > 0

        except Exception as e:
            logger.error(f"redis_client_004: Error deleting user state {user_id}: {e}")
            return False

    def get_user_field(self, user_id: str, field: str) -> Any | None:
        """Gets specific field from user state"""
        state = self.get_user_state(user_id)
        if state:
            return getattr(state, field, None)
        return None

    def set_user_field(
        self, user_id: str, field: str, value: Any, ttl: int | None = None
    ) -> bool:
        """Sets specific field in user state"""
        return self.update_user_state(user_id, {field: value}, ttl)

    def update_current_datetime(self, user_id: str) -> bool:
        """Updates current date and time for user"""
        now = datetime.now()
        updates = {
            "current_date": now.strftime("%Y-%m-%d"),
            "current_time": now.strftime("%H:%M:%S"),
            "current_weekday": now.strftime("%A"),
        }
        return self.update_user_state(user_id, updates)

    def ping(self) -> bool:
        """Check Redis connection"""
        try:
            return self.redis_client.ping()
        except Exception as e:
            logger.error(f"redis_client_005: Redis connection error: {e}")
            return False


# Global client instance
redis_client = RedisClient()
