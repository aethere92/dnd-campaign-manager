import os
import shutil
import re
from collections import defaultdict
from datetime import datetime

def generate_directory_tree(source_folder, ignore_list):
    """Generates a text-based tree structure of the project."""
    tree = []
    for root, dirs, files in os.walk(source_folder):
        dirs[:] = [d for d in dirs if d not in ignore_list]
        level = root.replace(source_folder, '').count(os.sep)
        indent = '  ' * level
        tree.append(f"{indent}{os.path.basename(root)}/")
        sub_indent = '  ' * (level + 1)
        for f in files:
            if f not in ignore_list:
                tree.append(f"{sub_indent}{f}")
    return "\n".join(tree)

def extract_imports(content, file_path):
    """Extract import statements from a file."""
    imports = []
    
    # Match ES6 imports
    import_pattern = r'^import\s+.*?\s+from\s+[\'"](.+?)[\'"]'
    # Match dynamic imports
    dynamic_pattern = r'import\s*\([\'"](.+?)[\'"]\)'
    # Match require statements
    require_pattern = r'require\s*\([\'"](.+?)[\'"]\)'
    
    for match in re.finditer(import_pattern, content, re.MULTILINE):
        imports.append(match.group(1))
    
    for match in re.finditer(dynamic_pattern, content):
        imports.append(match.group(1))
    
    for match in re.finditer(require_pattern, content):
        imports.append(match.group(1))
    
    return imports

def categorize_file(relative_path):
    """Determine which category a file belongs to."""
    parts = relative_path.split(os.sep)
    
    if len(parts) == 1:
        return 'root'
    
    first_dir = parts[0]
    
    if first_dir in ['features', 'domain']:
        # For features and domain, use the second level (e.g., features/admin, domain/entity)
        if len(parts) > 1:
            return f"{first_dir}_{parts[1]}"
        return first_dir
    elif first_dir == 'shared':
        return 'shared'
    elif first_dir == 'app':
        return 'app'
    elif first_dir == 'dev_helpers':
        return 'dev_helpers'
    else:
        return 'root'

def get_file_stats(file_path):
    """Get statistics for a single file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            lines = content.split('\n')
            
            # Count non-empty lines
            non_empty_lines = sum(1 for line in lines if line.strip())
            
            # Count comment lines
            comment_lines = sum(1 for line in lines if line.strip().startswith('//') or line.strip().startswith('/*') or line.strip().startswith('*'))
            
            return {
                'total_lines': len(lines),
                'non_empty_lines': non_empty_lines,
                'comment_lines': comment_lines,
                'size_bytes': len(content.encode('utf-8'))
            }
    except:
        return None

def prepare_parts_directory(parts_dir):
    """Clear and recreate the parts directory."""
    if os.path.exists(parts_dir):
        shutil.rmtree(parts_dir)
    os.makedirs(parts_dir)

def write_part_file(parts_dir, category, files_content, tree_structure):
    """Write a part file for a specific category."""
    filename = os.path.join(parts_dir, f"{category}.txt")
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write("================================================================\n")
        f.write(f"PARTIAL BUNDLE: {category.upper().replace('_', ' ')}\n")
        f.write("================================================================\n\n")
        
        f.write("### PROJECT MAP (FILE STRUCTURE)\n")
        f.write(tree_structure)
        f.write("\n\n================================================================\n")
        f.write("### SOURCE CODE\n")
        f.write("================================================================\n\n")
        
        for relative_path, content in files_content:
            f.write(f"--- FILE: {relative_path} ---\n")
            f.write(content)
            f.write(f"\n--- END OF {relative_path} ---\n\n")

def generate_dependency_graph(dependency_data, output_file):
    """Generate a dependency graph file."""
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("================================================================\n")
        f.write("DEPENDENCY GRAPH\n")
        f.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write("================================================================\n\n")
        
        f.write("### IMPORT RELATIONSHIPS\n\n")
        
        for file_path in sorted(dependency_data.keys()):
            imports = dependency_data[file_path]
            if imports:
                f.write(f"\n{file_path}:\n")
                for imp in sorted(imports):
                    f.write(f"  → {imp}\n")
        
        f.write("\n\n### DEPENDENCY STATISTICS\n\n")
        
        # Calculate incoming dependencies (which files are imported most)
        incoming_deps = defaultdict(int)
        for file_path, imports in dependency_data.items():
            for imp in imports:
                # Normalize relative imports
                if imp.startswith('.'):
                    incoming_deps[imp] += 1
        
        f.write("Most imported files (relative imports):\n")
        sorted_deps = sorted(incoming_deps.items(), key=lambda x: x[1], reverse=True)[:20]
        for path, count in sorted_deps:
            f.write(f"  {path}: {count} imports\n")
        
        f.write("\n\nFiles with most outgoing dependencies:\n")
        sorted_outgoing = sorted(dependency_data.items(), key=lambda x: len(x[1]), reverse=True)[:20]
        for path, imports in sorted_outgoing:
            if imports:
                f.write(f"  {path}: {len(imports)} imports\n")

def generate_stats_file(stats_data, output_file):
    """Generate a statistics file."""
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("================================================================\n")
        f.write("PROJECT STATISTICS\n")
        f.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write("================================================================\n\n")
        
        # Overall stats
        total_files = len(stats_data)
        total_lines = sum(s['total_lines'] for s in stats_data.values())
        total_non_empty = sum(s['non_empty_lines'] for s in stats_data.values())
        total_comments = sum(s['comment_lines'] for s in stats_data.values())
        total_size = sum(s['size_bytes'] for s in stats_data.values())
        
        f.write("### OVERALL STATISTICS\n\n")
        f.write(f"Total files: {total_files}\n")
        f.write(f"Total lines: {total_lines:,}\n")
        f.write(f"Non-empty lines: {total_non_empty:,}\n")
        f.write(f"Comment lines: {total_comments:,}\n")
        f.write(f"Total size: {total_size:,} bytes ({total_size / 1024:.2f} KB)\n")
        f.write(f"Average lines per file: {total_lines / total_files:.1f}\n")
        
        # Stats by extension
        f.write("\n\n### STATISTICS BY FILE TYPE\n\n")
        by_extension = defaultdict(lambda: {'count': 0, 'lines': 0, 'size': 0})
        
        for file_path, stats in stats_data.items():
            ext = os.path.splitext(file_path)[1] or 'no_extension'
            by_extension[ext]['count'] += 1
            by_extension[ext]['lines'] += stats['total_lines']
            by_extension[ext]['size'] += stats['size_bytes']
        
        for ext in sorted(by_extension.keys()):
            data = by_extension[ext]
            f.write(f"{ext}:\n")
            f.write(f"  Files: {data['count']}\n")
            f.write(f"  Lines: {data['lines']:,}\n")
            f.write(f"  Size: {data['size']:,} bytes ({data['size'] / 1024:.2f} KB)\n\n")
        
        # Largest files
        f.write("\n### LARGEST FILES (by lines)\n\n")
        sorted_by_lines = sorted(stats_data.items(), key=lambda x: x[1]['total_lines'], reverse=True)[:20]
        for file_path, stats in sorted_by_lines:
            f.write(f"{file_path}: {stats['total_lines']:,} lines\n")
        
        # Stats by category
        f.write("\n\n### STATISTICS BY CATEGORY\n\n")
        by_category = defaultdict(lambda: {'count': 0, 'lines': 0, 'size': 0})
        
        for file_path, stats in stats_data.items():
            category = categorize_file(file_path)
            by_category[category]['count'] += 1
            by_category[category]['lines'] += stats['total_lines']
            by_category[category]['size'] += stats['size_bytes']
        
        for category in sorted(by_category.keys()):
            data = by_category[category]
            f.write(f"{category}:\n")
            f.write(f"  Files: {data['count']}\n")
            f.write(f"  Lines: {data['lines']:,}\n")
            f.write(f"  Size: {data['size']:,} bytes ({data['size'] / 1024:.2f} KB)\n\n")

def merge_files_in_directory(source_folder, output_filename, parts_dir, ignore_list=None):
    if ignore_list is None:
        ignore_list = []

    processed_count = 0
    dependency_data = {}
    stats_data = {}
    
    # Prepare parts directory
    prepare_parts_directory(parts_dir)
    
    # Organize files by category
    files_by_category = defaultdict(list)
    
    # First pass: collect all files and their content
    all_files_content = []
    
    for root, dirs, files in os.walk(source_folder):
        dirs[:] = [d for d in dirs if d not in ignore_list]
        
        for file in files:
            if file in ignore_list:
                continue

            file_path = os.path.join(root, file)
            relative_path = os.path.relpath(file_path, source_folder)
            
            if os.path.abspath(file_path) == os.path.abspath(output_filename):
                continue

            try:
                with open(file_path, 'r', encoding='utf-8') as infile:
                    content = infile.read()
                    
                    # Extract imports for dependency graph
                    imports = extract_imports(content, file_path)
                    dependency_data[relative_path] = imports
                    
                    # Get file stats
                    stats = get_file_stats(file_path)
                    if stats:
                        stats_data[relative_path] = stats
                    
                    # Categorize and store
                    category = categorize_file(relative_path)
                    files_by_category[category].append((relative_path, content))
                    all_files_content.append((relative_path, content))
                    
                processed_count += 1
                print(f"Processed: {relative_path} → {category}")
                
            except (UnicodeDecodeError, PermissionError) as e:
                print(f"Skipped: {relative_path} ({e})")
                continue

    # Generate tree structure once
    tree_structure = generate_directory_tree(source_folder, ignore_list)
    
    # Write complete bundle
    with open(output_filename, 'w', encoding='utf-8') as outfile:
        outfile.write("================================================================\n")
        outfile.write("PROJECT CONTEXT BUNDLE: D&D CAMPAIGN MANAGER\n")
        outfile.write("================================================================\n")
        outfile.write("INSTRUCTIONS FOR AI:\n")
        outfile.write("- This is the entire source code for a React/Vite app.\n")
        outfile.write("- Maintain architectural consistency at all costs.\n")
        outfile.write("- Reuse existing hooks, UI components, and Supabase patterns.\n")
        outfile.write("- Do not suggest new libraries or 'from-scratch' rewrites.\n")
        outfile.write("================================================================\n\n")
        
        outfile.write("### PROJECT MAP (FILE STRUCTURE)\n")
        outfile.write(tree_structure)
        outfile.write("\n\n================================================================\n")
        outfile.write("### SOURCE CODE\n")
        outfile.write("================================================================\n\n")
        
        for relative_path, content in all_files_content:
            outfile.write(f"--- FILE: {relative_path} ---\n")
            outfile.write(content)
            outfile.write(f"\n--- END OF {relative_path} ---\n\n")
    
    # Write part files
    for category, files_content in files_by_category.items():
        write_part_file(parts_dir, category, files_content, tree_structure)
        print(f"Created part file: {category}.txt ({len(files_content)} files)")
    
    # Generate dependency graph
    dep_graph_file = os.path.join(os.path.dirname(output_filename), 'dependency_graph.txt')
    generate_dependency_graph(dependency_data, dep_graph_file)
    print(f"\nGenerated dependency graph: {dep_graph_file}")
    
    # Generate stats file
    stats_file = os.path.join(os.path.dirname(output_filename), 'project_stats.txt')
    generate_stats_file(stats_data, stats_file)
    print(f"Generated statistics: {stats_file}")
    
    print(f"\nSuccessfully bundled {processed_count} files into {output_filename}")
    print(f"Created {len(files_by_category)} part files in {parts_dir}/")

if __name__ == "__main__":
    TARGET_FOLDER = '.' 
    OUTPUT_FILE = 'dev_helpers/outputs/context_bundle.txt'
    PARTS_DIR = 'dev_helpers/outputs/features'
    
    FILES_TO_IGNORE = [
        '.git', '__pycache__', 'node_modules', 'venv', '.idea', '.vscode',
        'package-lock.json', 'merge_files.py', 'context_bundle.txt',
        'db_schema.txt', 'functions_and_views.txt', 'campaign_01.js',
        '.DS_Store', 'dist', 'build', 'table_entries_examples.txt',
        'dependency_graph.txt', 'project_stats.txt', 'parts', 'dev_helpers'
    ]
    
    merge_files_in_directory(TARGET_FOLDER, OUTPUT_FILE, PARTS_DIR, ignore_list=FILES_TO_IGNORE)