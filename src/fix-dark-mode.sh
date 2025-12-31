#!/bin/bash

# Dark Mode Fix Script
# This script performs find-and-replace operations to convert hardcoded colors to theme-aware tokens
# Run this from your project root directory

echo "🎨 Starting Dark Mode Fix Script..."
echo "===================================="

# Function to replace in files
replace_in_files() {
    local search="$1"
    local replace="$2"
    local description="$3"
    
    echo "📝 $description"
    
    # Use find and sed to replace in all .jsx files
    find features/ -name "*.jsx" -type f -exec sed -i.bak "s/$search/$replace/g" {} \;
    
    # Clean up backup files
    find features/ -name "*.bak" -type f -delete
}

echo ""
echo "🔍 Phase 1: Text Colors"
echo "----------------------"

# Foreground colors (dark text)
replace_in_files "text-stone-900" "text-foreground" "Converting text-stone-900 → text-foreground"
replace_in_files "text-stone-800" "text-foreground" "Converting text-stone-800 → text-foreground"
replace_in_files "text-stone-700" "text-card-foreground" "Converting text-stone-700 → text-card-foreground"
replace_in_files "text-gray-900" "text-foreground" "Converting text-gray-900 → text-foreground"
replace_in_files "text-slate-900" "text-foreground" "Converting text-slate-900 → text-foreground"

# Muted text colors
replace_in_files "text-stone-600" "text-muted-foreground" "Converting text-stone-600 → text-muted-foreground"
replace_in_files "text-stone-500" "text-muted-foreground" "Converting text-stone-500 → text-muted-foreground"
replace_in_files "text-stone-400" "text-muted-foreground" "Converting text-stone-400 → text-muted-foreground"
replace_in_files "text-gray-500" "text-muted-foreground" "Converting text-gray-500 → text-muted-foreground"
replace_in_files "text-slate-500" "text-muted-foreground" "Converting text-slate-500 → text-muted-foreground"

echo ""
echo "🎨 Phase 2: Background Colors"
echo "-----------------------------"

# Card backgrounds
replace_in_files "bg-stone-50" "bg-muted" "Converting bg-stone-50 → bg-muted"
replace_in_files "bg-gray-50" "bg-muted" "Converting bg-gray-50 → bg-muted"
replace_in_files "bg-slate-50" "bg-muted" "Converting bg-slate-50 → bg-muted"
replace_in_files "bg-stone-100" "bg-muted" "Converting bg-stone-100 → bg-muted"

# Subtle backgrounds
replace_in_files "bg-stone-200\\/60" "bg-muted\\/80" "Converting bg-stone-200/60 → bg-muted/80"
replace_in_files "bg-stone-200\\/50" "bg-muted\\/60" "Converting bg-stone-200/50 → bg-muted/60"

echo ""
echo "🔲 Phase 3: Border Colors"
echo "-------------------------"

replace_in_files "border-stone-300" "border-border" "Converting border-stone-300 → border-border"
replace_in_files "border-stone-200" "border-border" "Converting border-stone-200 → border-border"
replace_in_files "border-gray-200" "border-border" "Converting border-gray-200 → border-border"
replace_in_files "border-slate-200" "border-border" "Converting border-slate-200 → border-border"

replace_in_files "border-stone-200\\/60" "border-border\\/60" "Converting border-stone-200/60 → border-border/60"
replace_in_files "border-stone-200\\/40" "border-border\\/40" "Converting border-stone-200/40 → border-border/40"

echo ""
echo "📊 Phase 4: Divide Colors"
echo "-------------------------"

replace_in_files "divide-stone-200" "divide-border" "Converting divide-stone-200 → divide-border"
replace_in_files "divide-gray-200" "divide-border" "Converting divide-gray-200 → divide-border"

echo ""
echo "💍 Phase 5: Ring Colors"
echo "-----------------------"

replace_in_files "ring-stone-200" "ring-border" "Converting ring-stone-200 → ring-border"
replace_in_files "ring-gray-200" "ring-border" "Converting ring-gray-200 → ring-border"

echo ""
echo "✨ Phase 6: Special Cases"
echo "-------------------------"

# Specific component fixes
echo "📝 Fixing EntityHeader gradient..."
find features/wiki/components -name "EntityHeader.jsx" -type f -exec sed -i.bak \
    "s/from-\\\[var(--background)\\\] from-0% via-\\\[var(--background)\\\]\\/60 via-15% to-transparent/from-background via-background\\/60 to-transparent/g" {} \;

echo "📝 Fixing prose in EntityBody..."
find features/wiki/components -name "EntityBody.jsx" -type f -exec sed -i.bak \
    "s/prose-slate//g" {} \;

echo "📝 Fixing sidebar colors..."
find features/wiki/components -name "EntitySidebar.jsx" -type f -exec sed -i.bak \
    "s/text-stone-400/text-muted-foreground/g" {} \;

find features/wiki/components/navigation/sidebar -name "*.jsx" -type f -exec sed -i.bak \
    "s/text-stone-500/text-muted-foreground/g" {} \;

# Clean up all backup files
find features/ -name "*.bak" -type f -delete

echo ""
echo "✅ Dark Mode Fix Complete!"
echo "=========================="
echo ""
echo "📋 Summary:"
echo "  - Replaced hardcoded text colors with semantic tokens"
echo "  - Updated background colors to theme-aware classes"
echo "  - Fixed border and divide colors"
echo "  - Applied special fixes to key components"
echo ""
echo "🔍 Next Steps:"
echo "  1. Review the changes in your components"
echo "  2. Test light, dark, and D&D themes"
echo "  3. Check for any remaining hardcoded colors"
echo "  4. Run your linter and fix any issues"
echo ""
echo "💡 Tips:"
echo "  - Use 'text-foreground' for primary text"
echo "  - Use 'text-muted-foreground' for secondary text"
echo "  - Use 'bg-muted' for subtle backgrounds"
echo "  - Use 'border-border' for all borders"
echo ""