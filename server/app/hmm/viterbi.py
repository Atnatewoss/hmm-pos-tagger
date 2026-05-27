import math

START = "<START>"
END = "<END>"

def viterbi(sentence, hmm):

    words = sentence.split()
    tags = list(hmm.emission_prob.keys())

    dp = [{}]
    backpointer = [{}]

    # INIT
    for tag in tags:
        trans = hmm.transition_prob.get(START, {}).get(tag, 1e-6)
        emit = hmm.emission_prob[tag].get(words[0], 1e-6)

        dp[0][tag] = math.log(trans) + math.log(emit)
        backpointer[0][tag] = None

    # DYNAMIC PROGRAMMING
    for i in range(1, len(words)):
        dp.append({})
        backpointer.append({})

        for tag in tags:
            best_score = float("-inf")
            best_prev = None

            emit = hmm.emission_prob[tag].get(words[i], 1e-6)

            for prev_tag in tags:
                trans = hmm.transition_prob.get(prev_tag, {}).get(tag, 1e-6)

                score = dp[i-1][prev_tag] + math.log(trans) + math.log(emit)

                if score > best_score:
                    best_score = score
                    best_prev = prev_tag

            dp[i][tag] = best_score
            backpointer[i][tag] = best_prev

    # BACKTRACK
    last_tag = max(dp[-1], key=dp[-1].get)
    result = [last_tag]

    for i in range(len(words)-1, 0, -1):
        last_tag = backpointer[i][last_tag]
        result.append(last_tag)

    return list(reversed(result))