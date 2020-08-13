import {recipe2plan, OutputFormat} from '../dist/recipe2plan.js';
import {ManifestAst} from '../../../manifest/dist/manifest-ast.js';

(async () => {
  const items = await ManifestAst.load(`http://localhost/projects/arcs/arcs/particles/Dataflow/OverviewAction.arcs`);
  console.log(`Parsed ${items.length} item(s)`);
  const ast = new ManifestAst(items);
  const recipes = ast.recipes;
  console.log(`Ast has ${recipes.length} recipe(s)`);
  const stores = ast.stores;
  console.log(`Ast has ${stores.length} store(s)`);
  const serial = await recipe2plan(ast, OutputFormat.Kotlin);
  console.log(serial);
})();

