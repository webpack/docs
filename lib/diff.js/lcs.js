// Refer to http://www.xmailserver.org/diff2.pdf

// Longest Common Subsequence
// @param A - sequence of atoms - Array
// @param B - sequence of atoms - Array
// @param equals - optional comparator of atoms - returns true or false,
//                 if not specified, triple equals operator is used
// @returns Array - sequence of atoms, one of LCSs, edit script from A to B
var LCS = function (A, B, /* optional */ equals) {
  // We just compare atoms with default equals operator by default
  if (equals === undefined)
    equals = function (a, b) { return a === b; };

  // NOTE: all intervals from now on are both sides inclusive
  // Get the points in Edit Graph, one of the LCS paths goes through.
  // The points are located on the same diagonal and represent the middle
  // snake ([D/2] out of D+1) in the optimal edit path in edit graph.
  // @param startA, endA - substring of A we are working on
  // @param startB, endB - substring of B we are working on
  // @returns Array - [
  //                   [x, y], - beginning of the middle snake
  //                   [u, v], - end of the middle snake
  //                    D,     - optimal edit distance
  //                    LCS ]  - length of LCS
  var findMidSnake = function (startA, endA, startB, endB) {
    var N = endA - startA + 1;
    var M = endB - startB + 1;
    var Max = N + M;
    var Delta = N - M;
    var halfMaxCeil = (Max + 1) / 2 | 0;

    var foundOverlap = false;
    var overlap = null;

    // Maps -Max .. 0 .. +Max, diagonal index to endpoints for furthest reaching
    // D-path on current iteration.
    var V = {};
    // Same but for reversed paths.
    var U = {};

    // Special case for the base case, D = 0, k = 0, x = y = 0
    V[1] = 0;
    // Special case for the base case reversed, D = 0, k = 0, x = N, y = M
    U[Delta - 1] = N;

    // Iterate over each possible length of edit script
    for (var D = 0; D <= halfMaxCeil; D++) {
      // Iterate over each diagonal
      for (var k = -D; k <= D && !overlap; k += 2) {
        // Positions in sequences A and B of furthest going D-path on diagonal k.
        var x, y;

        // Choose from each diagonal we extend
        if (k === -D || (k !== D && V[k - 1] < V[k + 1]))
          // Extending path one point down, that's why x doesn't change, y
          // increases implicitly
          x = V[k + 1];
        else
          // Extending path one point to the right, x increases
          x = V[k - 1] + 1;

        // We can calculate the y out of x and diagonal index.
        y = x - k;

        if (isNaN(y) || x > N || y > M)
          continue;

        var xx = x;
        // Try to extend the D-path with diagonal paths. Possible only if atoms
        // A_x match B_y
        while (x < N && y < M // if there are atoms to compare
               && equals(A[startA + x], B[startB + y])) {
          x++; y++;
        }

        // We can safely update diagonal k, since on every iteration we consider
        // only even or only odd diagonals and the result of one depends only on
        // diagonals of different iteration.
        V[k] = x;

        // Check feasibility, Delta is checked for being odd.
        if ((Delta & 1) === 1 && inRange(k, Delta - (D - 1), Delta + (D - 1)))
          // Forward D-path can overlap with reversed D-1-path
          if (V[k] >= U[k])
            // Found an overlap, the middle snake, convert X-components to dots
            overlap = [xx, x].map(toPoint, k); // XXX ES5
      }

      if (overlap)
        var SES = D * 2 - 1;

      // Iterate over each diagonal for reversed case
      for (var k = -D; k <= D && !overlap; k += 2) {
        // The real diagonal we are looking for is k + Delta
        var K = k + Delta;
        var x, y;
        if (k === D || (k !== -D && U[K - 1] < U[K + 1]))
          x = U[K - 1];
        else
          x = U[K + 1] - 1;

        y = x - K;
        if (isNaN(y) || x < 0 || y < 0)
          continue;
        var xx = x;
        while (x > 0 && y > 0 && equals(A[startA + x - 1], B[startB + y - 1])) {
          x--; y--;
        }
        U[K] = x;

        if (Delta % 2 === 0 && inRange(K, -D, D))
          if (U[K] <= V[K])
            overlap = [x, xx].map(toPoint, K); // XXX ES5
      }

      if (overlap) {
        SES = SES || D * 2;
        // Remember we had offset of each sequence?
        for (var i = 0; i < 2; i++) for (var j = 0; j < 2; j++)
          overlap[i][j] += [startA, startB][j] - i;
        return overlap.concat([ SES, (Max - SES) / 2 ]);
      }
    }
  };

  var lcsAtoms = [];
  var lcs = function (startA, endA, startB, endB) {
    var N = endA - startA + 1;
    var M = endB - startB + 1;

    if (N > 0 && M > 0) {
      var middleSnake = findMidSnake(startA, endA, startB, endB);
      // A[x;u] == B[y,v] and is part of LCS
      var x = middleSnake[0][0], y = middleSnake[0][1];
      var u = middleSnake[1][0], v = middleSnake[1][1];
      var D = middleSnake[2];

      if (D > 1) {
        lcs(startA, x - 1, startB, y - 1);
        if (x <= u) {
          [].push.apply(lcsAtoms, A.slice(x, u + 1));
        }
        lcs(u + 1, endA, v + 1, endB);
      } else if (M > N)
        [].push.apply(lcsAtoms, A.slice(startA, endA + 1));
      else
        [].push.apply(lcsAtoms, B.slice(startB, endB + 1));
    }
  };

  lcs(0, A.length - 1, 0, B.length - 1);
  return lcsAtoms;
};

// Helpers
var inRange = function (x, l, r) {
  return (l <= x && x <= r) || (r <= x && x <= l);
};

// Takes X-component as argument, diagonal as context,
// returns array-pair of form x, y
var toPoint = function (x) {
  return [x, x - this];  // XXX context is not the best way to pass diagonal
};

// Wrappers
LCS.StringLCS = function (A, B) {
  return LCS(A.split(''), B.split('')).join('');
};

// Exports
if (typeof module !== "undefined")
  module.exports = LCS;

