import os

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

def merge_files_in_directory(source_folder, output_filename, ignore_list=None):
    if ignore_list is None:
        ignore_list = []

    processed_count = 0

    with open(output_filename, 'w', encoding='utf-8') as outfile:
        # 1. Write metadata and AI instructions
        outfile.write("================================================================\n")
        outfile.write("PROJECT CONTEXT BUNDLE: D&D CAMPAIGN MANAGER\n")
        outfile.write("================================================================\n")
        outfile.write("INSTRUCTIONS FOR AI:\n")
        outfile.write("- This is the entire source code for a React/Vite app.\n")
        outfile.write("- Maintain architectural consistency at all costs.\n")
        outfile.write("- Reuse existing hooks, UI components, and Supabase patterns.\n")
        outfile.write("- Do not suggest new libraries or 'from-scratch' rewrites.\n")
        outfile.write("================================================================\n\n")

        # 2. Write the Project Map (Directory Tree)
        outfile.write("### PROJECT MAP (FILE STRUCTURE)\n")
        tree_structure = generate_directory_tree(source_folder, ignore_list)
        outfile.write(tree_structure)
        outfile.write("\n\n================================================================\n")
        outfile.write("### SOURCE CODE\n")
        outfile.write("================================================================\n\n")
        
        # 3. Walk through the directory tree and write content
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
                        
                        outfile.write(f"--- FILE: {relative_path} ---\n")
                        outfile.write(content)
                        outfile.write(f"\n--- END OF {relative_path} ---\n\n")
                        
                    processed_count += 1
                    print(f"Processed: {relative_path}")
                    
                except (UnicodeDecodeError, PermissionError):
                    continue 

    print(f"\nSuccessfully bundled {processed_count} files into {output_filename}")

if __name__ == "__main__":
    TARGET_FOLDER = '.' 
    OUTPUT_FILE = 'context_bundle.txt'
    
    FILES_TO_IGNORE = [
        '.git', '__pycache__', 'node_modules', 'venv', '.idea', '.vscode',
        'package-lock.json', 'merge_files.py', 'context_bundle.txt',
        'db_schema.txt', 'functions_and_views.txt', 'campaign_01.js',
        '.DS_Store', 'dist', 'build', 'table_entries_examples.txt' # Added common build folders
    ]
    
    merge_files_in_directory(TARGET_FOLDER, OUTPUT_FILE, ignore_list=FILES_TO_IGNORE)