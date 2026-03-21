import * as Babel from '@babel/standalone';
import * as LucideIcons from 'lucide-react';
import React, {
    forwardRef,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/packages/survey-form-package/src/components/ui/card';
import { Input } from '@/packages/survey-form-package/src/components/ui/input';
import { Label } from '@/packages/survey-form-package/src/components/ui/label';
import { SurveyFormContext, useSurveyForm } from '@/packages/survey-form-package/src/context/SurveyFormContext';
import { cn } from '@/packages/survey-form-package/src/lib/utils';
import { themes } from '@/packages/survey-form-package/src/themes';
import type { BlockDefinition } from '@/packages/survey-form-package/src/types';

const reactModule = {
    ...React,
    default: React,
    forwardRef,
    useState,
    useEffect,
    useRef,
    useCallback,
    useMemo,
};

const MODULE_MAP: Record<string, unknown> = {
    'react': reactModule,
    'lucide-react': LucideIcons,
    '@/packages/survey-form-package/src/types': {},
    '@/packages/survey-form-package/src/components/ui/label': { Label, default: Label },
    '@/packages/survey-form-package/src/components/ui/input': { Input, default: Input },
    '@/packages/survey-form-package/src/components/ui/card': {
        Card,
        CardHeader,
        CardTitle,
        CardDescription,
        CardContent,
        CardFooter,
        default: Card,
    },
    '@/packages/survey-form-package/src/lib/utils': { cn, default: cn },
    '@/packages/survey-form-package/src/themes': { themes, default: themes },
    '@/packages/survey-form-package/src/context/SurveyFormContext': {
        useSurveyForm,
        SurveyFormContext,
    },
};

function customRequire(moduleName: string): unknown {
    if (MODULE_MAP[moduleName]) {
        return MODULE_MAP[moduleName];
    }

    throw new Error(`Module "${moduleName}" is not available in the block editor.`);
}

function hashCode(str: string): string {
    let hash = 0;

    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }

    return hash.toString(36);
}

interface TranspileResult {
    success: boolean;
    blockDefinition?: BlockDefinition;
    error?: string;
}

const MAX_CACHE_SIZE = 50;
const transpilationCache = new Map<string, TranspileResult>();

function isBlockDefinition(exp: unknown): exp is BlockDefinition {
    return (
        typeof exp === 'object' &&
        exp !== null &&
        'type' in exp &&
        'renderBlock' in exp &&
        typeof (exp as BlockDefinition).renderBlock === 'function'
    );
}

export function transpileAndExtract(sourceCode: string): TranspileResult {
    const cacheKey = hashCode(sourceCode);

    if (transpilationCache.has(cacheKey)) {
        return transpilationCache.get(cacheKey)!;
    }

    try {
        const result = Babel.transform(sourceCode, {
            presets: ['react', 'typescript'],
            plugins: ['transform-modules-commonjs'],
            filename: 'custom-block.tsx',
        });

        if (!result?.code) {
            return { success: false, error: 'Babel transpilation returned empty result.' };
        }

        const exports: Record<string, unknown> = {};
        const fn = new Function('require', 'exports', 'React', result.code);
        fn(customRequire, exports, React);

        const blockDefinition = Object.values(exports).find(isBlockDefinition);

        if (!blockDefinition) {
            const cached: TranspileResult = {
                success: false,
                error: 'No valid BlockDefinition export found. Make sure your code exports an object with "type" and "renderBlock".',
            };
            transpilationCache.set(cacheKey, cached);

            return cached;
        }

        const cached: TranspileResult = { success: true, blockDefinition };

        if (transpilationCache.size >= MAX_CACHE_SIZE) {
            const firstKey = transpilationCache.keys().next().value;

            if (firstKey) {
                transpilationCache.delete(firstKey);
            }
        }

        transpilationCache.set(cacheKey, cached);

        return cached;
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        const cached: TranspileResult = { success: false, error: message };
        transpilationCache.set(cacheKey, cached);

        return cached;
    }
}
