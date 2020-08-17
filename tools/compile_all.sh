#!/bin/sh

rm -rf ../common/dist
tsc -p ../common

rm -rf ../manifest-parser/dist
tsc -p ../manifest-parser

rm -rf ../runtime/dist
tsc -p ../runtime

rm -rf ../tools/recipe2plan/dist
tsc -p ../tools/recipe2plan
