// import LCS if in node
if (typeof LCS === 'undefined')
  var LCS = require('./lcs.js');

// Diff sequence
// @param A - sequence of atoms - Array
// @param B - sequence of atoms - Array
// @param equals - optional comparator of atoms - returns true or false,
//                 if not specified, triple equals operator is used
// @returns Array - sequence of objects in a form of:
//   - operation: one of "none", "add", "delete"
//   - atom: the atom found in either A or B
// Applying operations from diff sequence you should be able to transform A to B
var diff = function (A, B, equals) {
  // We just compare atoms with default equals operator by default
  if (equals === undefined)
    equals = function (a, b) { return a === b; };

  var diff = [];
  var i = 0, j = 0;
  var N = A.length, M = B.length, K = 0;

  while (i < N && j < M && equals(A[i], B[j]))
    i++, j++;

  while (i < N && j < M && equals(A[N-1], B[M-1]))
    N--, M--, K++;

  [].push.apply(diff, A.slice(0, i).map(function (atom) {
    return { operation: "none", atom: atom }; }));

  var lcs = LCS(A.slice(i, N), B.slice(j, M), equals);

  for (var k = 0; k < lcs.length; k++) {
    var atom = lcs[k];
    var ni = customIndexOf.call(A, atom, i, equals);
    var nj = customIndexOf.call(B, atom, j, equals);

    // XXX ES5 map
    // Delete unmatched atoms from A
    [].push.apply(diff, A.slice(i, ni).map(function (atom) {
      return { operation: "delete", atom: atom };
    }));

    // Add unmatched atoms from B
    [].push.apply(diff, B.slice(j, nj).map(function (atom) {
      return { operation: "add", atom: atom };
    }));

    // Add the atom found in both sequences
    diff.push({ operation: "none", atom: atom });

    i = ni + 1;
    j = nj + 1;
  }

  // Don't forget about the rest

  [].push.apply(diff, A.slice(i, N).map(function (atom) {
    return { operation: "delete", atom: atom };
  }));

  [].push.apply(diff, B.slice(j, M).map(function (atom) {
    return { operation: "add", atom: atom };
  }));

  [].push.apply(diff, A.slice(N, N + K).map(function (atom) {
    return { operation: "none", atom: atom }; }));

  return diff;
};

// Accepts custom comparator
var customIndexOf = function(item, start, equals){
  var arr = this;
  for (var i = start; i < arr.length; i++)
    if (equals(item, arr[i]))
      return i;
  return -1;
};

// Exports
if (typeof module !== "undefined")
  module.exports = diff;

