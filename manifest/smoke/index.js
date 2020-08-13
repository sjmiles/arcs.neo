
import {fetch} from '../../fetch.js';
import {ManifestAst} from '../build/manifest-ast.js';

const go = async () => {
  const path = 'http://localhost/projects/arcs/arcs/particles/Dataflow/OverviewAction.arcs';
  const response = await fetch(path);
  const content = await response.text();
  const ast = await ManifestAst.parse(content, {filename: path});
  //console.log(JSON.stringify(ast, null, '  '));
  ast.forEach(item => console.log(item.kind));
};

go();
