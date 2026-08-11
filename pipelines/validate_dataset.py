import json
import sys
import re
import hashlib
from pathlib import Path
from typing import Dict, List, Any

def normalize_string(s: str) -> str:
    """Strip whitespace, convert to lower case, and collapse spaces."""
    return re.sub(r'\s+', ' ', s.strip().lower())

def is_synthetic_stitching(term: str, lang: str) -> bool:
    """
    Detect suspicious mechanical stitching (e.g. repeated patterns or
    unnatural concatenation designed to fake corpus count).
    """
    if lang == "zh":
        # Reject 5+ Hanzi without punctuation if it repeats identical characters
        if len(term) >= 4 and len(set(term)) == 1:
            return True
    elif lang == "en":
        # Reject words with unnatural repeated letters like 'aaaa'
        if re.search(r'(.)\1{3,}', term):
            return True
    return False

def validate_dataset_file(filepath: str) -> Dict[str, Any]:
    path = Path(filepath)
    if not path.exists():
        return {"error": f"File {filepath} does not exist", "valid": False}

    try:
        raw_data = json.loads(path.read_text(encoding='utf-8'))
    except Exception as e:
        return {"error": f"Invalid JSON format: {str(e)}", "valid": False}

    seen_keys = set()
    accepted = []
    rejected = []
    duplicates = []
    missing_provenance = []
    malformed = []

    for idx, record in enumerate(raw_data):
        term = normalize_string(record.get('term', ''))
        lang = record.get('lang', '')
        src = record.get('provenance') or record.get('source')
        meaning = record.get('meaning_vi')

        reasons = []

        if not term:
            reasons.append("Missing term/word")
        if not src:
            reasons.append("Missing provenance/source attribution")
            missing_provenance.append(idx)
        if not meaning:
            reasons.append("Missing Vietnamese translation (meaning_vi)")

        if lang == 'zh':
            if not record.get('pinyin'):
                reasons.append("Chinese record missing Pinyin")
        elif lang == 'en':
            if not record.get('ipa'):
                reasons.append("English record missing IPA pronunciation")
        else:
            if not lang:
                reasons.append("Missing language tag (lang)")

        # Exact deduplication check via SHA-256 hash key
        key = hashlib.sha256(f"{lang}:{term}".encode('utf-8')).hexdigest()
        if key in seen_keys:
            reasons.append(f"Duplicate record key for term '{term}'")
            duplicates.append(idx)
        else:
            seen_keys.add(key)

        # Synthetic mechanical word stitching check
        if term and is_synthetic_stitching(term, lang):
            reasons.append("Suspicious synthetic word stitching detected")

        if reasons:
            rejected.append({"index": idx, "term": term, "reasons": reasons})
            malformed.append(idx)
        else:
            accepted.append(record)

    report = {
        "import_file": str(path),
        "total_imported": len(raw_data),
        "accepted": len(accepted),
        "rejected": len(rejected),
        "duplicate_count": len(duplicates),
        "missing_provenance_count": len(missing_provenance),
        "malformed_count": len(malformed),
        "valid": len(rejected) == 0,
        "sample_rejections": rejected[:10]
    }
    return report

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python pipelines/validate_dataset.py <dataset_json_file>")
        sys.exit(1)

    result = validate_dataset_file(sys.argv[1])
    print(json.dumps(result, ensure_ascii=False, indent=2))
    sys.exit(0 if result.get("valid") else 1)
