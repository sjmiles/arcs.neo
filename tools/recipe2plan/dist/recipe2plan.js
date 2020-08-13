import { AllocatorRecipeResolver } from './allocator-recipe-resolver.js';
import { PlanGenerator } from './plan-generator.js';
// import {assert} from '../../platform/assert-node.js';
// import {encodePlansToProto} from '../manifest2proto.js';
// import {Manifest} from '../../runtime/manifest.js';
// import {IngressValidation} from '../../runtime/policy/ingress-validation.js';
export var OutputFormat;
(function (OutputFormat) {
    OutputFormat[OutputFormat["Kotlin"] = 0] = "Kotlin";
    OutputFormat[OutputFormat["Proto"] = 1] = "Proto";
})(OutputFormat || (OutputFormat = {}));
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
export const recipe2plan = async (manifest, format, policiesManifest, //: Manifest,
recipeFilter, salt = `salt_${Math.random()}`) => {
    // construct plans from `manifest`
    let plans = await (new AllocatorRecipeResolver(manifest, salt)).resolve();
    console.log('Plans:', plans);
    // filter and validate
    plans = filterPlans(plans, recipeFilter);
    validatePlans(plans, policiesManifest);
    // output
    return outputPlans(plans, format);
};
const filterPlans = (plans, recipeFilter) => {
    if (recipeFilter) {
        plans = plans.filter(p => p.name === recipeFilter);
        if (plans.length === 0) {
            throw Error(`Recipe '${recipeFilter}' not found.`);
        }
    }
    return plans;
};
const validatePlans = (plans, policiesManifest) => {
    if (!policiesManifest) {
        return plans;
    }
    const validator = null; //new IngressValidation(policiesManifest.policies);
    return plans.filter(plan => {
        const result = validator.validateIngressCapabilities(plan);
        if (!result.success) {
            console.log(`Failed ingress validation for plan ${plan.name}: ${result.toString()}`);
        }
    });
};
const outputPlans = (plans, format) => {
    switch (format) {
        case OutputFormat.Kotlin:
            //assert(manifest.meta.namespace, `Namespace is required in '${manifest.fileName}' for Kotlin code generation.`);
            return new PlanGenerator(plans, '' /*manifest.meta.namespace,*/ /* ingressValidation*/).generate();
        //return plans;
        case OutputFormat.Proto:
            // TODO(b/161818898): pass ingress validation to protos too.
            //return Buffer.from(await encodePlansToProto(plans, manifest));
            return plans;
        default:
            throw new Error('Output Format should be Kotlin or Proto');
    }
};
