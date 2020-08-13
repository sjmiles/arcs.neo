/**
 * @license
 * Copyright (c) 2017 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
import { fetch } from '../../platform/fetch.js';
import { parse } from './gen/manifest-parser.js';
// interface ManifestLoadOptions {
//   registry?: Dictionary<Promise<Manifest>>;
//   memoryProvider?/*: VolatileMemoryProvider*/;
// }
class Path {
    static url(root, path) {
        return (new URL(path || root, root));
    }
}
class Loader {
    static async loadText(root, path) {
        const url = Path.url(path || root, root);
        //console.log('Loader', root, path, url.href);
        const response = await fetch(url);
        return await response.text();
    }
}
export class ManifestAst {
    constructor(ast) {
        this.ast = ast;
    }
    static async load(path, options = {}) {
        const content = await Loader.loadText(path);
        if (!options || !options.filename) {
            options = { ...options, filename: path };
        }
        return await this.parse(content, options);
    }
    static async parse(content, options = {}) {
        // allow `context` for including an existing manifest in the import list
        let { filename, } = options;
        //const id = `manifest:${fileName}:`;
        let items = [];
        try {
            items = parse(content, { filename });
        }
        catch (e) {
            console.error('uhps');
            throw e;
            //throw processError(e, true);
        }
        //console.log(items.length);
        await this.parseImports(filename, items);
        return items;
    }
    static async parseImports(root, items) {
        // Transitive dependencies are loaded in parallel
        await Promise.all(items.map(async (item) => {
            if (item.kind === 'import') {
                const path = Path.url(root, item.path);
                //console.log(root, item.path, path.href);
                item["items"] = await this.load(path.href);
                //console.log(item["items"]);
                //console.log(content);
                // if (!loader) {
                //   throw new Error('loader required to parse import statements');
                // }
                // item is an AstNode.Import
                // const path = loader.path(manifest.fileName);
                // const target = loader.join(path, item.path);
                // try {
                //   manifest._imports.push(await Manifest.load(target, loader, {registry, memoryProvider}));
                // } catch (e) {
                //   manifest.errors.push(e);
                //   manifest.errors.push(new ManifestError(item.location, `Error importing '${target}'`));
                // }
            }
        }));
    }
    static extract(kind, items) {
        let results = [];
        items.forEach(item => {
            switch (item.kind) {
                case kind:
                    results.push(item);
                    break;
                case 'import':
                    if (item.items) {
                        results = results.concat(this.extract(kind, item.items));
                    }
                    //console.log(`<todo: recurse into "${item.path}">`);
                    //results.push(this.extract(item));
                    break;
            }
        });
        return results;
    }
    get recipes() {
        return ManifestAst.extract('recipe', this.ast);
    }
    get stores() {
        return ManifestAst.extract('store', this.ast);
    }
}
