import os
import json
import tempfile
import pytest
from pathlib import Path
from pipelines.validate_dataset import validate_dataset_file

def test_valid_dataset_file():
    valid_data = [
        {
            "lang": "zh",
            "term": "安全",
            "pinyin": "ānquán",
            "meaning_vi": "an toàn",
            "provenance": "provenance_hsk_2026"
        },
        {
            "lang": "en",
            "term": "safety",
            "ipa": "/ˈseɪfti/",
            "meaning_vi": "an toàn",
            "provenance": "provenance_cefr_2026"
        }
    ]
    with tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False, encoding="utf-8") as tf:
        tf.write(json.dumps(valid_data, ensure_ascii=False))
        temp_path = tf.name

    try:
        report = validate_dataset_file(temp_path)
        assert report["valid"] is True
        assert report["accepted"] == 2
        assert report["rejected"] == 0
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

def test_missing_provenance_and_pinyin_rejection():
    invalid_data = [
        {
            "lang": "zh",
            "term": "质量",
            "meaning_vi": "chất lượng"
        }
    ]
    with tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False, encoding="utf-8") as tf:
        tf.write(json.dumps(invalid_data, ensure_ascii=False))
        temp_path = tf.name

    try:
        report = validate_dataset_file(temp_path)
        assert report["valid"] is False
        assert report["rejected"] == 1
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
