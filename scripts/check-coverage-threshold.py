#!/usr/bin/env python3
"""Verifica cobertura de linhas (merge de vários coverage.cobertura.xml) para Domain e Application."""

from __future__ import annotations

import glob
import sys
import xml.etree.ElementTree as ET

THRESHOLD_PERCENT = 60.0
ASSEMBLIES = ("Finalproj.Domain", "Finalproj.Application")


def merge_line_hits(paths: list[str]) -> dict[tuple[str, str], int]:
    line_hits: dict[tuple[str, str], int] = {}
    for path in paths:
        root = ET.parse(path).getroot()
        for cls in root.iter("class"):
            filename = cls.attrib.get("filename", "").replace("\\", "/")
            for line in cls.findall("lines/line"):
                num = line.attrib.get("number")
                if num is None:
                    continue
                key = (filename, num)
                hits = int(line.attrib.get("hits", "0"))
                line_hits[key] = max(line_hits.get(key, 0), hits)
    return line_hits


def assembly_coverage(line_hits: dict[tuple[str, str], int], assembly: str) -> tuple[int, int, float]:
    covered = total = 0
    for (filename, _), hits in line_hits.items():
        if assembly not in filename:
            continue
        total += 1
        if hits > 0:
            covered += 1
    percent = (covered / total * 100.0) if total else 0.0
    return covered, total, percent


def passes_threshold(covered: int, total: int, threshold_percent: float) -> bool:
    if total == 0:
        return True
    return covered * 100 >= total * threshold_percent


def main() -> int:
    pattern = sys.argv[1] if len(sys.argv) > 1 else "TestResults/**/coverage.cobertura.xml"
    paths = glob.glob(pattern, recursive=True)
    if not paths:
        print(f"::error::Sem ficheiros de cobertura em {pattern}")
        return 1

    line_hits = merge_line_hits(paths)
    failed = False

    print("Cobertura (merge unitários + integração):")
    for assembly in ASSEMBLIES:
        covered, total, percent = assembly_coverage(line_hits, assembly)
        status = "OK" if passes_threshold(covered, total, THRESHOLD_PERCENT) else "FAIL"
        print(f"  {assembly}: {covered}/{total} = {percent:.1f}% [{status}]")
        if not passes_threshold(covered, total, THRESHOLD_PERCENT):
            failed = True
            missing = int(total * THRESHOLD_PERCENT / 100) - covered
            print(
                f"::error::{assembly} abaixo de {THRESHOLD_PERCENT:.0f}% "
                f"(faltam ~{max(missing, 0)} linhas cobertas)."
            )

    if failed:
        return 1

    print(f"Threshold {THRESHOLD_PERCENT:.0f}% cumprido para {', '.join(ASSEMBLIES)}.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
