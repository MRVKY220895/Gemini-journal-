"""
Isolated User Storage Layer.
Guarantees absolute per-user data isolation. Every query and mutation is
strictly filtered and partitioned by the cryptographically verified user_id.
Zero cross-tenant leakage.
"""

import os
import sqlite3
import json
import uuid
import time
import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger("storage.user_storage")


class IsolatedUserStorage:
    """
    Storage manager with strict user_id boundary enforcement.
    Stores data in isolated user collections.
    """

    def __init__(self, db_path: str = "data/isolated_store.db"):
        self.db_path = db_path
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        self._init_db()
        self._seed_alice_if_empty()

    def _get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        with self._get_connection() as conn:
            cursor = conn.cursor()

            # Sessions table (Partitioned by user_id)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS sessions (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    title TEXT NOT NULL,
                    persona TEXT NOT NULL,
                    created_at REAL NOT NULL,
                    updated_at REAL NOT NULL
                )
            """)
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id)")

            # Messages table (Partitioned by user_id & session_id)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS messages (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    session_id TEXT NOT NULL,
                    role TEXT NOT NULL,
                    content TEXT NOT NULL,
                    cognitive_data TEXT,
                    created_at REAL NOT NULL,
                    FOREIGN KEY(session_id) REFERENCES sessions(id) ON DELETE CASCADE
                )
            """)
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_messages_user ON messages(user_id, session_id)")

            # Journals table (Partitioned by user_id)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS journals (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    title TEXT NOT NULL,
                    content TEXT NOT NULL,
                    persona TEXT DEFAULT 'cbt_reflector',
                    tags TEXT DEFAULT '[]',
                    mood TEXT DEFAULT 'neutral',
                    insights_json TEXT,
                    is_encrypted INTEGER DEFAULT 0,
                    created_at REAL NOT NULL,
                    updated_at REAL NOT NULL
                )
            """)
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_journals_user ON journals(user_id)")

            # Cognitive Analytics table (Partitioned by user_id)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS analytics (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    session_id TEXT,
                    mood_scores TEXT NOT NULL,
                    distortions TEXT,
                    action_items TEXT,
                    created_at REAL NOT NULL
                )
            """)
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_analytics_user ON analytics(user_id)")

            # User Persona & Cognitive Identity table (Partitioned by user_id)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS user_personas (
                    user_id TEXT PRIMARY KEY,
                    persona_json TEXT NOT NULL,
                    updated_at REAL NOT NULL
                )
            """)


            conn.commit()
            logger.info("Isolated User Storage database initialized with strict tenant indexes.")

    # =========================================================================
    # SESSIONS & MULTI-TURN CHAT (USER ISOLATED)
    # =========================================================================

    def create_or_get_session(self, user_id: str, session_id: Optional[str], persona: str = "cbt_reflector", title: Optional[str] = None) -> Dict[str, Any]:
        """Creates or retrieves a chat session, strictly verifying user ownership."""
        now = time.time()
        with self._get_connection() as conn:
            cursor = conn.cursor()
            if session_id:
                cursor.execute("SELECT * FROM sessions WHERE id = ? AND user_id = ?", (session_id, user_id))
                row = cursor.fetchone()
                if row:
                    return dict(row)

            # Generate new session
            new_id = session_id or str(uuid.uuid4())
            sess_title = title or f"Session {time.strftime('%b %d, %H:%M')}"
            cursor.execute(
                "INSERT INTO sessions (id, user_id, title, persona, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
                (new_id, user_id, sess_title, persona, now, now)
            )
            conn.commit()
            return {
                "id": new_id,
                "user_id": user_id,
                "title": sess_title,
                "persona": persona,
                "created_at": now,
                "updated_at": now
            }

    def list_sessions(self, user_id: str) -> List[Dict[str, Any]]:
        """List all chat sessions belonging ONLY to the authenticated user."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM sessions WHERE user_id = ? ORDER BY updated_at DESC", (user_id,))
            return [dict(row) for row in cursor.fetchall()]

    def save_message(self, user_id: str, session_id: str, role: str, content: str, cognitive_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Saves a message strictly tagged with the user's verified UID."""
        msg_id = str(uuid.uuid4())
        now = time.time()
        cog_str = json.dumps(cognitive_data) if cognitive_data else None

        with self._get_connection() as conn:
            cursor = conn.cursor()
            # Verify session belongs to user
            cursor.execute("SELECT id FROM sessions WHERE id = ? AND user_id = ?", (session_id, user_id))
            if not cursor.fetchone():
                self.create_or_get_session(user_id, session_id)

            cursor.execute(
                "INSERT INTO messages (id, user_id, session_id, role, content, cognitive_data, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (msg_id, user_id, session_id, role, content, cog_str, now)
            )
            # Update session timestamp
            cursor.execute("UPDATE sessions SET updated_at = ? WHERE id = ? AND user_id = ?", (now, session_id, user_id))
            conn.commit()

        return {
            "id": msg_id,
            "user_id": user_id,
            "session_id": session_id,
            "role": role,
            "content": content,
            "cognitive_data": cognitive_data,
            "created_at": now
        }

    def get_messages(self, user_id: str, session_id: str) -> List[Dict[str, Any]]:
        """Retrieve conversation history strictly for the authenticated user."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT * FROM messages WHERE user_id = ? AND session_id = ? ORDER BY created_at ASC",
                (user_id, session_id)
            )
            results = []
            for row in cursor.fetchall():
                d = dict(row)
                if d.get("cognitive_data"):
                    try:
                        d["cognitive_data"] = json.loads(d["cognitive_data"])
                    except Exception:
                        pass
                results.append(d)
            return results

    # =========================================================================
    # JOURNALS (USER ISOLATED)
    # =========================================================================

    def create_journal(
        self,
        user_id: str,
        title: str,
        content: str,
        persona: str = "cbt_reflector",
        tags: Optional[List[str]] = None,
        mood: str = "neutral",
        insights: Optional[Dict[str, Any]] = None,
        is_encrypted: bool = False
    ) -> Dict[str, Any]:
        """Create a new journal entry strictly isolated to the user."""
        journal_id = str(uuid.uuid4())
        now = time.time()
        tags_str = json.dumps(tags or [])
        insights_str = json.dumps(insights or {})

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """INSERT INTO journals 
                   (id, user_id, title, content, persona, tags, mood, insights_json, is_encrypted, created_at, updated_at) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (journal_id, user_id, title, content, persona, tags_str, mood, insights_str, 1 if is_encrypted else 0, now, now)
            )
            conn.commit()

        return {
            "id": journal_id,
            "user_id": user_id,
            "title": title,
            "content": content,
            "persona": persona,
            "tags": tags or [],
            "mood": mood,
            "insights": insights or {},
            "is_encrypted": is_encrypted,
            "created_at": now,
            "updated_at": now
        }

    def list_journals(self, user_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """List all journal entries belonging ONLY to the requesting user."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT * FROM journals WHERE user_id = ? ORDER BY created_at DESC LIMIT ?",
                (user_id, limit)
            )
            entries = []
            for row in cursor.fetchall():
                d = dict(row)
                d["tags"] = json.loads(d.get("tags") or "[]")
                d["insights"] = json.loads(d.get("insights_json") or "{}")
                d["is_encrypted"] = bool(d.get("is_encrypted"))
                del d["insights_json"]
                entries.append(d)
            return entries

    def get_journal(self, user_id: str, journal_id: str) -> Optional[Dict[str, Any]]:
        """Get a single journal entry, strictly checking that user_id matches."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT * FROM journals WHERE id = ? AND user_id = ?",
                (journal_id, user_id)
            )
            row = cursor.fetchone()
            if not row:
                return None
            d = dict(row)
            d["tags"] = json.loads(d.get("tags") or "[]")
            d["insights"] = json.loads(d.get("insights_json") or "{}")
            d["is_encrypted"] = bool(d.get("is_encrypted"))
            del d["insights_json"]
            return d

    def update_journal(
        self,
        user_id: str,
        journal_id: str,
        title: Optional[str] = None,
        content: Optional[str] = None,
        persona: Optional[str] = None,
        tags: Optional[List[str]] = None,
        mood: Optional[str] = None,
        is_encrypted: Optional[bool] = None
    ) -> Optional[Dict[str, Any]]:
        """Update an existing journal entry in-place strictly matching user_id."""
        existing = self.get_journal(user_id, journal_id)
        if not existing:
            return None

        now = time.time()
        new_title = title if title is not None else existing["title"]
        new_content = content if content is not None else existing["content"]
        new_persona = persona if persona is not None else existing.get("persona", "cbt_reflector")
        new_tags = tags if tags is not None else existing.get("tags", [])
        new_mood = mood if mood is not None else existing.get("mood", "Calm")
        new_encrypted = is_encrypted if is_encrypted is not None else existing.get("is_encrypted", False)

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """UPDATE journals 
                   SET title = ?, content = ?, persona = ?, tags = ?, mood = ?, is_encrypted = ?, updated_at = ?
                   WHERE id = ? AND user_id = ?""",
                (new_title, new_content, new_persona, json.dumps(new_tags), new_mood, 1 if new_encrypted else 0, now, journal_id, user_id)
            )
            conn.commit()

        return self.get_journal(user_id, journal_id)

    def delete_journal(self, user_id: str, journal_id: str) -> bool:
        """Delete a journal entry strictly matching user_id."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM journals WHERE id = ? AND user_id = ?", (journal_id, user_id))
            conn.commit()
            return cursor.rowcount > 0

    # =========================================================================
    # COGNITIVE ANALYTICS & INSIGHTS (USER ISOLATED)
    # =========================================================================

    def record_analytics(
        self,
        user_id: str,
        mood_scores: Dict[str, float],
        distortions: Optional[List[str]] = None,
        action_items: Optional[List[str]] = None,
        session_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Record cognitive metrics for the user."""
        metric_id = str(uuid.uuid4())
        now = time.time()
        mood_str = json.dumps(mood_scores)
        dist_str = json.dumps(distortions or [])
        actions_str = json.dumps(action_items or [])

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """INSERT INTO analytics 
                   (id, user_id, session_id, mood_scores, distortions, action_items, created_at) 
                   VALUES (?, ?, ?, ?, ?, ?, ?)""",
                (metric_id, user_id, session_id, mood_str, dist_str, actions_str, now)
            )
            conn.commit()

        return {
            "id": metric_id,
            "user_id": user_id,
            "session_id": session_id,
            "mood_scores": mood_scores,
            "distortions": distortions or [],
            "action_items": action_items or [],
            "created_at": now
        }

    def get_analytics_summary(self, user_id: str) -> Dict[str, Any]:
        """
        Aggregate cognitive trends (emotions, distortion frequency, recent action items)
        strictly for the calling user.
        """
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT * FROM analytics WHERE user_id = ? ORDER BY created_at ASC",
                (user_id,)
            )
            records = cursor.fetchall()

        if not records:
            return {
                "total_entries": 0,
                "average_mood": {"Joy": 60, "Clarity": 65, "Resilience": 70, "Focus": 65, "Calm": 70, "Optimism": 60},
                "distortion_frequencies": {},
                "recent_actions": [],
                "timeline": []
            }

        mood_aggregates = {"Joy": 0.0, "Clarity": 0.0, "Resilience": 0.0, "Focus": 0.0, "Calm": 0.0, "Optimism": 0.0}
        distortion_counts = {}
        all_actions = []
        timeline = []

        count = len(records)
        for r in records:
            moods = json.loads(r["mood_scores"] or "{}")
            distortions = json.loads(r["distortions"] or "[]")
            actions = json.loads(r["action_items"] or "[]")

            for k in mood_aggregates:
                mood_aggregates[k] += float(moods.get(k, 50.0))

            for d in distortions:
                distortion_counts[d] = distortion_counts.get(d, 0) + 1

            all_actions.extend(actions)
            timeline.append({
                "timestamp": r["created_at"],
                "date": time.strftime("%b %d", time.localtime(r["created_at"])),
                "mood_scores": moods
            })

        avg_mood = {k: round(v / count, 1) for k, v in mood_aggregates.items()}

        return {
            "total_entries": count,
            "average_mood": avg_mood,
            "distortion_frequencies": distortion_counts,
            "recent_actions": all_actions[-10:],
            "timeline": timeline[-15:]
        }


    # =========================================================================
    # USER PERSONA & COGNITIVE IDENTITY (USER ISOLATED)
    # =========================================================================

    def get_user_persona(self, user_id: str) -> Dict[str, Any]:
        """Retrieves the synthesized user persona for the specific user."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT persona_json, updated_at FROM user_personas WHERE user_id = ?", (user_id,))
            row = cursor.fetchone()
            if row:
                try:
                    data = json.loads(row["persona_json"])
                    data["last_updated"] = row["updated_at"]
                    return data
                except Exception as e:
                    logger.warning(f"Error parsing persona JSON for {user_id}: {e}")

        # Default initial persona structure
        return {
            "user_id": user_id,
            "archetype": "Reflective Builder & Mindful Practitioner",
            "core_values": ["Deep Craftsmanship", "High Agency", "Emotional Clarity", "Continuous Growth"],
            "reflection_style": "Analytical, structured, constructive with bulleted action steps and gentle inquiry",
            "recurring_themes": ["Product architecture", "Focus discipline", "Cognitive clarity", "Habit consistency"],
            "triggers_and_stressors": ["Context switching", "Overwhelm from multitasking", "Ambiguity in sprint goals"],
            "current_milestones": ["Ship deterministic architecture", "Maintain daily reflection streak"],
            "personal_rules": ["Direct, high-empathy communication", "Action-oriented reframing", "Zero toxic positivity"],
            "last_updated": time.time(),
            "synthesis_count": 0
        }

    def save_user_persona(self, user_id: str, persona_data: Dict[str, Any]) -> Dict[str, Any]:
        """Saves or updates the synthesized user persona."""
        now = time.time()
        persona_data["user_id"] = user_id
        persona_data["last_updated"] = now
        json_str = json.dumps(persona_data)

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO user_personas (user_id, persona_json, updated_at)
                VALUES (?, ?, ?)
                ON CONFLICT(user_id) DO UPDATE SET
                    persona_json = excluded.persona_json,
                    updated_at = excluded.updated_at
            """, (user_id, json_str, now))
            conn.commit()

        logger.info(f"User persona updated for user_id={user_id}")
        return persona_data

    def reset_user_data(self, user_id: str) -> Dict[str, Any]:
        """
        Permanently wipes all sessions, messages, journals, and analytics
        strictly for the calling user. Irreversible factory reset.
        """
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM messages WHERE user_id = ?", (user_id,))
            cursor.execute("DELETE FROM sessions WHERE user_id = ?", (user_id,))
            cursor.execute("DELETE FROM journals WHERE user_id = ?", (user_id,))
            cursor.execute("DELETE FROM analytics WHERE user_id = ?", (user_id,))
            cursor.execute("DELETE FROM user_personas WHERE user_id = ?", (user_id,))
            conn.commit()
            logger.info(f"All isolated data permanently wiped for user_id={user_id}")

        return {
            "success": True,
            "user_id": user_id,
            "message": "All user journals, chats, sessions, and analytics permanently erased."
        }


# Global isolated storage instance
    def _seed_alice_if_empty(self):
        """Seeds Alice (Demo Sandbox) with realistic, contextually rich journals and cognitive analytics."""
        user_id = "user_alice"
        now = time.time()
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) as count FROM journals WHERE user_id = ?", (user_id,))
            if cursor.fetchone()["count"] < 4:
                # Wipe any sparse partial demo records for user_alice
                cursor.execute("DELETE FROM journals WHERE user_id = ?", (user_id,))
                cursor.execute("DELETE FROM analytics WHERE user_id = ?", (user_id,))
                alice_journals = [
                    (
                        "alice_j1", user_id, "[08:15] Morning Focus: System Architecture & Deterministic State",
                        "Setting my deep work intention for today: implementing the zero-knowledge client encryption vault and clean sub-track navigation. Feeling focused and centered.",
                        "cbt_reflector", json.dumps(["Architecture", "Focus", "Engineering"]), "Focused",
                        json.dumps({
                            "mood_scores": {"Joy": 85, "Clarity": 95, "Resilience": 90, "Focus": 95, "Calm": 88, "Optimism": 90},
                            "detected_distortions": [],
                            "cognitive_reframing": "Deconstruct complex architectural challenges into deterministic milestones.",
                            "action_items": ["Implement clean state isolation", "Validate 0ms in-place edit performance"]
                        }),
                        0, now - 3600 * 12, now - 3600 * 12
                    ),
                    (
                        "alice_j2", user_id, "[11:30] Midday Sprint: Mindful Engineering & Code Review",
                        "Reviewed sprint tasks and resolved edge cases in the mobile modal view. When a minor state collision popped up, I stayed calm and systematically debugged the scope.",
                        "cbt_reflector", json.dumps(["Sprint", "Clarity", "Review"]), "Clarity",
                        json.dumps({
                            "mood_scores": {"Joy": 80, "Clarity": 92, "Resilience": 88, "Focus": 90, "Calm": 85, "Optimism": 88},
                            "detected_distortions": ["Catastrophizing"],
                            "cognitive_reframing": "Embrace peer code reviews as collaborative craftsmanship rather than personal friction.",
                            "action_items": ["Unify global variable scopes", "Maintain 100% test coverage"]
                        }),
                        0, now - 3600 * 8, now - 3600 * 8
                    ),
                    (
                        "alice_j3", user_id, "[14:45] Afternoon Nature Walk & Neural Reset",
                        "Took a 20-minute mindful walk outdoors. Stepping away from the screen refreshed my mental equilibrium and provided clarity for the remaining milestones.",
                        "cbt_reflector", json.dumps(["Wellness", "Mindfulness", "Walk"]), "Calm",
                        json.dumps({
                            "mood_scores": {"Joy": 90, "Clarity": 90, "Resilience": 92, "Focus": 85, "Calm": 95, "Optimism": 92},
                            "detected_distortions": [],
                            "cognitive_reframing": "Physical movement and fresh air directly compound creative problem-solving by over 40%.",
                            "action_items": ["Maintain 20m daily walk streak", "Stay hydrated throughout deep work"]
                        }),
                        0, now - 3600 * 5, now - 3600 * 5
                    ),
                    (
                        "alice_j4", user_id, "[17:30] Evening Retrospective & High-Agency Grounding",
                        "Shipped all planned deliverables for today. Reflected on how focusing strictly on what is within direct control eliminates unnecessary anxiety.",
                        "cbt_reflector", json.dumps(["Stoic", "Retrospective", "Agency"]), "Fulfilled",
                        json.dumps({
                            "mood_scores": {"Joy": 92, "Clarity": 94, "Resilience": 95, "Focus": 90, "Calm": 92, "Optimism": 94},
                            "detected_distortions": [],
                            "cognitive_reframing": "Focus on the process, daily habits, and steady execution. Agency compounds effortlessly over time.",
                            "action_items": ["Celebrate shipped milestones", "Prepare restful evening wind-down"]
                        }),
                        0, now - 3600 * 2, now - 3600 * 2
                    )
                ]

                cursor.executemany("""
                    INSERT INTO journals (id, user_id, title, content, persona, tags, mood, insights_json, is_encrypted, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, alice_journals)

                # Seed analytics
                for j in alice_journals:
                    insights = json.loads(j[7])
                    cursor.execute("""
                        INSERT INTO analytics (id, user_id, session_id, mood_scores, distortions, action_items, created_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    """, (str(uuid.uuid4()), user_id, "session_seed", json.dumps(insights["mood_scores"]), json.dumps(insights["detected_distortions"]), json.dumps(insights["action_items"]), j[9]))

                conn.commit()
                logger.info("Successfully auto-seeded rich realistic demo journals for user_alice")


# Global isolated storage instance
isolated_storage = IsolatedUserStorage()
