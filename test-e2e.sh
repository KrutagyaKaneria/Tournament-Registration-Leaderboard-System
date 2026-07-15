#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:5000}"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

pass() { echo -e "${GREEN}✓ PASS${NC} — $1"; }
fail() { echo -e "${RED}✗ FAIL${NC} — $1"; exit 1; }
step() { echo -e "\n${YELLOW}━━━ Step $1 ━━━${NC} $2"; }
header() { echo -e "${YELLOW}$1${NC}"; }

# Helper: extract JSON field (works with or without jq)
field() {
  if command -v jq &>/dev/null; then
    echo "$1" | jq -r "$2"
  else
    echo "$1" | grep -o "\"${2#.}\"[[:space:]]*:[[:space:]]*\"[^\"]*\"" | head -1 | sed 's/.*: *"//; s/"$//'
  fi
}

field_num() {
  if command -v jq &>/dev/null; then
    echo "$1" | jq -r "$2"
  else
    echo "$1" | grep -o "\"${2#.}\"[[:space:]]*:[[:space:]]*[0-9.]*" | head -1 | sed 's/.*: *//'
  fi
}

echo ""
header "╔══════════════════════════════════════════════════════╗"
header "║  Tournament Registration & Leaderboard — E2E Test   ║"
header "╚══════════════════════════════════════════════════════╝"
header "  Base URL: $BASE_URL"

# ──────────────────────────────────────────────
# Step 1: Create 3 players
# ──────────────────────────────────────────────
step 1 "Create 3 players"

RES=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/players" \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@test.com","country":"Canada"}')
CODE=$(echo "$RES" | tail -1); BODY=$(echo "$RES" | sed '$d')
[ "$CODE" = "201" ] && pass "Player 1 created (201)" || fail "Expected 201, got $CODE"
P1=$(field "$BODY" ".data.id")
echo "  Player 1 (Alice): $P1"

RES=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/players" \
  -H "Content-Type: application/json" \
  -d '{"name":"Bob","email":"bob@test.com","country":"UK"}')
CODE=$(echo "$RES" | tail -1); BODY=$(echo "$RES" | sed '$d')
[ "$CODE" = "201" ] && pass "Player 2 created (201)" || fail "Expected 201, got $CODE"
P2=$(field "$BODY" ".data.id")
echo "  Player 2 (Bob): $P2"

RES=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/players" \
  -H "Content-Type: application/json" \
  -d '{"name":"Charlie","email":"charlie@test.com","country":"Australia"}')
CODE=$(echo "$RES" | tail -1); BODY=$(echo "$RES" | sed '$d')
[ "$CODE" = "201" ] && pass "Player 3 created (201)" || fail "Expected 201, got $CODE"
P3=$(field "$BODY" ".data.id")
echo "  Player 3 (Charlie): $P3"

# ──────────────────────────────────────────────
# Step 2: Create tournament (maxPlayers: 2)
# ──────────────────────────────────────────────
step 2 "Create tournament with maxPlayers: 2"

RES=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/tournaments" \
  -H "Content-Type: application/json" \
  -d '{"name":"Spring Championship","maxPlayers":2}')
CODE=$(echo "$RES" | tail -1); BODY=$(echo "$RES" | sed '$d')
[ "$CODE" = "201" ] && pass "Tournament created (201)" || fail "Expected 201, got $CODE"
T1=$(field "$BODY" ".data.id")
echo "  Tournament: $T1"

# ──────────────────────────────────────────────
# Step 3: Register player 1 and player 2
# ──────────────────────────────────────────────
step 3 "Register player 1 and player 2"

RES=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/tournaments/$T1/register" \
  -H "Content-Type: application/json" \
  -d "{\"playerId\":\"$P1\"}")
CODE=$(echo "$RES" | tail -1); BODY=$(echo "$RES" | sed '$d')
[ "$CODE" = "201" ] && pass "Player 1 registered (201)" || fail "Expected 201, got $CODE"

RES=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/tournaments/$T1/register" \
  -H "Content-Type: application/json" \
  -d "{\"playerId\":\"$P2\"}")
CODE=$(echo "$RES" | tail -1); BODY=$(echo "$RES" | sed '$d')
[ "$CODE" = "201" ] && pass "Player 2 registered (201)" || fail "Expected 201, got $CODE"

# ──────────────────────────────────────────────
# Step 4: Register player 3 — should fail (tournament full)
# ──────────────────────────────────────────────
step 4 "Register player 3 — expect 400 Tournament is full"

RES=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/tournaments/$T1/register" \
  -H "Content-Type: application/json" \
  -d "{\"playerId\":\"$P3\"}")
CODE=$(echo "$RES" | tail -1); BODY=$(echo "$RES" | sed '$d')
[ "$CODE" = "400" ] && pass "Got 400 as expected" || fail "Expected 400, got $CODE"
MSG=$(field "$BODY" ".message")
echo "  Message: $MSG"

# ──────────────────────────────────────────────
# Step 5: Register player 1 again — should fail (duplicate)
# ──────────────────────────────────────────────
step 5 "Register player 1 again — expect 409 duplicate"

RES=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/tournaments/$T1/register" \
  -H "Content-Type: application/json" \
  -d "{\"playerId\":\"$P1\"}")
CODE=$(echo "$RES" | tail -1); BODY=$(echo "$RES" | sed '$d')
[ "$CODE" = "409" ] && pass "Got 409 as expected" || fail "Expected 409, got $CODE"
MSG=$(field "$BODY" ".message")
echo "  Message: $MSG"

# ──────────────────────────────────────────────
# Step 6: Submit scores for player 1 and player 2
# ──────────────────────────────────────────────
step 6 "Submit scores: Alice=1500, Bob=1200"

RES=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/tournaments/$T1/score" \
  -H "Content-Type: application/json" \
  -d "{\"playerId\":\"$P1\",\"score\":1500}")
CODE=$(echo "$RES" | tail -1); BODY=$(echo "$RES" | sed '$d')
[ "$CODE" = "200" ] && pass "Alice score submitted (200)" || fail "Expected 200, got $CODE"

RES=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/tournaments/$T1/score" \
  -H "Content-Type: application/json" \
  -d "{\"playerId\":\"$P2\",\"score\":1200}")
CODE=$(echo "$RES" | tail -1); BODY=$(echo "$RES" | sed '$d')
[ "$CODE" = "200" ] && pass "Bob score submitted (200)" || fail "Expected 200, got $CODE"

# ──────────────────────────────────────────────
# Step 7: Re-submit score for player 1 — should update
# ──────────────────────────────────────────────
step 7 "Re-submit Alice score (1800) — expect 200 update"

RES=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/tournaments/$T1/score" \
  -H "Content-Type: application/json" \
  -d "{\"playerId\":\"$P1\",\"score\":1800}")
CODE=$(echo "$RES" | tail -1); BODY=$(echo "$RES" | sed '$d')
[ "$CODE" = "200" ] && pass "Got 200" || fail "Expected 200, got $CODE"
SCORE=$(field_num "$BODY" ".data.score")
[ "$SCORE" = "1800" ] && pass "Score updated to 1800" || fail "Expected score 1800, got $SCORE"

# ──────────────────────────────────────────────
# Step 8: Fetch leaderboard — confirm ranking
# ──────────────────────────────────────────────
step 8 "Fetch leaderboard — expect Alice rank 1, Bob rank 2"

RES=$(curl -s -w "\n%{http_code}" "$BASE_URL/tournaments/$T1/leaderboard")
CODE=$(echo "$RES" | tail -1); BODY=$(echo "$RES" | sed '$d')
[ "$CODE" = "200" ] && pass "Got 200" || fail "Expected 200, got $CODE"

echo ""
header "  Leaderboard:"
if command -v jq &>/dev/null; then
  echo "$BODY" | jq -r '.data[] | "  Rank \(.rank) | \(.name) | Score: \(.score)"'
else
  echo "  (install jq for pretty output, showing raw)"
  echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
fi
echo ""

# Verify Alice is rank 1, Bob is rank 2
if command -v jq &>/dev/null; then
  R1_NAME=$(echo "$BODY" | jq -r '.data[0].name')
  R1_SCORE=$(echo "$BODY" | jq -r '.data[0].score')
  R2_NAME=$(echo "$BODY" | jq -r '.data[1].name')
  R2_SCORE=$(echo "$BODY" | jq -r '.data[1].score')
  R1_RANK=$(echo "$BODY" | jq -r '.data[0].rank')
  R2_RANK=$(echo "$BODY" | jq -r '.data[1].rank')

  [ "$R1_NAME" = "Alice" ] && [ "$R1_SCORE" = "1800" ] && [ "$R1_RANK" = "1" ] \
    && pass "1st place: Alice (1800)" || fail "Expected Alice at rank 1 with 1800"
  [ "$R2_NAME" = "Bob" ] && [ "$R2_SCORE" = "1200" ] && [ "$R2_RANK" = "2" ] \
    && pass "2nd place: Bob (1200)" || fail "Expected Bob at rank 2 with 1200"
else
  echo "  (install jq to run ranking assertions automatically)"
fi

# ──────────────────────────────────────────────
# Step 9: Fetch player 1's individual rank
# ──────────────────────────────────────────────
step 9 "Fetch Alice's individual rank — expect rank 1, score 1800"

RES=$(curl -s -w "\n%{http_code}" "$BASE_URL/tournaments/$T1/player/$P1")
CODE=$(echo "$RES" | tail -1); BODY=$(echo "$RES" | sed '$d')
[ "$CODE" = "200" ] && pass "Got 200" || fail "Expected 200, got $CODE"

if command -v jq &>/dev/null; then
  NAME=$(echo "$BODY" | jq -r '.data.name')
  RANK=$(echo "$BODY" | jq -r '.data.rank')
  SCORE=$(echo "$BODY" | jq -r '.data.score')
  [ "$NAME" = "Alice" ] && [ "$RANK" = "1" ] && [ "$SCORE" = "1800" ] \
    && pass "Alice rank=1, score=1800 — matches leaderboard" \
    || fail "Expected rank 1 score 1800, got rank=$RANK score=$SCORE"
else
  echo "  Raw: $BODY"
fi

# ──────────────────────────────────────────────
# Step 10: Submit score for unregistered player 3 — should fail
# ──────────────────────────────────────────────
step 10 "Submit score for Charlie (unregistered) — expect 403"

RES=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/tournaments/$T1/score" \
  -H "Content-Type: application/json" \
  -d "{\"playerId\":\"$P3\",\"score\":900}")
CODE=$(echo "$RES" | tail -1); BODY=$(echo "$RES" | sed '$d')
[ "$CODE" = "403" ] && pass "Got 403 as expected" || fail "Expected 403, got $CODE"
MSG=$(field "$BODY" ".message")
echo "  Message: $MSG"

# ──────────────────────────────────────────────
# Done
# ──────────────────────────────────────────────
echo ""
header "╔══════════════════════════════════════════════════════╗"
header "║            All 10 steps passed!                      ║"
header "╚══════════════════════════════════════════════════════╝"
echo ""
