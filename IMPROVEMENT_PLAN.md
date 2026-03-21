# Custom Block Editor Improvement Plan

## Overview
This plan addresses improvements across transpilation, Laravel backend, TypeScript type safety, and UX enhancements for the custom block editor feature.

---

## 1. TRANSPILATION IMPROVEMENTS

### 1.1 Expand MODULE_MAP with Required Imports
**File:** `resources/js/lib/transpile-block.ts`

The current `MODULE_MAP` only includes `react`. Users writing custom blocks need access to the full survey-form-package ecosystem.

**Current state (line 21-23):**
```typescript
const MODULE_MAP: Record<string, any> = {
    react: reactModule,
};
```

**Required additions:**
| Module Path | Exports to Include |
|-------------|-------------------|
| `@/packages/survey-form-package/src/types` | `BlockDefinition`, `BlockRendererProps`, `BlockData`, `ThemeDefinition` |
| `@/packages/survey-form-package/src/components/ui/label` | `Label` |
| `@/packages/survey-form-package/src/components/ui/input` | `Input` |
| `@/packages/survey-form-package/src/components/ui/card` | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` |
| `@/packages/survey-form-package/src/lib/utils` | `cn` |
| `@/packages/survey-form-package/src/themes` | `themes`, `defaultTheme`, `minimalTheme`, etc. |
| `@/packages/survey-form-package/src/context/SurveyFormContext` | `useSurveyForm`, `SurveyFormContext` |
| `lucide-react` | Dynamic icon loading or common icons subset |

**Implementation approach:**
1. Import all required modules at the top of `transpile-block.ts`
2. Create module entries for each path variant:
   - Full path: `@/packages/survey-form-package/src/types`
   - Relative: `../types` (for consistency with how some blocks import)
3. For `lucide-react`, consider either:
   - Import all icons (large bundle)
   - Import a curated subset of common icons
   - Dynamically load icons on demand

**Estimated changes:** ~50 lines of imports and MODULE_MAP entries

---

### 1.2 Add Transpilation Result Caching
**File:** `resources/js/lib/transpile-block.ts`

**Current issue:** Every keystroke triggers a full Babel transpilation after the 800ms debounce.

**Solution:** Implement content-hash based caching.

**Implementation:**
```typescript
// Add a simple hash function
function hashCode(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(36);
}

// Cache structure
const transpilationCache = new Map<string, {
    success: boolean;
    blockDefinition?: BlockDefinition;
    error?: string;
}>();

// In transpileAndExtract:
export function transpileAndExtract(sourceCode: string) {
    const cacheKey = hashCode(sourceCode);

    if (transpilationCache.has(cacheKey)) {
        return transpilationCache.get(cacheKey)!;
    }

    // ... existing transpilation logic ...

    transpilationCache.set(cacheKey, result);
    return result;
}

// Optional: Add cache size limit (e.g., LRU with max 50 entries)
```

**Benefits:**
- Undo/redo returns cached results instantly
- Reduces CPU usage on repeated edits
- Improves perceived responsiveness

---

## 2. LARAVEL BACKEND IMPROVEMENTS

### 2.1 Extract Validation to Form Requests
**Current file:** `app/Http/Controllers/CustomBlockController.php`

**Current issue (lines 25-31 and 47-53):** Inline validation duplicated in `store()` and `update()`.

**Solution:** Create two form request classes.

#### 2.1.1 Create StoreCustomBlockRequest
**New file:** `app/Http/Requests/StoreCustomBlockRequest.php`

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCustomBlockRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Or add authorization logic
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'type' => 'required|string|max:255|unique:custom_blocks,type',
            'description' => 'nullable|string',
            'icon_name' => 'nullable|string|max:255',
            'source_code' => 'required|string',
        ];
    }

    public function messages(): array
    {
        return [
            'type.unique' => 'A block with this type already exists.',
        ];
    }
}
```

#### 2.1.2 Create UpdateCustomBlockRequest
**New file:** `app/Http/Requests/UpdateCustomBlockRequest.php`

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCustomBlockRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'type' => [
                'required',
                'string',
                'max:255',
                Rule::unique('custom_blocks', 'type')->ignore($this->route('customBlock')),
            ],
            'description' => 'nullable|string',
            'icon_name' => 'nullable|string|max:255',
            'source_code' => 'required|string',
        ];
    }
}
```

#### 2.1.3 Update Controller
**File:** `app/Http/Controllers/CustomBlockController.php`

```php
// Change method signatures:
public function store(StoreCustomBlockRequest $request)
{
    CustomBlock::query()->create($request->validated());
    return redirect()->route('custom-blocks.index');
}

public function update(UpdateCustomBlockRequest $request, CustomBlock $customBlock)
{
    $customBlock->update($request->validated());
    return redirect()->route('custom-blocks.index');
}
```

---

## 3. TYPE SAFETY IMPROVEMENTS

### 3.1 transpile-block.ts Type Fixes
**File:** `resources/js/lib/transpile-block.ts`

| Line | Current | Suggested Fix |
|------|---------|---------------|
| 21 | `Record<string, any>` | `Record<string, unknown>` (more explicit that values are unknown) |
| 40-43 | `blockDefinition?: any` | `blockDefinition?: BlockDefinition` (import from survey package) |
| 60 | `Record<string, any>` | `Record<string, unknown>` |
| 67-68 | `(exp: any)` | `(exp: unknown)` with type guard |
| 79 | `err: any` | `err: unknown` with `err instanceof Error` check |

**Improved return type:**
```typescript
import type { BlockDefinition } from '@/packages/survey-form-package/src/types';

interface TranspileResult {
    success: boolean;
    blockDefinition?: BlockDefinition;
    error?: string;
}

export function transpileAndExtract(sourceCode: string): TranspileResult {
    // ...
}
```

**Type guard for block definition detection:**
```typescript
function isBlockDefinition(exp: unknown): exp is BlockDefinition {
    return (
        typeof exp === 'object' &&
        exp !== null &&
        'type' in exp &&
        'renderBlock' in exp &&
        typeof (exp as BlockDefinition).type === 'string' &&
        typeof (exp as BlockDefinition).renderBlock === 'function'
    );
}
```

---

### 3.2 editor.tsx Type Fixes
**File:** `resources/js/pages/custom-blocks/editor.tsx`

| Line | Current | Suggested Fix |
|------|---------|---------------|
| 93 | `useState<any>(null)` | `useState<BlockDefinition \| null>(null)` |
| 145 | `blockDef: any` | `blockDef: BlockDefinition` |
| 171 | `(val: any)` | `(val: string)` (or appropriate type based on block) |

**Additional improvements:**
- Import `BlockDefinition` from survey package
- Type the `ErrorBoundary` fallback prop correctly (current is `(err: { message: string })` which is correct)

---

### 3.3 preview.tsx Type Fixes
**File:** `resources/js/pages/custom-blocks/preview.tsx`

**Current issue (lines 37-42):** Direct mutation of transpiled result.
```typescript
if (result.success && result.blockDefinition) {
    result.blockDefinition.type = block.type;  // Mutation!
    if (result.blockDefinition.defaultData) {
        result.blockDefinition.defaultData.type = block.type;  // Mutation!
    }
    registerBlock(result.blockDefinition);
}
```

**Problems:**
1. Mutating the returned object is not type-safe
2. The transpile cache (once added) would return the same object reference
3. This pattern is error-prone

**Suggested fix:** Create a new object with the overridden type.
```typescript
import type { BlockDefinition } from '@/packages/survey-form-package/src/types';

// In the useEffect:
if (result.success && result.blockDefinition) {
    const blockDef: BlockDefinition = {
        ...result.blockDefinition,
        type: block.type,
        defaultData: {
            ...result.blockDefinition.defaultData,
            type: block.type,
        },
    };
    registerBlock(blockDef);
}
```

---

## 4. EDITOR UX IMPROVEMENTS

### 4.1 Add Manual "Run" Button
**File:** `resources/js/pages/custom-blocks/editor.tsx`

**Current behavior:** Preview auto-updates after 800ms debounce.

**Enhancement:** Add a "Run" button for manual transpilation.

**Implementation:**

1. **Add state for manual trigger:**
```typescript
const [manualTrigger, setManualTrigger] = useState(0);
```

2. **Modify BlockPreview to accept manual trigger:**
```typescript
function BlockPreview({ sourceCode, manualTrigger }: {
    sourceCode: string;
    manualTrigger: number;
}) {
    // Add manualTrigger to useEffect dependencies
    useEffect(() => {
        // ... existing debounce logic
    }, [sourceCode, manualTrigger]);
}
```

3. **Add Run button in the toolbar (line 239-247):**
```typescript
<div className="ml-auto flex gap-2">
    <button
        type="button"
        onClick={() => setManualTrigger(t => t + 1)}
        className="rounded-md border border-neutral-300 px-4 py-1.5 text-sm hover:bg-neutral-100"
    >
        Run
    </button>
    <button
        type="submit"
        disabled={form.processing}
        className="rounded-md bg-neutral-800 px-4 py-1.5 text-sm text-white hover:bg-neutral-700 disabled:opacity-50"
    >
        {form.processing ? 'Saving...' : 'Save'}
    </button>
</div>
```

4. **Optional: Add keyboard shortcut (Cmd/Ctrl+Enter):**
```typescript
useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            e.preventDefault();
            setManualTrigger(t => t + 1);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

---

## 5. PREVIEW PAGE IMPROVEMENTS

### 5.1 Fix Type Override Pattern
**File:** `resources/js/pages/custom-blocks/preview.tsx`

As noted in section 3.3, the current pattern mutates the transpiled result object. This should be replaced with immutable object creation.

**Additional consideration:** The reason for the type override is to ensure the block type from the database is used rather than whatever type is hardcoded in the source code. This is correct behavior, but the implementation should be immutable.

---

## Implementation Order

Recommended order based on dependencies and impact:

1. **Phase 1: Type Safety (Foundation)**
   - 3.1 transpile-block.ts types
   - 3.2 editor.tsx types
   - 3.3 preview.tsx types

2. **Phase 2: Transpilation (Core Feature)**
   - 1.1 Expand MODULE_MAP
   - 1.2 Add caching

3. **Phase 3: Laravel Backend**
   - 2.1 Form request extraction

4. **Phase 4: UX Enhancements**
   - 4.1 Add Run button

---

## Testing Checklist

After implementation, verify:

- [ ] Can import `Label`, `Input`, `Card` components in custom block code
- [ ] Can import `cn` utility from lib/utils
- [ ] Can import `useSurveyForm` hook
- [ ] Can import `BlockDefinition` type (should work at runtime even though types are stripped)
- [ ] Can use lucide-react icons
- [ ] Transpilation cache works (undo/redo should be instant)
- [ ] Form validation errors display correctly for store/update
- [ ] Run button triggers immediate transpilation
- [ ] Keyboard shortcut (Cmd/Ctrl+Enter) works
- [ ] Preview page correctly registers blocks with database types
- [ ] No TypeScript errors in the codebase

---

## Files to Create

1. `app/Http/Requests/StoreCustomBlockRequest.php`
2. `app/Http/Requests/UpdateCustomBlockRequest.php`

## Files to Modify

1. `resources/js/lib/transpile-block.ts`
2. `resources/js/pages/custom-blocks/editor.tsx`
3. `resources/js/pages/custom-blocks/preview.tsx`
4. `app/Http/Controllers/CustomBlockController.php`
