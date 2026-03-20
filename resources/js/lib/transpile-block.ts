import * as Babel from '@babel/standalone';
import React, { forwardRef, useState, useEffect, useRef, useCallback, useMemo } from 'react';

/**
 * Available modules that custom block code can import.
 * When the user writes `import { useState } from "react"`,
 * we intercept that and provide it from this map.
 */

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

const MODULE_MAP: Record<string, any> = {
    react: reactModule,
};

/**
 * Custom require function that resolves imports from MODULE_MAP.
 */
function customRequire(moduleName: string) {
    if (MODULE_MAP[moduleName]) {
        return MODULE_MAP[moduleName];
    }

    throw new Error(`Module "${moduleName}" is not available in the block editor.`);
}

/**
 * Takes a TSX source string, transpiles it with Babel,
 * executes it, and returns the exported BlockDefinition.
 */
export function transpileAndExtract(sourceCode: string): {
    success: boolean;
    blockDefinition?: any;
    error?: string;
} {
    try {
        // Step 1: Babel transpile — converts JSX and strips TypeScript
        const result = Babel.transform(sourceCode, {
            presets: ['react', 'typescript'],
            plugins: ['transform-modules-commonjs'],
            filename: 'custom-block.tsx',
        });

        if (!result?.code) {
            return { success: false, error: 'Babel transpilation returned empty result.' };
        }

        // Step 2: Execute the transpiled code
        // new Function creates a function from a string — like eval but slightly more controlled.
        // We pass in `require`, `exports`, and `React` as available variables.
        const exports: Record<string, any> = {};
        const fn = new Function('require', 'exports', 'React', result.code);
        fn(customRequire, exports, React);

        // Step 3: Find the exported BlockDefinition
        // The user's code does `export const MyBlock: BlockDefinition = { ... }`
        // After commonjs transform, that becomes `exports.MyBlock = { ... }`
        const blockDefinition = Object.values(exports).find(
            (exp: any) => exp && typeof exp === 'object' && exp.type && exp.renderBlock
        );

        if (!blockDefinition) {
            return {
                success: false,
                error: 'No valid BlockDefinition export found. Make sure your code exports an object with "type" and "renderBlock".',
            };
        }

        return { success: true, blockDefinition };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}
