"""Inventory JSON overrides in the downloaded faction sources; never writes game data."""

import argparse
import hashlib
import json
from pathlib import Path


SOURCES = (
    ("Legion", "com.pa.legion-expansion-server"),
    ("Exiles", "com.pa.nik.exiles"),
    ("Bugs", "com.pa.ferretmaster.bugs"),
    ("Second Wave", "pa.mla.unit.addon"),
)
LISTS = {"unit_list.json", "unit_list_legion.json", "commander_list.json"}


def read(path):
    return json.loads(path.read_text(encoding="utf-8-sig"))


def differences(before, after, pointer=""):
    if isinstance(before, dict) and isinstance(after, dict):
        result = []
        for key in sorted(before.keys() | after.keys()):
            child = pointer + "/" + key.replace("~", "~0").replace("/", "~1")
            if key not in before:
                result.append({"path": child, "added": after[key]})
            elif key not in after:
                result.append({"path": child, "removed": before[key]})
            else:
                result.extend(differences(before[key], after[key], child))
        return result
    if before != after:
        return [{"path": pointer, "before": before, "after": after}]
    return []


def audit(sources, game, integrated):
    inventories = {}
    metadata = []
    for label, folder in SOURCES:
        root = sources / folder
        manifest = read(root / "modinfo.json")
        files = sorted((root / "pa").rglob("*.json"))
        if not files:
            raise ValueError(f"No pa JSON files in {root}")
        inventories[label] = {p.relative_to(root).as_posix(): p for p in files}
        digest = hashlib.sha256()
        for relative, path in inventories[label].items():
            digest.update(relative.encode("utf-8") + b"\0" + path.read_bytes() + b"\0")
        metadata.append({"source": label, "folder": folder, "version": manifest["version"],
                         "json_files": len(files), "pa_json_sha256": digest.hexdigest()})

    records = []
    earlier = {}
    for label, _ in SOURCES:
        for relative, source in inventories[label].items():
            # TITANS supplies complete specs at the equivalent pa_ex1 path.
            expansion = game / "pa_ex1" / relative.removeprefix("pa/")
            vanilla = game / relative
            if expansion.is_file() or vanilla.is_file():
                owner, baseline = "MLA/TITANS", expansion if expansion.is_file() else vanilla
            elif relative in earlier:
                owner, baseline = earlier[relative]
            else:
                continue
            path = Path(relative)
            category = "list" if path.name in LISTS else "AI" if relative.startswith("pa/ai/") else "spec"
            original, incoming = read(baseline), read(source)
            target = integrated / relative
            relocation = None
            if label == "Exiles" and path.name in {
                "bomber_ammo.json", "bomber_heavy_ammo.json", "artillery_long_ammo.json",
                "artillery_short_ammo.json", "tank_heavy_mortar_ammo.json",
            }:
                relocation = integrated / "pa/ammo/exiles_compat" / path.parent.name / path.name
            elif label == "Bugs" and category == "AI":
                relocation = integrated / path.parent / "bugs" / path.name
            current = read(target) if target.is_file() else None
            status = ("missing" if current is None else "source" if current == incoming
                      else "baseline" if current == original else "different")
            record = {"source": label, "path": relative, "category": category,
                      "baseline": owner, "baseline_path": str(baseline), "integrated": status,
                      "changes": differences(original, incoming)}
            if current is not None:
                record["source_to_integrated"] = differences(incoming, current)
            if relocation is not None and relocation.is_file():
                record["relocated_path"] = relocation.relative_to(integrated).as_posix()
                record["source_to_relocated"] = differences(incoming, read(relocation))
            records.append(record)
        # The first provider identifies non-vanilla collisions, not mod load order.
        for relative, path in inventories[label].items():
            earlier.setdefault(relative, (label, path))
    return {"sources": metadata, "overrides": records}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--sources", type=Path, required=True, help="Downloaded mod directories")
    parser.add_argument("--game", type=Path, required=True, help="Game media directory (pa and pa_ex1)")
    parser.add_argument("--integrated", type=Path, default=Path(__file__).resolve().parents[1])
    args = parser.parse_args()
    if not (args.game / "pa").is_dir() or not (args.game / "pa_ex1").is_dir():
        parser.error("--game must contain both pa and pa_ex1")
    print(json.dumps(audit(args.sources, args.game, args.integrated), ensure_ascii=False, indent=2))
