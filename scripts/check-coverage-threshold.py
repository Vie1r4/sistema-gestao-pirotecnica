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
            classname = cls.attrib.get("name", "")
            for line in cls.findall("lines/line"):
                num = line.attrib.get("number")
                if num is None:
                    continue
                key = (filename, classname, num)
                hits = int(line.attrib.get("hits", "0"))
                line_hits[key] = max(line_hits.get(key, 0), hits)
    return line_hits


def assembly_from_filename(filename: str, classname: str) -> str | None:
    normalized = filename.replace("\\", "/")
    for assembly in ASSEMBLIES:
        if f"/{assembly}/" in f"/{normalized}/" or normalized.startswith(f"{assembly}/"):
            return assembly
    for assembly in ASSEMBLIES:
        if classname.startswith(assembly + "."):
            return assembly
    return None


def assembly_coverage(line_hits: dict[tuple[str, str, str], int], assembly: str) -> tuple[int, int, float]:
    covered = total = 0
    for (filename, classname, _), hits in line_hits.items():
        if assembly_from_filename(filename, classname) != assembly:
            continue
        total += 1
        if hits > 0:
            covered += 1
    percent = (covered / total * 100.0) if total else 0.0
    return covered, total, percent


def merge_package_line_rates(paths: list[str]) -> dict[str, float]:
    rates: dict[str, float] = {}
    for path in paths:
        root = ET.parse(path).getroot()
        for pkg in root.findall(".//package"):
            name = pkg.attrib.get("name", "")
            if name not in ASSEMBLIES:
                continue
            rate = float(pkg.attrib.get("line-rate", "0"))
            rates[name] = max(rates.get(name, 0.0), rate)
    return rates


def passes_threshold(covered: int, total: int, threshold_percent: float) -> bool:
    if total == 0:
        return True
    return covered * 100 >= total * threshold_percent


def main() -> int:
    pattern = sys.argv[1] if len(sys.argv) > 1 else "TestResults/**/coverage.cobertura.xml"
    paths = glob.glob(pattern, recursive=True)
    if not paths:
        paths = glob.glob("**/coverage.cobertura.xml", recursive=True)
    if not paths:
        print(f"::error::Sem ficheiros de cobertura em {pattern}")
        return 1

    line_hits = merge_line_hits(paths)
    package_rates = merge_package_line_rates(paths)
    failed = False

    print(f"Cobertura (merge de {len(paths)} relatório(s)):")
    for assembly in ASSEMBLIES:
        covered, total, percent = assembly_coverage(line_hits, assembly)
        pkg_rate = package_rates.get(assembly, 0.0) * 100.0
        line_ok = passes_threshold(covered, total, THRESHOLD_PERCENT)
        status = "OK" if line_ok else "FAIL"
        print(
            f"  {assembly}: linhas {covered}/{total} = {percent:.1f}% | "
            f"pacote max = {pkg_rate:.1f}% [{status}]"
        )
        if not line_ok:
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
