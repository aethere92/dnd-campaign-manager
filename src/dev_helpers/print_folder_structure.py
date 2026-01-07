import os
from pathlib import Path

def print_folder_structure(directory, prefix="", is_last=True, output_file=None, include_files=False):
    """
    Print folder and subfolder structure in a tree format.
    
    Args:
        directory: Path to the directory to display
        prefix: Prefix for tree branches (used internally for recursion)
        is_last: Whether this is the last item in its parent (used internally)
        output_file: File object to write to
        include_files: Whether to include files in the output
    """
    try:
        path = Path(directory)
        
        # Skip node_modules folders
        if path.name == "node_modules":
            return
        
        # Print current directory
        connector = "└── " if is_last else "├── "
        line = f"{prefix}{connector}{path.name}/"
        
        if output_file:
            output_file.write(line + "\n")
        else:
            print(line)
        
        # Get all items (directories and optionally files)
        try:
            if include_files:
                # Get both directories and files
                dirs = sorted([item for item in path.iterdir() 
                             if item.is_dir() and item.name != "node_modules"])
                files = sorted([item for item in path.iterdir() 
                              if item.is_file()])
                items = dirs + files
            else:
                # Get only directories
                items = sorted([item for item in path.iterdir() 
                              if item.is_dir() and item.name != "node_modules"])
        except PermissionError:
            error_line = f"{prefix}    [Permission Denied]"
            if output_file:
                output_file.write(error_line + "\n")
            else:
                print(error_line)
            return
        
        # Update prefix for children
        extension = "    " if is_last else "│   "
        new_prefix = prefix + extension
        
        # Print all items
        for i, item in enumerate(items):
            is_last_item = (i == len(items) - 1)
            
            if item.is_dir():
                # Recursively print subdirectories
                print_folder_structure(item, new_prefix, is_last_item, output_file, include_files)
            else:
                # Print file
                connector = "└── " if is_last_item else "├── "
                file_line = f"{new_prefix}{connector}{item.name}"
                if output_file:
                    output_file.write(file_line + "\n")
                else:
                    print(file_line)
            
    except Exception as e:
        error_msg = f"Error: {e}"
        if output_file:
            output_file.write(error_msg + "\n")
        else:
            print(error_msg)


def main():
    # Get directory path from user or use current directory
    directory = input("Enter directory path (or press Enter for current directory): ").strip()
    
    if not directory:
        directory = "."
    
    directory_path = Path(directory).resolve()
    
    if not directory_path.exists():
        print(f"Error: Directory '{directory}' does not exist.")
        return
    
    if not directory_path.is_dir():
        print(f"Error: '{directory}' is not a directory.")
        return
    
    # Ask if user wants to include files
    include_files_input = input("Include files? (y/n, default: n): ").strip().lower()
    include_files = include_files_input == 'y' or include_files_input == 'yes'
    
    # Create output filename
    output_filename = "folder_structure.txt"
    
    print(f"\nGenerating folder structure for: {directory_path}")
    print(f"Saving to: {output_filename}")
    print(f"Including files: {'Yes' if include_files else 'No'}")
    print("Ignoring: node_modules folders\n")
    
    # Write to file
    with open(output_filename, 'w', encoding='utf-8') as f:
        f.write(f"Folder structure for: {directory_path}\n")
        f.write(f"Including files: {'Yes' if include_files else 'No'}\n\n")
        f.write(f"{directory_path.name}/\n")
        
        # Get all items in root (excluding node_modules)
        try:
            if include_files:
                dirs = sorted([item for item in directory_path.iterdir() 
                             if item.is_dir() and item.name != "node_modules"])
                files = sorted([item for item in directory_path.iterdir() 
                              if item.is_file()])
                items = dirs + files
            else:
                items = sorted([item for item in directory_path.iterdir() 
                              if item.is_dir() and item.name != "node_modules"])
        except PermissionError:
            f.write("[Permission Denied]\n")
            print("Error: Permission denied")
            return
        
        # Print each item
        for i, item in enumerate(items):
            is_last = (i == len(items) - 1)
            
            if item.is_dir():
                print_folder_structure(item, "", is_last, f, include_files)
            else:
                connector = "└── " if is_last else "├── "
                f.write(f"{connector}{item.name}\n")
    
    print(f"✓ Folder structure saved to {output_filename}")


if __name__ == "__main__":
    main()