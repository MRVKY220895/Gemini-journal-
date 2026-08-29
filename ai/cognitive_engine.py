"""
MindPulse: AI Cognitive Journaling & Emotion Intelligence Matrix.
Original Feature Enhancement:
Extracts multi-dimensional emotional state vectors, CBT cognitive distortions,
reframing prompts, and actionable micro-commitments from user reflections.
"""

import json
import logging
import re
from typing import Dict, Any, List, Optional
from security.secret_manager import secret_manager

logger = logging.getLogger("ai.cognitive_engine")

COGNITIVE_DISTORTION_PATTERNS = {
    "Catastrophizing": [r"\bruined\b", r"\bdisaster\b", r"\bworst thing\b", r"\beverything is failing\b", r"\bhopeless\b"],
    "All-or-Nothing": [r"\balways\b", r"\bnever\b", r"\bcomplete failure\b", r"\btotal mess\b", r"\bperfect or nothing\b"],
    "Mind Reading": [r"\bthey think I\b", r"\beveryone hates\b", r"\bthey must think\b", r"\bjudging me\b"],
    "Emotional Reasoning": [r"\bI feel like a failure so I am\b", r"\bI feel stupid\b", r"\bfeels impossible\b"],
    "Should Statements": [r"\bI should have\b", r"\bI must\b", r"\bI ought to\b", r"\bI have to be perfect\b"],
    "Overgeneralization": [r"\bnothing ever works\b", r"\bevery single time\b", r"\bno one cares\b"]
}


class CognitiveEngine:
    """Extracts cognitive metadata and emotional intelligence from journal text."""

    def __init__(self):
        self.api_key = secret_manager.get_gemini_api_key()

    def _is_valid_live_key(self) -> bool:
        k = secret_manager.get_gemini_api_key()
        return bool(k and not k.startswith("your_") and not k.startswith("mock_") and len(k) > 20)

    def analyze_reflection(self, text: str, persona: str = "cbt_reflector") -> Dict[str, Any]:
        """
        Performs in-depth cognitive extraction on the user's reflection.
        Returns mood dimensions (0-100), detected distortions, reframing, and action items.
        """
        # If live Gemini API key is available, attempt structured JSON schema extraction
        if self._is_valid_live_key():
            try:
                from google import genai
                client = genai.Client(api_key=secret_manager.get_gemini_api_key())

                prompt = (
                    "Analyze the following journal entry from a cognitive psychology perspective. "
                    "Output ONLY a valid JSON object matching this schema:\n"
                    "{\n"
                    '  "mood_scores": {"Joy": float, "Clarity": float, "Resilience": float, "Focus": float, "Calm": float, "Optimism": float},\n'
                    '  "primary_emotion": string,\n'
                    '  "detected_distortions": [string],\n'
                    '  "cognitive_reframing": string,\n'
                    '  "action_items": [string],\n'
                    '  "key_insight": string\n'
                    "}\n\n"
                    f"Journal Entry:\n{text}"
                )

                response = client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=prompt,
                    config={"response_mime_type": "application/json", "temperature": 0.2}
                )

                if response and response.text:
                    parsed = json.loads(response.text.strip())
                    return self._normalize_analysis_result(parsed)
            except Exception as e:
                logger.warning(f"Live Gemini cognitive extraction fallback: {e}")

        # Local High-Fidelity Heuristic Analysis Fallback
        return self._heuristic_cognitive_analysis(text, persona)

    def _heuristic_cognitive_analysis(self, text: str, persona: str) -> Dict[str, Any]:
        """Performs NLP-based cognitive analysis when API key is offline."""
        lowered = text.lower()
        word_count = len(re.findall(r"\w+", text))

        # Detect distortions
        detected_distortions = []
        for dist_name, patterns in COGNITIVE_DISTORTION_PATTERNS.items():
            if any(re.search(pat, lowered) for pat in patterns):
                detected_distortions.append(dist_name)

        # Baseline mood calculations
        base_clarity = min(95, max(40, 50 + int(word_count * 0.4)))
        base_resilience = 75 if not detected_distortions else max(45, 75 - (len(detected_distortions) * 10))
        base_calm = 70 if "anxious" not in lowered and "stress" not in lowered else 40
        base_focus = 70 if "focus" in lowered or "plan" in lowered else 60
        base_joy = 70 if "happy" in lowered or "grateful" in lowered or "excited" in lowered else 55
        base_optimism = 65 if "hope" in lowered or "future" in lowered else 58

        if "stuck" in lowered or "tired" in lowered:
            base_calm -= 10
            base_clarity -= 10

        mood_scores = {
            "Joy": round(float(base_joy), 1),
            "Clarity": round(float(base_clarity), 1),
            "Resilience": round(float(base_resilience), 1),
            "Focus": round(float(base_focus), 1),
            "Calm": round(float(base_calm), 1),
            "Optimism": round(float(base_optimism), 1)
        }

        # Reframing advice
        reframing = "Focus on what is within your direct locus of control today."
        if "Catastrophizing" in detected_distortions:
            reframing = "Notice if you are predicting the worst-case scenario. What is the most realistic, probable outcome?"
        elif "All-or-Nothing" in detected_distortions:
            reframing = "Growth happens in shades of grey. Acknowledge the micro-progress made rather than demanding perfection."
        elif "Should Statements" in detected_distortions:
            reframing = "Replace 'I should' with 'I choose to' or 'I would prefer to', reducing self-imposed guilt."

        # Action items synthesis
        action_items = []
        if "plan" in lowered or "goal" in lowered:
            action_items.append("Break the core objective into 3 small sequential milestones.")
        if detected_distortions:
            action_items.append("Practice 3 minutes of mindful breathing when notice self-criticism arising.")
        action_items.append("Revisit this reflection tomorrow to track emotional clarity evolution.")

        return {
            "mood_scores": mood_scores,
            "primary_emotion": "Reflective Clarity" if base_clarity > 60 else "Seeking Direction",
            "detected_distortions": detected_distortions,
            "cognitive_reframing": reframing,
            "action_items": action_items,
            "key_insight": f"Processed {word_count} words with balanced emotional resilience."
        }

    def _normalize_analysis_result(self, raw: Dict[str, Any]) -> Dict[str, Any]:
        """Validates and bounds cognitive score structures."""
        moods = raw.get("mood_scores", {})
        default_moods = {"Joy": 60.0, "Clarity": 65.0, "Resilience": 70.0, "Focus": 65.0, "Calm": 60.0, "Optimism": 65.0}

        cleaned_moods = {}
        for k in default_moods:
            val = moods.get(k, default_moods[k])
            cleaned_moods[k] = round(float(max(0, min(100, val))), 1)

        return {
            "mood_scores": cleaned_moods,
            "primary_emotion": raw.get("primary_emotion", "Reflective"),
            "detected_distortions": raw.get("detected_distortions", []),
            "cognitive_reframing": raw.get("cognitive_reframing", "Embrace clarity and gradual progress."),
            "action_items": raw.get("action_items", ["Take one purposeful action today."]),
            "key_insight": raw.get("key_insight", "Meaningful self-awareness unlocked through reflection.")
        }


# Global Cognitive Engine instance
cognitive_engine = CognitiveEngine()
