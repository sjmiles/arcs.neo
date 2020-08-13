export declare enum OutputFormat {
    Kotlin = 0,
    Proto = 1
}
declare type Serial = string | Uint8Array;
/**
 * Generates Kotlin Plans from recipes in an arcs manifest.
 *
 * @param manifest
 * @param format Kotlin or Proto supported.
 * @param policiesManifest?, //: Manifest,
 * @param recipeFilter Optionally, target a single recipe within the manifest.
 * @param salt
 * @return Generated Kotlin code.
 */
export declare const recipe2plan: (manifest: any, format: OutputFormat, policiesManifest?: any, recipeFilter?: string, salt?: string) => Promise<Serial>;
export {};
