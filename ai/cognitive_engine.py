"""
MindPulse: AI Cognitive Journaling & Emotion Intelligence Matrix.
Original Feature Enhancement:
Extracts multi-dimensional emotional state vectors, CBT cognitive distortions,
semantic tags, reframing prompts, and actionable micro-commitments from user reflections.
"""

import json
import logging
import re
from typing import Dict, Any, List, Optional
from security.secret_manager import secret_manager

logger = logging.getLogger("ai.cognitive_engine")

COGNITIVE_DISTORTION_PATTERNS = {
    "Labeling & Self-Blame": [
        r"\b(i am|i'm|feeling|feel)\s+(dumb|stupid|an idiot|a loser|a failure|worthless|useless|clueless|slow|incompetent|broken)\b",
        r"\b(dumb|stupid|idiot|loser|worthless|incompetent|unworthy)\b"
    ],
    "Emotional Reasoning": [
        r"\b(feel|feeling)\s+(like a failure|dumb|stupid|hopeless|useless|terrible|lost|incapable|impossible|broken)\b",
        r"\b(feels impossible|feel like giving up|i feel it so it must be true)\b"
    ],
    "Catastrophizing": [
        r"\b(ruined|disaster|worst thing|worst case|doomed|wreck|nightmare|everything is falling apart|hopeless|end of the world)\b"
    ],
    "All-or-Nothing": [
        r"\b(always|never|every single time|complete failure|total mess|ruined everything|perfect or nothing|nobody|everybody|nothing ever)\b"
    ],
    "Mind Reading": [
        r"\b(they think|everyone thinks|they must think|judging me|they hate me|they look down on me|they think i'm|people assume)\b"
    ],
    "Should Statements": [
        r"\b(i should have|i shouldn't have|i must|i ought to|have to be perfect|should be better|why can't i just)\b"
    ],
    "Overgeneralization": [
        r"\b(nothing ever works|nobody cares|nothing goes right|always happens to me|i can never|every time i try)\b"
    ],
    "Discounting the Positive": [
        r"\b(just luck|anyone could do it|doesn't count|not good enough|doesn't matter|fluke)\b"
    ]
}

THEMATIC_TAG_PATTERNS = {
    "#SelfWorth": [r"\b(dumb|stupid|worthless|failure|confidence|imposter|insecure|not good enough|proud|value)\b"],
    "#EmotionalClarity": [r"\b(feel|emotion|confused|overwhelmed|anxious|sad|lost|numb|clarity|unpack|mind)\b"],
    "#CognitiveReframing": [r"\b(reframe|thought|perspective|assumption|belief|distortion|mindset|angle)\b"],
    "#OverwhelmAndStress": [r"\b(deadline|stress|anxiety|pressure|tired|exhausted|burnout|too much|hectic)\b"],
    "#CareerAndFocus": [r"\b(work|project|code|job|boss|team|client|goal|career|productivity|deliverable)\b"],
    "#IdeationAndCreation": [r"\b(brainstorm|idea|build|create|design|innovate|architecture|concept)\b"],
    "#MindfulGratitude": [r"\b(grateful|thankful|peace|grounded|calm|appreciate|breath|present)\b"]
}


class CognitiveEngine:
    """Extracts cognitive metadata, semantic tags, and emotional intelligence from journal text."""

    def __init__(self):
        self.api_key = secret_manager.get_gemini_api_key()

    def _is_valid_live_key(self) -> bool:
        k = secret_manager.get_gemini_api_key()
        return bool(k and not k.startswith("your_") and not k.startswith("mock_") and len(k) > 20)

    def analyze_reflection(self, text: str, persona: str = "cbt_reflector") -> Dict[str, Any]:
        """
        Performs high-speed, in-depth cognitive extraction on the user's reflection.
        Returns mood dimensions (0-100), detected distortions, semantic tags, reframing, and action items.
        """
        return self._heuristic_cognitive_analysis(text, persona)

    def _heuristic_cognitive_analysis(self, text: str, persona: str) -> Dict[str, Any]:
        """Performs robust NLP-based cognitive distortion and semantic tag analysis."""
        lowered = text.lower()
        word_count = len(re.findall(r"\w+", text))

        # 1. Detect Cognitive Distortions
        detected_distortions = []
        for dist_name, patterns in COGNITIVE_DISTORTION_PATTERNS.items():
            if any(re.search(pat, lowered) for pat in patterns):
                detected_distortions.append(dist_name)

        # 2. Extract Thematic Semantic Tags
        semantic_tags = []
        for tag_name, patterns in THEMATIC_TAG_PATTERNS.items():
            if any(re.search(pat, lowered) for pat in patterns):
                semantic_tags.append(tag_name)

        if not semantic_tags:
            semantic_tags = ["#SelfReflection", "#CognitiveClarity"]

        # 3. Dynamic Emotional Vector Calculations
        is_self_critical = any(d in ["Labeling & Self-Blame", "Emotional Reasoning"] for d in detected_distortions)
        
        base_joy = 35 if is_self_critical else (75 if any(w in lowered for w in ["happy", "grateful", "excited"]) else 55)
        base_clarity = 45 if is_self_critical else min(95, max(45, 50 + int(word_count * 0.4)))
        base_resilience = 50 if is_self_critical else max(40, 80 - (len(detected_distortions) * 12))
        base_calm = 40 if any(w in lowered for w in ["anxious", "stress", "panic", "dumb", "overwhelm"]) else 70
        base_focus = 55 if is_self_critical else (75 if "plan" in lowered or "code" in lowered else 65)
        base_optimism = 40 if is_self_critical else (70 if "hope" in lowered or "future" in lowered else 60)

        mood_scores = {
            "Joy": round(float(base_joy), 1),
            "Clarity": round(float(base_clarity), 1),
            "Resilience": round(float(base_resilience), 1),
            "Focus": round(float(base_focus), 1),
            "Calm": round(float(base_calm), 1),
            "Optimism": round(float(base_optimism), 1)
        }

        # 4. Primary Emotion Classification
        if "Labeling & Self-Blame" in detected_distortions or "dumb" in lowered:
            primary_emotion = "Vulnerable Self-Doubt"
        elif "OverwhelmAndStress" in "".join(semantic_tags) or "anxious" in lowered:
            primary_emotion = "Anxious Tension"
        elif base_clarity > 70:
            primary_emotion = "Grounded Insight"
        else:
            primary_emotion = "Seeking Direction"

        # 5. Targeted Cognitive Reframing
        if "Labeling & Self-Blame" in detected_distortions or "dumb" in lowered:
            reframing = "Feeling confused or making a mistake is an event, not your identity. Separate 'I feel challenged' from 'I am dumb'."
        elif "Catastrophizing" in detected_distortions:
            reframing = "Notice if you are predicting the worst-case scenario. What is the most realistic, probable outcome?"
        elif "All-or-Nothing" in detected_distortions:
            reframing = "Growth happens in shades of grey. Acknowledge the micro-progress made rather than demanding perfection."
        elif "Should Statements" in detected_distortions:
            reframing = "Replace 'I should' with 'I choose to' or 'I would prefer to', reducing self-imposed pressure."
        else:
            reframing = "Focus on what is directly within your circle of control today."

        # 6. Action Items Synthesis
        action_items = []
        if is_self_critical:
            action_items.append("Notice and label the inner critic as a passing thought, not objective truth.")
            action_items.append("Identify one specific concept or problem that caused confusion and break it down.")
        elif "plan" in lowered or "goal" in lowered:
            action_items.append("Break the core objective into 3 small sequential milestones.")
        action_items.append("Revisit this reflection tomorrow to evaluate emotional clarity evolution.")

        return {
            "mood_scores": mood_scores,
            "primary_emotion": primary_emotion,
            "detected_distortions": detected_distortions,
            "semantic_tags": semantic_tags,
            "cognitive_reframing": reframing,
            "action_items": action_items,
            "key_insight": f"Identified {len(detected_distortions)} cognitive pattern(s) and {len(semantic_tags)} thematic area(s)."
        }

    def _normalize_analysis_result(self, raw: Dict[str, Any], text: str) -> Dict[str, Any]:
        """Validates, bounds, and augments structured outputs."""
        moods = raw.get("mood_scores", {})
        default_moods = {"Joy": 60.0, "Clarity": 65.0, "Resilience": 70.0, "Focus": 65.0, "Calm": 60.0, "Optimism": 65.0}

        cleaned_moods = {}
        for k in default_moods:
            val = moods.get(k, default_moods[k])
            cleaned_moods[k] = round(float(max(0, min(100, val))), 1)

        tags = raw.get("semantic_tags", [])
        if not tags:
            tags = ["#SelfReflection", "#CognitiveClarity"]

        return {
            "mood_scores": cleaned_moods,
            "primary_emotion": raw.get("primary_emotion", "Reflective"),
            "detected_distortions": raw.get("detected_distortions", []),
            "semantic_tags": tags,
            "cognitive_reframing": raw.get("cognitive_reframing", "Embrace clarity and gradual progress."),
            "action_items": raw.get("action_items", ["Take one purposeful action today."]),
            "key_insight": raw.get("key_insight", "Meaningful self-awareness unlocked through reflection.")
        }


# Global Cognitive Engine instance
cognitive_engine = CognitiveEngine()
