import os
import tkinter as tk
from tkinter import filedialog, scrolledtext, messagebox
from pathlib import Path


class FolderStructureGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("Folder Structure Generator")
        self.root.geometry("800x600")
        
        # Variables
        self.selected_path = tk.StringVar()
        self.include_files = tk.BooleanVar(value=True)
        
        # Create UI
        self.create_widgets()
        
    def create_widgets(self):
        # Top frame for controls
        control_frame = tk.Frame(self.root, padx=10, pady=10)
        control_frame.pack(fill=tk.X)
        
        # Folder selection
        tk.Label(control_frame, text="Selected Folder:").grid(row=0, column=0, sticky=tk.W, pady=5)
        tk.Entry(control_frame, textvariable=self.selected_path, width=50, state='readonly').grid(row=0, column=1, padx=5, pady=5)
        tk.Button(control_frame, text="Browse", command=self.select_folder).grid(row=0, column=2, padx=5, pady=5)
        
        # Options
        tk.Checkbutton(control_frame, text="Include files (not just folders)", 
                      variable=self.include_files).grid(row=1, column=0, columnspan=2, sticky=tk.W, pady=5)
        
        # Generate button
        tk.Button(control_frame, text="Generate Structure", command=self.generate_structure,
                 bg="#4CAF50", fg="white", font=("Arial", 10, "bold"), padx=20, pady=5).grid(row=2, column=0, columnspan=3, pady=10)
        
        # Output area
        output_frame = tk.Frame(self.root, padx=10, pady=5)
        output_frame.pack(fill=tk.BOTH, expand=True)
        
        tk.Label(output_frame, text="Folder Structure:", font=("Arial", 10, "bold")).pack(anchor=tk.W)
        
        # Text area with scrollbar
        self.output_text = scrolledtext.ScrolledText(output_frame, wrap=tk.NONE, 
                                                     font=("Courier", 9), bg="#1e1e1e", fg="#00ff00")
        self.output_text.pack(fill=tk.BOTH, expand=True, pady=5)
        
        # Bottom frame for action buttons
        button_frame = tk.Frame(self.root, padx=10, pady=10)
        button_frame.pack(fill=tk.X)
        
        tk.Button(button_frame, text="Copy to Clipboard", command=self.copy_to_clipboard,
                 bg="#2196F3", fg="white", padx=15, pady=5).pack(side=tk.LEFT, padx=5)
        tk.Button(button_frame, text="Save to File", command=self.save_to_file,
                 bg="#FF9800", fg="white", padx=15, pady=5).pack(side=tk.LEFT, padx=5)
        tk.Button(button_frame, text="Clear", command=self.clear_output,
                 bg="#f44336", fg="white", padx=15, pady=5).pack(side=tk.LEFT, padx=5)
        
    def select_folder(self):
        folder = filedialog.askdirectory(title="Select Folder")
        if folder:
            self.selected_path.set(folder)
            
    def generate_structure(self):
        path = self.selected_path.get()
        if not path:
            messagebox.showwarning("No Folder Selected", "Please select a folder first.")
            return
            
        if not os.path.exists(path):
            messagebox.showerror("Error", "Selected folder does not exist.")
            return
            
        self.output_text.delete(1.0, tk.END)
        
        # Generate structure
        directory_path = Path(path)
        include_files = self.include_files.get()
        
        output = f"Folder structure for: {directory_path}\n"
        output += f"Including files: {'Yes' if include_files else 'No'}\n"
        output += f"Ignoring: node_modules folders and hidden files\n\n"
        output += f"{directory_path.name}/\n"
        
        # Get root items
        try:
            items = self._get_items(directory_path, include_files)
            
            for i, item in enumerate(items):
                is_last = (i == len(items) - 1)
                
                if item.is_dir():
                    output += self._process_directory(item, "", is_last, include_files)
                else:
                    connector = "└── " if is_last else "├── "
                    output += f"{connector}{item.name}\n"
                    
        except PermissionError:
            output += "[Permission Denied]\n"
            
        self.output_text.insert(1.0, output)
        
    def _get_items(self, path, include_files):
        """Get sorted list of items in directory, excluding node_modules and hidden files."""
        items = []
        for item in path.iterdir():
            # Skip node_modules and hidden files
            if item.name == "node_modules" or item.name.startswith("."):
                continue
            items.append(item)
        
        # Sort: directories first, then files
        items.sort(key=lambda x: (not x.is_dir(), x.name.lower()))
        
        # Filter based on include_files
        if not include_files:
            items = [item for item in items if item.is_dir()]
            
        return items
        
    def _process_directory(self, path, prefix, is_last, include_files):
        """Recursively process directory and return string representation."""
        output = ""
        
        connector = "└── " if is_last else "├── "
        output += f"{prefix}{connector}{path.name}/\n"
        
        extension = "    " if is_last else "│   "
        new_prefix = prefix + extension
        
        try:
            items = self._get_items(path, include_files)
            
            for i, item in enumerate(items):
                is_last_item = (i == len(items) - 1)
                
                if item.is_dir():
                    output += self._process_directory(item, new_prefix, is_last_item, include_files)
                else:
                    file_connector = "└── " if is_last_item else "├── "
                    output += f"{new_prefix}{file_connector}{item.name}\n"
                    
        except PermissionError:
            output += f"{new_prefix}[Permission Denied]\n"
            
        return output
        
    def copy_to_clipboard(self):
        content = self.output_text.get(1.0, tk.END).strip()
        if content:
            self.root.clipboard_clear()
            self.root.clipboard_append(content)
            messagebox.showinfo("Success", "Copied to clipboard!")
        else:
            messagebox.showwarning("No Content", "Nothing to copy.")
            
    def save_to_file(self):
        content = self.output_text.get(1.0, tk.END).strip()
        if not content:
            messagebox.showwarning("No Content", "Nothing to save.")
            return
            
        file_path = filedialog.asksaveasfilename(
            defaultextension=".txt",
            filetypes=[("Text files", "*.txt"), ("All files", "*.*")],
            initialfile="folder_structure.txt"
        )
        
        if file_path:
            try:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                messagebox.showinfo("Success", f"Saved to {file_path}")
            except Exception as e:
                messagebox.showerror("Error", f"Failed to save file: {e}")
                
    def clear_output(self):
        self.output_text.delete(1.0, tk.END)


def main():
    root = tk.Tk()
    app = FolderStructureGUI(root)
    root.mainloop()


if __name__ == "__main__":
    main()