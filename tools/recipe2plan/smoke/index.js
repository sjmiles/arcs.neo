import {recipe2plan, OutputFormat} from '../dist/recipe2plan.js';
import {ManifestParser} from '../../../manifest-parser/dist/manifest-parser.js';
import {ManifestAstDecorator} from '../../../runtime/dist/manifest/manifest-ast-decorator.js';

(async () => {
  // parse the manifest into a raw AST
  const items = await ManifestParser.load(`http://localhost/projects/arcs/arcs/particles/Dataflow/OverviewAction.arcs`);
  console.log(`Parsed ${items.length} item(s)`);
  // decorate the ast into a usable manifest structure
  const manast = ManifestAstDecorator.decorate(items);
  //
  // TODO(sjmiles): ... this is just a utility thingy, refactor
  const ast = new ManifestParser(items);
  const recipes = ast.recipes;
  console.log(`Ast has ${recipes.length} recipe(s)`);
  const stores = ast.stores;
  console.log(`Ast has ${stores.length} store(s)`);
  const serial = await recipe2plan(ast, OutputFormat.Kotlin);
  console.log(serial);
})();

