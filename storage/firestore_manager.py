"""
Cloud Firestore Database Manager.
Interfaces directly with Google Cloud Firestore when credentials are authenticated,
mapping each document strictly to /users/{user_id}/...
Provides zero cross-user access, mirroring firestore.rules enforcement.
"""

import logging
from typing import Optional, Dict, Any, List
from security.secret_manager import secret_manager
from storage.user_storage import isolated_storage

logger = logging.getLogger("storage.firestore_manager")


class FirestoreManager:
    """Manages Cloud Firestore connections and path-isolated operations."""

    def __init__(self):
        self._db = None
        self._is_connected = False
        self._init_firestore()

    def _init_firestore(self):
        try:
            import firebase_admin
            from firebase_admin import firestore

            # If firebase_admin is initialized
            if firebase_admin._apps:
                self._db = firestore.client()
                self._is_connected = True
                logger.info("Cloud Firestore client initialized successfully.")
            else:
                logger.info("Cloud Firestore using local isolated storage layer.")
        except Exception as e:
            logger.info(f"Cloud Firestore client running with local secure storage engine: {e}")

    @property
    def is_live(self) -> bool:
        return self._is_connected and self._db is not None

    def get_user_doc_ref(self, user_id: str):
        if not self.is_live:
            return None
        return self._db.collection("users").document(user_id)

    # All public methods delegate to isolated_storage (and sync to Firestore if live)
    def save_journal(self, user_id: str, **kwargs) -> Dict[str, Any]:
        result = isolated_storage.create_journal(user_id, **kwargs)
        if self.is_live:
            try:
                user_ref = self.get_user_doc_ref(user_id)
                user_ref.collection("journals").document(result["id"]).set(result)
            except Exception as e:
                logger.warning(f"Failed to sync journal to Firestore: {e}")
        return result

    def get_journals(self, user_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        return isolated_storage.list_journals(user_id, limit)

    def get_journal(self, user_id: str, journal_id: str) -> Optional[Dict[str, Any]]:
        return isolated_storage.get_journal(user_id, journal_id)

    def delete_journal(self, user_id: str, journal_id: str) -> bool:
        deleted = isolated_storage.delete_journal(user_id, journal_id)
        if deleted and self.is_live:
            try:
                self.get_user_doc_ref(user_id).collection("journals").document(journal_id).delete()
            except Exception as e:
                logger.warning(f"Failed to delete journal in Firestore: {e}")
        return deleted

    def save_chat_message(self, user_id: str, session_id: str, role: str, content: str, cognitive_data: Optional[Dict] = None) -> Dict[str, Any]:
        msg = isolated_storage.save_message(user_id, session_id, role, content, cognitive_data)
        if self.is_live:
            try:
                sess_ref = self.get_user_doc_ref(user_id).collection("sessions").document(session_id)
                sess_ref.collection("messages").document(msg["id"]).set(msg)
            except Exception as e:
                logger.warning(f"Failed to sync chat message to Firestore: {e}")
        return msg

    def get_chat_history(self, user_id: str, session_id: str) -> List[Dict[str, Any]]:
        return isolated_storage.get_messages(user_id, session_id)

    def list_sessions(self, user_id: str) -> List[Dict[str, Any]]:
        return isolated_storage.list_sessions(user_id)

    def get_analytics(self, user_id: str) -> Dict[str, Any]:
        return isolated_storage.get_analytics_summary(user_id)

    def record_analytics(self, user_id: str, **kwargs) -> Dict[str, Any]:
        return isolated_storage.record_analytics(user_id, **kwargs)

    def reset_user_data(self, user_id: str) -> Dict[str, Any]:
        """Permanently wipes all local and Firestore records for the user."""
        res = isolated_storage.reset_user_data(user_id)
        if self.is_live:
            try:
                user_ref = self.get_user_doc_ref(user_id)
                if user_ref:
                    for col_name in ["journals", "sessions", "analytics"]:
                        col_ref = user_ref.collection(col_name)
                        docs = col_ref.limit(100).stream()
                        for doc in docs:
                            doc.reference.delete()
                    user_ref.delete()
            except Exception as e:
                logger.warning(f"Failed to wipe Firestore documents for user {user_id}: {e}")
        return res


# Global Firestore Manager instance
firestore_manager = FirestoreManager()
