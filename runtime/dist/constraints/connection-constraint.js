/**
 * @license
 * Copyright (c) 2017 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
// import {assert} from '../../platform/assert-web.js';
// import {ParticleSpec} from '../particle-spec.js';
// import {Direction, RELAXATION_KEYWORD} from '../manifest-ast-nodes.js';
// import {Handle} from './handle.js';
import { compareArrays, compareComparables, compareStrings, compareBools } from './comparable.js';
// import {Recipe, RecipeComponent, CloneMap, ToStringOptions} from './recipe.js';
// import {Particle} from './particle.js';
const assert = (...any) => { };
const RELAXATION_KEYWORD = 'frankiesez';
export class EndPoint {
}
export class ParticleEndPoint extends EndPoint {
    constructor(particle, connection) {
        super();
        this.particle = particle;
        this.connection = connection;
    }
    _clone(cloneMap) {
        return new ParticleEndPoint(this.particle, this.connection);
    }
    _compareTo(other) {
        let cmp;
        if ((cmp = compareStrings(this.particle.name, other.particle.name)) !== 0)
            return cmp;
        if ((cmp = compareStrings(this.connection, other.connection)) !== 0)
            return cmp;
        return 0;
    }
    toString(nameMap) {
        if (!this.connection) {
            return `${this.particle.name}`;
        }
        return `${this.particle.name}.${this.connection}`;
    }
}
export class InstanceEndPoint extends EndPoint {
    constructor(instance, connection) {
        super();
        assert(instance);
        //this.recipe = instance.recipe;
        this.instance = instance;
        this.connection = connection;
    }
    _clone(cloneMap) {
        return new InstanceEndPoint(cloneMap.get(this.instance), this.connection);
    }
    _compareTo(other) {
        let cmp;
        if ((cmp = compareComparables(this.instance, other.instance)) !== 0)
            return cmp;
        if ((cmp = compareStrings(this.connection, other.connection)) !== 0)
            return cmp;
        return 0;
    }
    toString(nameMap) {
        if (!this.connection) {
            return `${nameMap.get(this.instance)}`;
        }
        return `${nameMap.get(this.instance)}.${this.connection}`;
    }
}
export class HandleEndPoint extends EndPoint {
    constructor(handle) {
        super();
        this.handle = handle;
    }
    _clone(cloneMap = undefined) {
        return new HandleEndPoint(this.handle);
    }
    _compareTo(other) {
        let cmp;
        if ((cmp = compareStrings(this.handle.localName, other.handle.localName)) !== 0)
            return cmp;
        return 0;
    }
    toString(nameMap = undefined) {
        return `${this.handle.localName}`;
    }
}
export class TagEndPoint extends EndPoint {
    constructor(tags) {
        super();
        this.tags = tags;
    }
    _clone(cloneMap = undefined) {
        return new TagEndPoint(this.tags);
    }
    _compareTo(other) {
        let cmp;
        if ((cmp = compareArrays(this.tags, other.tags, compareStrings)) !== 0)
            return cmp;
        return 0;
    }
    // TODO: nameMap is not used. Remove it?
    toString(nameMap = undefined) {
        return this.tags.map(a => `#${a}`).join(' ');
    }
}
//type EndPoint = ParticleEndPoint | InstanceEndPoint | HandleEndPoint | TagEndPoint;
export class ConnectionConstraint {
    constructor(fromConnection, toConnection, direction, relaxed, type) {
        assert(direction);
        assert(type);
        this.from = fromConnection;
        this.to = toConnection;
        this.direction = direction;
        this.relaxed = relaxed;
        this.type = type;
        Object.freeze(this);
    }
    _copyInto(recipe, cloneMap) {
        if (this.type === 'constraint') {
            if (this.from instanceof InstanceEndPoint || this.to instanceof InstanceEndPoint) {
                assert(false, `Can't have connection constraints of type constraint with InstanceEndPoints`);
            }
            else {
                return recipe.newConnectionConstraint(this.from._clone(), this.to._clone(), this.direction, this.relaxed);
            }
        }
        return recipe.newObligation(this.from._clone(cloneMap), this.to._clone(cloneMap), this.direction, this.relaxed);
    }
    _compareTo(other) {
        let cmp;
        if ((cmp = this.from._compareTo(other.from)) !== 0)
            return cmp;
        if ((cmp = this.to._compareTo(other.to)) !== 0)
            return cmp;
        if ((cmp = compareStrings(this.direction, other.direction)) !== 0)
            return cmp;
        if ((cmp = compareBools(this.relaxed, other.relaxed)) !== 0)
            return cmp;
        return 0;
    }
    toString(nameMap, options) {
        const subresults = [
            `${this.from.toString(nameMap)}:`,
            this.direction !== 'any' ? this.direction : '',
            this.relaxed ? RELAXATION_KEYWORD : '',
            this.to.toString(nameMap)
        ];
        if (options && options.showUnresolved === true && this.type === 'obligation') {
            subresults.push('// unresolved obligation');
        }
        return subresults.filter(s => s !== '').join(' ');
    }
}
