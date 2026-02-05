"""
Standalone Maltego export for OSINT investigations.
Takes an in-memory entity list and writes CSV + GraphML. No Obsidian dependency.
"""
import csv
import os
import re
import xml.etree.ElementTree as ET
from typing import Optional
from pathlib import Path


MALTEGO_TYPE_MAP = {
    "domain": "maltego.Domain",
    "ip_address": "maltego.IPv4Address",
    "ip": "maltego.IPv4Address",
    "asn": "maltego.AS",
    "organization": "maltego.Organization",
    "person": "maltego.Person",
    "threat_actor": "maltego.ThreatActor",
    "technique": "maltego.Phrase",
    "vulnerability": "maltego.Vulnerability",
}


def _entity_value(e: dict) -> str:
    t = (e.get("type") or "").strip().lower()
    if t in ("domain",):
        return (e.get("domain_name") or e.get("name") or "").strip() or "unknown"
    if t in ("ip_address", "ip"):
        return (e.get("ip_address") or e.get("ip") or "").strip() or "unknown"
    if t == "asn":
        asn = e.get("asn_number") or e.get("asn") or ""
        if asn and not str(asn).upper().startswith("AS"):
            return f"AS{asn}"
        return str(asn).strip() or "unknown"
    if t == "organization":
        return (e.get("org_name") or e.get("name") or "").strip() or "unknown"
    if t == "person":
        return (e.get("person_name") or e.get("name") or "").strip() or "unknown"
    if t == "threat_actor":
        return (e.get("threat_name") or e.get("name") or "").strip() or "unknown"
    if t == "technique":
        return (e.get("technique_name") or e.get("name") or e.get("technique_id") or "").strip() or "unknown"
    if t == "vulnerability":
        return (e.get("cve_id") or e.get("cve") or e.get("vulnerability_title") or e.get("name") or "").strip() or "unknown"
    return (e.get("name") or "").strip() or "unknown"


def _entity_maltego_type(e: dict) -> str:
    t = (e.get("type") or "").strip().lower()
    return MALTEGO_TYPE_MAP.get(t, "maltego.Phrase")


def _safe_id(s: str) -> str:
    return re.sub(r"[^\w\-.]", "_", (s or "").strip())[:80] or "entity"


def export_entities_to_csv(
    entities: list[dict],
    output_path: str,
    *,
    investigation_id: str = "",
    seed: str = "",
) -> str:
    """
    Write entities to a CSV file for Maltego import (Type, Value columns).
    Returns the path written.
    """
    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    rows = []
    for e in entities:
        maltego_type = _entity_maltego_type(e)
        value = _entity_value(e)
        if not value or value == "unknown":
            continue
        rows.append({
            "Type": maltego_type,
            "Value": value,
            "Investigation": investigation_id,
            "Seed": seed,
        })
    with open(output_path, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["Type", "Value", "Investigation", "Seed"], extrasaction="ignore")
        w.writeheader()
        w.writerows(rows)
    return output_path


def export_entities_to_graphml(
    entities: list[dict],
    output_path: str,
    *,
    investigation_id: str = "",
    investigation_name: str = "",
    seed: str = "",
) -> str:
    """
    Write entities and seed to a GraphML file for Maltego or other graph tools.
    One node per entity plus a root 'investigation' node; edges from root to each entity.
    Returns the path written.
    """
    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    ns = "http://graphml.graphdrawing.org/xmlns"
    ET.register_namespace("", ns)
    root = ET.Element(f"{{{ns}}}graphml")
    root.set("xmlns", ns)

    def add_key(parent: ET.Element, id_: str, name: str, type_: str) -> None:
        key = ET.SubElement(parent, f"{{{ns}}}key", id=id_, name=name)
        key.set("attr.name", name)
        key.set("attr.type", type_)

    add_key(root, "d0", "maltego.entity.type", "string")
    add_key(root, "d1", "maltego.entity.value", "string")
    add_key(root, "d2", "label", "string")
    add_key(root, "d3", "investigation_id", "string")

    graph = ET.SubElement(root, f"{{{ns}}}graph", id="G", edgedefault="directed")
    seed_id = "seed"
    graph.append(ET.Element(f"{{{ns}}}node", id=seed_id))
    n_seed = list(graph)[-1]
    ET.SubElement(n_seed, f"{{{ns}}}data", key="d0").text = "maltego.Investigation"
    ET.SubElement(n_seed, f"{{{ns}}}data", key="d1").text = seed or investigation_name or investigation_id
    ET.SubElement(n_seed, f"{{{ns}}}data", key="d2").text = investigation_name or seed or investigation_id
    ET.SubElement(n_seed, f"{{{ns}}}data", key="d3").text = investigation_id

    seen = set()
    for i, e in enumerate(entities):
        value = _entity_value(e)
        if not value or value == "unknown":
            continue
        maltego_type = _entity_maltego_type(e)
        node_id = f"n{i}_{_safe_id(value)}"
        if node_id in seen:
            continue
        seen.add(node_id)
        graph.append(ET.Element(f"{{{ns}}}node", id=node_id))
        n = list(graph)[-1]
        ET.SubElement(n, f"{{{ns}}}data", key="d0").text = maltego_type
        ET.SubElement(n, f"{{{ns}}}data", key="d1").text = value
        ET.SubElement(n, f"{{{ns}}}data", key="d2").text = value
        ET.SubElement(n, f"{{{ns}}}data", key="d3").text = investigation_id
        edge_id = f"e_{seed_id}_{node_id}"
        graph.append(ET.Element(f"{{{ns}}}edge", id=edge_id, source=seed_id, target=node_id))

    tree = ET.ElementTree(root)
    ET.indent(tree, space="  ")
    with open(output_path, "wb") as f:
        tree.write(f, encoding="utf-8", xml_declaration=True, method="xml")
    return output_path


def export_to_maltego(
    entities: list[dict],
    output_dir: str,
    *,
    investigation_id: str,
    investigation_name: str = "",
    seed: str = "",
    csv_name: Optional[str] = None,
    graphml_name: Optional[str] = None,
) -> dict[str, str]:
    """
    Standalone Maltego export: write CSV and GraphML from entity list.
    No Obsidian or file-system scan; input is the in-memory entity list.

    Returns:
        Dict with keys 'csv_path' and 'graphml_path' (paths written).
    """
    os.makedirs(output_dir, exist_ok=True)
    inv_safe = _safe_id(investigation_id)
    csv_name = csv_name or f"{inv_safe}_maltego_entities.csv"
    graphml_name = graphml_name or f"{inv_safe}_maltego_graph.graphml"
    csv_path = os.path.join(output_dir, csv_name)
    graphml_path = os.path.join(output_dir, graphml_name)
    export_entities_to_csv(
        entities,
        csv_path,
        investigation_id=investigation_id,
        seed=seed,
    )
    export_entities_to_graphml(
        entities,
        graphml_path,
        investigation_id=investigation_id,
        investigation_name=investigation_name,
        seed=seed,
    )
    return {"csv_path": csv_path, "graphml_path": graphml_path}
