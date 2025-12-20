import os

def merge_files_in_directory(source_folder, output_filename):
    """
    Merges all files in a directory (and subdirectories) into a single text file.
    """
    
    # 1. Open the output file in write mode
    with open(output_filename, 'w', encoding='utf-8') as outfile:
        
        # 2. Walk through the directory tree
        for root, dirs, files in os.walk(source_folder):
            
            # Optional: Skip common hidden/system folders to keep output clean
            dirs[:] = [d for d in dirs if d not in ['.git', '__pycache__', 'node_modules', 'venv', '.idea', '.vscode']]
            
            for file in files:
                # Get the full path of the file
                file_path = os.path.join(root, file)
                
                # Get the relative path (to match your requested format: folder/subfolder/filename)
                relative_path = os.path.relpath(file_path, source_folder)
                
                # Prevent the script from reading the output file itself if it's saved in the same folder
                if os.path.abspath(file_path) == os.path.abspath(output_filename):
                    continue

                try:
                    # 3. Read the content of the file
                    with open(file_path, 'r', encoding='utf-8') as infile:
                        content = infile.read()
                        
                        # 4. Write the header
                        outfile.write(f"---- start of file {relative_path} ----\n")
                        
                        # 5. Write the content
                        outfile.write(content)
                        
                        # Add a newline at the end for separation
                        outfile.write("\n\n")
                        
                    print(f"Processed: {relative_path}")
                    
                except UnicodeDecodeError:
                    # Skips binary files (images, executables, pyc files, etc.)
                    print(f"Skipped (Binary file): {relative_path}")
                except Exception as e:
                    print(f"Error reading {relative_path}: {e}")

if __name__ == "__main__":
    # --- CONFIGURATION ---
    
    # The folder you want to scan. '.' means the current folder where this script is located.
    # You can change this to a specific path like: r"C:\Users\Name\MyProject"
    TARGET_FOLDER = '.' 
    
    # The name of the resulting file
    OUTPUT_FILE = 'context_bundle.txt'
    
    # Run the function
    print(f"Starting merge of '{TARGET_FOLDER}' into '{OUTPUT_FILE}'...")
    merge_files_in_directory(TARGET_FOLDER, OUTPUT_FILE)
    print("Done!")