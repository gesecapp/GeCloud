#!/usr/bin/env python3
"""
Analisa o uso dos Hooks globais no projeto.
Percorre src/hooks/ e busca por usos em todo o codebase.
"""

import os
import re
from pathlib import Path
from collections import defaultdict

# Diretório raiz do projeto
PROJECT_ROOT = Path(__file__).parent.parent.parent
HOOKS_DIR = PROJECT_ROOT / "src" / "hooks"
SRC_DIR = PROJECT_ROOT / "src"

# Extensões de arquivo para buscar
EXTENSIONS = {".tsx", ".ts", ".jsx", ".js"}

# Arquivos/pastas para ignorar
IGNORE_PATTERNS = {"node_modules", ".git", "dist", "build", "__tests__", ".test.", ".spec."}


def get_hooks():
    """Extrai os nomes dos hooks exportados."""
    hooks = {}

    for file_path in HOOKS_DIR.glob("*.ts"):
        if file_path.name == "index.ts" or not file_path.name.endswith(".ts"):
            continue

        content = file_path.read_text(encoding="utf-8")

        # Busca por exports de funções (export function useHookName ou export const useHookName)
        # Pattern para: export function useXxx ou export const useXxx
        func_matches = re.findall(r"export\s+function\s+(use\w+)\s*[<(]", content)
        const_matches = re.findall(r"export\s+const\s+(use\w+)\s*=", content)
        
        all_matches = func_matches + const_matches
        
        for match in all_matches:
            hooks[match] = {
                "file": file_path.name,
                "usages": [],
                "count": 0
            }

    return hooks


def should_ignore(path: Path) -> bool:
    """Verifica se o arquivo deve ser ignorado."""
    path_str = str(path)
    return any(pattern in path_str for pattern in IGNORE_PATTERNS)


def find_usages(hooks: dict):
    """Busca por usos de cada Hook no codebase."""

    for file_path in SRC_DIR.rglob("*"):
        if not file_path.is_file():
            continue
        if file_path.suffix not in EXTENSIONS:
            continue
        if should_ignore(file_path):
            continue
        # Ignora os próprios arquivos de definição dos hooks
        if HOOKS_DIR in file_path.parents or file_path.parent == HOOKS_DIR:
            continue

        try:
            content = file_path.read_text(encoding="utf-8")
        except Exception:
            continue

        relative_path = file_path.relative_to(PROJECT_ROOT)

        for hook_name in hooks:
            # Busca por chamadas do hook: hookName( ou import { hookName
            call_pattern = rf"\b{hook_name}\s*\("
            import_pattern = rf"import\s*\{{[^}}]*\b{hook_name}\b"
            
            # Conta chamadas do hook (não imports)
            call_matches = re.findall(call_pattern, content)
            import_matches = re.findall(import_pattern, content)

            # Só conta se foi importado E chamado
            if call_matches and import_matches:
                usage_count = len(call_matches)

                if usage_count > 0:
                    hooks[hook_name]["usages"].append({
                        "file": str(relative_path),
                        "count": usage_count
                    })
                    hooks[hook_name]["count"] += usage_count


def print_report(hooks: dict):
    """Imprime o relatório de uso."""

    # Ordena por contagem de uso (decrescente)
    sorted_hooks = sorted(hooks.items(), key=lambda x: x[1]["count"], reverse=True)

    used = [(name, data) for name, data in sorted_hooks if data["count"] > 0]
    unused = [(name, data) for name, data in sorted_hooks if data["count"] == 0]

    print("=" * 60)
    print("📊 RELATÓRIO DE USO DOS HOOKS GLOBAIS")
    print("=" * 60)

    print(f"\n📈 Total de Hooks: {len(hooks)}")
    print(f"✅ Em uso: {len(used)}")
    print(f"⚠️  Sem uso: {len(unused)}")

    # Hooks mais usados
    print("\n" + "-" * 60)
    print("🏆 TOP 15 MAIS USADOS")
    print("-" * 60)

    for i, (name, data) in enumerate(used[:15], 1):
        print(f"{i:2}. {name:<45} ({data['count']} usos)")

    # Todos os hooks em uso
    print("\n" + "-" * 60)
    print("✅ HOOKS EM USO (ordenado por uso)")
    print("-" * 60)

    for name, data in used:
        print(f"\n{name} ({data['count']} usos) - {data['file']}")
        for usage in data["usages"][:5]:  # Mostra até 5 arquivos
            print(f"   └─ {usage['file']} ({usage['count']}x)")
        if len(data["usages"]) > 5:
            print(f"   └─ ... e mais {len(data['usages']) - 5} arquivos")

    # Hooks não usados
    print("\n" + "-" * 60)
    print("⚠️  HOOKS SEM USO (candidatos a remoção)")
    print("-" * 60)

    if unused:
        for name, data in unused:
            print(f"   • {name:<45} ({data['file']})")
    else:
        print("   Nenhum hook sem uso! 🎉")

    # Resumo final
    print("\n" + "=" * 60)
    print("📋 RESUMO")
    print("=" * 60)
    print(f"Total de hooks: {len(hooks)}")
    if len(hooks) > 0:
        print(f"Em uso: {len(used)} ({len(used)/len(hooks)*100:.1f}%)")
        print(f"Sem uso: {len(unused)} ({len(unused)/len(hooks)*100:.1f}%)")

    if unused:
        print(f"\n💡 Considere remover os {len(unused)} hooks não utilizados.")


def export_csv(hooks: dict):
    """Exporta os dados para CSV."""
    csv_path = HOOKS_DIR / "hooks-usage-report.csv"

    with open(csv_path, "w", encoding="utf-8") as f:
        f.write("Hook,File,UsageCount,UsedInFiles\n")

        for name, data in sorted(hooks.items(), key=lambda x: x[1]["count"], reverse=True):
            files = "; ".join([u["file"] for u in data["usages"]])
            f.write(f"{name},{data['file']},{data['count']},\"{files}\"\n")

    print(f"\n📄 Relatório CSV exportado: {csv_path}")


def main():
    print("🔍 Analisando uso dos Hooks globais...\n")

    # Coleta os hooks
    hooks = get_hooks()
    print(f"Encontrados {len(hooks)} hooks em {HOOKS_DIR.relative_to(PROJECT_ROOT)}")

    # Busca usos
    print("Buscando usos no codebase...")
    find_usages(hooks)

    # Imprime relatório
    print_report(hooks)

    # Exporta CSV
    export_csv(hooks)


if __name__ == "__main__":
    main()
